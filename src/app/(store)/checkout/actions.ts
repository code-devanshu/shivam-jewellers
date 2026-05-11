"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/customer-auth";
import { getLiveRates } from "@/lib/live-rates";
import { calculatePrice } from "@/lib/price";
import { generateInvoicePDF, type InvoiceData } from "@/lib/invoice-pdf";
import { sendInvoiceEmail } from "@/lib/resend";
import {
  createRazorpayOrder as rzpCreateOrder,
  verifyRazorpaySignature,
  razorpayKeyId,
} from "@/lib/razorpay";

// ─── Public types ─────────────────────────────────────────────────────────────

export type DeliveryAddress = {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
};

export type CheckoutInput = {
  deliveryType: "HOME_DELIVERY" | "STORE_PICKUP";
  address?: DeliveryAddress;
  notes?: string;
};

// ─── Private helpers ──────────────────────────────────────────────────────────

async function nextOrderNumber(): Promise<string> {
  const count = await db.order.count();
  const year = new Date().getFullYear();
  return `SJ-${year}-${String(count + 1).padStart(5, "0")}`;
}

async function getCartWithProducts(customerId: string) {
  const cart = await db.cart.findUnique({
    where: { customerId },
    include: {
      items: {
        include: {
          product: { include: { metal: true } },
          variant: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return cart?.items ?? [];
}

type RawCartItem = Awaited<ReturnType<typeof getCartWithProducts>>[number];
type LiveRates = Awaited<ReturnType<typeof getLiveRates>>;

function buildVariantLabel(variant: RawCartItem["variant"]): string | null {
  if (!variant) return null;
  const parts: string[] = [];
  if (variant.size) parts.push(`Size ${variant.size}`);
  if (variant.gemstone && variant.gemstone !== "None") parts.push(variant.gemstone);
  return parts.length > 0 ? parts.join(" · ") : null;
}

type OrderItemPayload = {
  productId: string;
  variantId: string | null;
  productName: string;
  variantLabel: string | null;
  metalName: string;
  purity: string;
  weightGrams: number;
  metalRate: number;
  makingCharge: number;
  makingChargeType: "PERCENT" | "FIXED";
  gstPercent: number;
  additionalPrice: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type CartTotals = { subtotal: number; gstAmount: number; totalAmount: number };

function buildLineItems(
  cartItems: RawCartItem[],
  rates: LiveRates
): { items: OrderItemPayload[]; totals: CartTotals } {
  let subtotal = 0;
  let gstAmount = 0;

  const items: OrderItemPayload[] = cartItems.map((ci) => {
    const { product, variant, quantity } = ci;
    const rate = rates.find((r) => r.metalId === product.metalId);
    const ratePerGram = rate?.ratePerGram ?? 0;
    const additionalPrice = Number(variant?.additionalPrice ?? 0);

    const breakdown = calculatePrice(
      {
        purityPercent: Number(product.purityPercent),
        weightGrams: Number(product.weightGrams),
        makingChargeType: product.makingChargeType,
        makingCharge: Number(product.makingCharge),
        gstPercent: Number(product.gstPercent),
      },
      ratePerGram,
      additionalPrice
    );

    subtotal += breakdown.basePrice * quantity;
    gstAmount += breakdown.gstAmount * quantity;

    return {
      productId: product.id,
      variantId: variant?.id ?? null,
      productName: product.name,
      variantLabel: buildVariantLabel(variant),
      metalName: product.metal.name,
      purity: product.purity,
      weightGrams: Number(product.weightGrams),
      metalRate: ratePerGram,
      makingCharge: Number(product.makingCharge),
      makingChargeType: product.makingChargeType,
      gstPercent: Number(product.gstPercent),
      additionalPrice,
      quantity,
      unitPrice: breakdown.totalPrice,
      totalPrice: breakdown.totalPrice * quantity,
    };
  });

  return { items, totals: { subtotal, gstAmount, totalAmount: subtotal + gstAmount } };
}

type InvoiceItemInput = Pick<
  OrderItemPayload,
  | "productName"
  | "variantLabel"
  | "metalName"
  | "purity"
  | "weightGrams"
  | "metalRate"
  | "makingCharge"
  | "makingChargeType"
  | "gstPercent"
  | "additionalPrice"
  | "quantity"
  | "unitPrice"
  | "totalPrice"
>;

async function issueInvoice(opts: {
  orderId: string;
  orderNumber: string;
  orderDate: Date;
  customer: { name?: string | null; email?: string | null; phone?: string | null };
  deliveryType: "HOME_DELIVERY" | "STORE_PICKUP";
  deliveryAddress: DeliveryAddress | null;
  items: InvoiceItemInput[];
  totals: CartTotals;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string | null;
}): Promise<void> {
  const invoiceData: InvoiceData = {
    invoiceNumber: opts.orderNumber,
    orderNumber: opts.orderNumber,
    orderDate: opts.orderDate,
    customer: opts.customer,
    deliveryAddress: opts.deliveryAddress,
    deliveryType: opts.deliveryType,
    items: opts.items,
    subtotal: opts.totals.subtotal,
    gstAmount: opts.totals.gstAmount,
    totalAmount: opts.totals.totalAmount,
    paymentMethod: opts.paymentMethod,
    paymentStatus: opts.paymentStatus,
    notes: opts.notes,
  };

  const pdfBuffer = await generateInvoicePDF(invoiceData);

  await db.invoice.create({
    data: { orderId: opts.orderId, invoiceNumber: opts.orderNumber },
  });

  if (opts.customer.email) {
    try {
      await sendInvoiceEmail({
        to: opts.customer.email,
        customerName: opts.customer.name ?? "Valued Customer",
        orderNumber: opts.orderNumber,
        pdfBuffer,
      });
      await db.invoice.update({
        where: { orderId: opts.orderId },
        data: { emailedAt: new Date() },
      });
    } catch (err) {
      console.error("[invoice] Email failed:", err);
    }
  }
}

async function saveAddress(
  customerId: string,
  input: CheckoutInput
): Promise<string | undefined> {
  if (input.deliveryType === "HOME_DELIVERY" && input.address) {
    const addr = await db.address.create({
      data: { customerId, ...input.address },
    });
    return addr.id;
  }
}

// ─── Action: COD ──────────────────────────────────────────────────────────────

export async function placeOrderCOD(input: CheckoutInput): Promise<void> {
  const customerId = await requireCustomer("/checkout");
  const customer = await db.customer.findUniqueOrThrow({ where: { id: customerId } });

  const cartItems = await getCartWithProducts(customerId);
  if (cartItems.length === 0) redirect("/cart");

  const rates = await getLiveRates();
  const { items, totals } = buildLineItems(cartItems, rates);

  const orderNumber = await nextOrderNumber();
  const goldRate = rates.find((r) => r.metalId === "metal-gold")?.ratePerGram;
  const silverRate = rates.find((r) => r.metalId === "metal-silver")?.ratePerGram;
  const addressId = await saveAddress(customerId, input);

  const order = await db.order.create({
    data: {
      orderNumber,
      customerId,
      addressId,
      deliveryType: input.deliveryType,
      status: "CONFIRMED",
      paymentStatus: "PENDING",
      paymentMethod: "COD",
      subtotal: totals.subtotal,
      gstAmount: totals.gstAmount,
      totalAmount: totals.totalAmount,
      notes: input.notes,
      goldRateAtOrder: goldRate,
      silverRateAtOrder: silverRate,
      items: { create: items },
      statusHistory: {
        create: { status: "CONFIRMED", note: "Order placed — Cash on Delivery" },
      },
    },
  });

  await db.cartItem.deleteMany({ where: { cart: { customerId } } });
  revalidatePath("/cart");

  for (const item of items) {
    const updated = await db.product.update({
      where: { id: item.productId },
      data: { stockQty: { decrement: item.quantity } },
      select: { stockQty: true },
    });
    if (updated.stockQty <= 0) {
      await db.product.update({
        where: { id: item.productId },
        data: { stockQty: 0, isAvailable: false },
      });
    }
  }

  await issueInvoice({
    orderId: order.id,
    orderNumber,
    orderDate: order.createdAt,
    customer,
    deliveryType: input.deliveryType,
    deliveryAddress: input.address ?? null,
    items,
    totals,
    paymentMethod: "COD",
    paymentStatus: "PENDING",
    notes: input.notes,
  });

  redirect(`/checkout/success/${order.id}`);
}

// ─── Action: Razorpay init ─────────────────────────────────────────────────────

export async function initRazorpayCheckout(input: CheckoutInput): Promise<{
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  keyId: string;
}> {
  const customerId = await requireCustomer("/checkout");

  const cartItems = await getCartWithProducts(customerId);
  if (cartItems.length === 0) redirect("/cart");

  const rates = await getLiveRates();
  const { items, totals } = buildLineItems(cartItems, rates);

  const orderNumber = await nextOrderNumber();
  const goldRate = rates.find((r) => r.metalId === "metal-gold")?.ratePerGram;
  const silverRate = rates.find((r) => r.metalId === "metal-silver")?.ratePerGram;
  const addressId = await saveAddress(customerId, input);

  const order = await db.order.create({
    data: {
      orderNumber,
      customerId,
      addressId,
      deliveryType: input.deliveryType,
      status: "PENDING_PAYMENT",
      paymentStatus: "PENDING",
      paymentMethod: "RAZORPAY",
      subtotal: totals.subtotal,
      gstAmount: totals.gstAmount,
      totalAmount: totals.totalAmount,
      notes: input.notes,
      goldRateAtOrder: goldRate,
      silverRateAtOrder: silverRate,
      items: { create: items },
      statusHistory: {
        create: { status: "PENDING_PAYMENT", note: "Awaiting online payment" },
      },
    },
  });

  const amountInPaise = Math.round(totals.totalAmount * 100);
  const rzpOrder = await rzpCreateOrder(amountInPaise, order.id);

  await db.order.update({
    where: { id: order.id },
    data: { razorpayOrderId: rzpOrder.id },
  });

  return {
    orderId: order.id,
    razorpayOrderId: rzpOrder.id,
    amount: amountInPaise,
    keyId: razorpayKeyId(),
  };
}

// ─── Action: Razorpay verify ───────────────────────────────────────────────────

export async function verifyAndConfirmPayment(params: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<void> {
  const customerId = await requireCustomer();

  if (
    !verifyRazorpaySignature(
      params.razorpayOrderId,
      params.razorpayPaymentId,
      params.razorpaySignature
    )
  ) {
    throw new Error("Payment verification failed. Please contact support.");
  }

  const order = await db.order.findUnique({
    where: { id: params.orderId },
    include: { items: true, address: true, customer: true },
  });

  if (!order || order.customerId !== customerId) {
    throw new Error("Order not found.");
  }

  if (order.status !== "PENDING_PAYMENT") {
    redirect(`/checkout/success/${order.id}`);
  }

  await db.order.update({
    where: { id: order.id },
    data: {
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentId: params.razorpayPaymentId,
    },
  });

  await db.orderStatusHistory.create({
    data: {
      orderId: order.id,
      status: "CONFIRMED",
      note: `Payment received (${params.razorpayPaymentId})`,
    },
  });

  await db.cartItem.deleteMany({ where: { cart: { customerId } } });
  revalidatePath("/cart");

  for (const item of order.items) {
    const updated = await db.product.update({
      where: { id: item.productId },
      data: { stockQty: { decrement: item.quantity } },
      select: { stockQty: true },
    });
    if (updated.stockQty <= 0) {
      await db.product.update({
        where: { id: item.productId },
        data: { stockQty: 0, isAvailable: false },
      });
    }
  }

  const deliveryAddress = order.address
    ? {
        name: order.address.name,
        phone: order.address.phone,
        line1: order.address.line1,
        line2: order.address.line2 ?? undefined,
        city: order.address.city,
        state: order.address.state,
        pincode: order.address.pincode,
      }
    : null;

  const invoiceItems: InvoiceItemInput[] = order.items.map((item) => ({
    productName: item.productName,
    variantLabel: item.variantLabel,
    metalName: item.metalName,
    purity: item.purity,
    weightGrams: Number(item.weightGrams),
    metalRate: Number(item.metalRate ?? 0),
    makingCharge: Number(item.makingCharge ?? 0),
    makingChargeType: (item.makingChargeType ?? "FIXED") as "PERCENT" | "FIXED",
    gstPercent: Number(item.gstPercent ?? 0),
    additionalPrice: Number(item.additionalPrice ?? 0),
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    totalPrice: Number(item.totalPrice),
  }));

  await issueInvoice({
    orderId: order.id,
    orderNumber: order.orderNumber,
    orderDate: order.createdAt,
    customer: order.customer,
    deliveryType: order.deliveryType as "HOME_DELIVERY" | "STORE_PICKUP",
    deliveryAddress,
    items: invoiceItems,
    totals: {
      subtotal: Number(order.subtotal),
      gstAmount: Number(order.gstAmount),
      totalAmount: Number(order.totalAmount),
    },
    paymentMethod: "RAZORPAY",
    paymentStatus: "PAID",
    notes: order.notes,
  });

  redirect(`/checkout/success/${order.id}`);
}
