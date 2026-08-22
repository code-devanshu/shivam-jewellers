"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
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
import { checkPincodeServiceability, calculateShippingCost, getExpectedDelivery } from "@/lib/delhivery";

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

export type BuyNowItem = {
  productId: string;
  variantId: string | null;
};

export type CheckoutInput = {
  deliveryType: "HOME_DELIVERY" | "STORE_PICKUP";
  address?: DeliveryAddress;
  notes?: string;
  email?: string;
  buyNow?: BuyNowItem;
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

// Structural subset of RawCartItem — lets a single freshly-fetched "buy now" product
// stand in for a real persisted CartItem in the pricing/weight helpers below.
type LineSource = {
  product: RawCartItem["product"];
  variant: RawCartItem["variant"];
  quantity: number;
};

// Fetches a single product (+ optional variant) fresh from the DB for the "Buy Now"
// skip-cart flow — never touches the customer's persisted cart. Returns [] if the
// product is missing or no longer available, which callers treat as a hard stop.
async function getBuyNowItem(buyNow: BuyNowItem): Promise<LineSource[]> {
  const product = await db.product.findUnique({
    where: { id: buyNow.productId },
    include: { metal: true },
  });
  if (!product || !product.isAvailable) return [];

  const variant = buyNow.variantId
    ? await db.productVariant.findUnique({ where: { id: buyNow.variantId } })
    : null;

  return [{ product, variant, quantity: 1 }];
}

// Reduces the customer's persisted cart by exactly what was just ordered, rather than
// wiping the whole cart. For a normal cart checkout this empties it completely (ordered
// qty == cart qty for every line, same end result as before). For a "Buy Now" order the
// item was never added to the cart, so nothing matches and this is a no-op — any other
// items already sitting in the cart are left untouched. If the same product/variant was
// independently in the cart too, its saved quantity is reduced by what was just bought,
// which mirrors what a shopper would expect.
async function decrementCartAfterOrder(
  customerId: string,
  items: { productId: string | null; variantId: string | null; quantity: number }[]
): Promise<void> {
  const cart = await db.cart.findUnique({ where: { customerId } });
  if (!cart) return;

  for (const item of items) {
    if (!item.productId) continue;
    const existing = await db.cartItem.findFirst({
      where: { cartId: cart.id, productId: item.productId, variantId: item.variantId },
    });
    if (!existing) continue;
    if (existing.quantity <= item.quantity) {
      await db.cartItem.delete({ where: { id: existing.id } });
    } else {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity - item.quantity },
      });
    }
  }
}

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
  cartItems: LineSource[],
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
  shippingCharge?: number;
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
    shippingCharge: opts.shippingCharge,
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

// Captures an optional receipt email at checkout time, only if the customer
// doesn't already have one on file (phone is the login identifier; email is opt-in).
async function saveEmailIfMissing(customerId: string, email: string | undefined): Promise<void> {
  if (!email) return;
  const trimmed = email.trim();
  if (!trimmed) return;
  const customer = await db.customer.findUnique({ where: { id: customerId }, select: { email: true } });
  if (customer?.email) return;
  try {
    await db.customer.update({ where: { id: customerId }, data: { email: trimmed } });
  } catch (err) {
    // Email is opt-in and just for receipts — if it's already tied to a
    // different customer (unique constraint), skip saving it rather than
    // blocking order placement.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      console.warn(`[checkout] email ${trimmed} already in use by another customer, skipping save`);
      return;
    }
    throw err;
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

// Fail-open on Delhivery API errors (network/5xx) — a flaky third-party API
// should never block a genuine sale. Only an explicit "not serviceable"
// response blocks checkout.
async function isPincodeServiceable(pincode: string): Promise<boolean> {
  try {
    const result = await checkPincodeServiceability(pincode);
    return result.serviceable;
  } catch (err) {
    console.error("[delhivery] pincode check failed:", err);
    return true;
  }
}

// Sums OrderItem.weightGrams * quantity across the cart, floored at the
// package-weight minimum Delhivery expects a chargeable weight to respect.
function computeShipmentWeightGrams(cartItems: LineSource[]): number {
  const totalGrams = cartItems.reduce(
    (sum, ci) => sum + Number(ci.product.weightGrams) * ci.quantity,
    0
  );
  const minGrams = Number(process.env.DELHIVERY_MIN_PACKAGE_WEIGHT_GRAMS ?? 100);
  return Math.max(Math.ceil(totalGrams), minGrams);
}

// Real pickup time isn't known until an admin manually creates the shipment
// (see ShipmentPanel) — this is only used to give the TAT lookup a pickup date
// so it can return a calendar date instead of just a day count.
function nextPickupDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  return d;
}

type ShippingQuote = {
  shippingCharge: number;
  tatDays?: number;
  expectedDeliveryDate?: string;
};

// Fail-open like isPincodeServiceable — a Delhivery outage while quoting
// shouldn't block checkout. Callers that need a charge (order placement) fall
// back to DELHIVERY_FALLBACK_SHIPPING_CHARGE when this returns null.
async function getShippingQuote(
  pincode: string,
  paymentMode: "COD" | "Prepaid",
  weightGrams: number
): Promise<ShippingQuote | null> {
  let cost;
  try {
    cost = await calculateShippingCost({ destinationPincode: pincode, weightGrams, paymentMode });
  } catch (err) {
    console.error("[delhivery] shipping cost lookup failed:", err);
    return null;
  }

  let tat: Awaited<ReturnType<typeof getExpectedDelivery>> | null = null;
  try {
    tat = await getExpectedDelivery({ destinationPincode: pincode, pickupDate: nextPickupDate() });
  } catch (err) {
    console.error("[delhivery] TAT lookup failed:", err);
  }

  return {
    shippingCharge: cost.totalAmount,
    tatDays: tat?.tatDays,
    expectedDeliveryDate: tat?.expectedDeliveryDate,
  };
}

export type ShippingEstimate = {
  serviceable: boolean;
  message?: string;
  shippingCharge?: number;
  tatDays?: number;
  expectedDeliveryDate?: string;
};

export async function checkPincodeAction(
  pincode: string,
  paymentMethod: "COD" | "RAZORPAY",
  buyNow?: BuyNowItem
): Promise<ShippingEstimate> {
  const customerId = await requireCustomer("/checkout");

  if (!/^\d{6}$/.test(pincode)) {
    return { serviceable: false, message: "Enter a valid 6-digit pincode." };
  }
  const serviceable = await isPincodeServiceable(pincode);
  if (!serviceable) {
    return { serviceable: false, message: "Sorry, we currently don't deliver to this pincode." };
  }

  const cartItems = buyNow ? await getBuyNowItem(buyNow) : await getCartWithProducts(customerId);
  if (cartItems.length === 0) {
    return buyNow
      ? { serviceable: false, message: "This item is no longer available." }
      : { serviceable: true };
  }

  const weightGrams = computeShipmentWeightGrams(cartItems);
  const quote = await getShippingQuote(
    pincode,
    paymentMethod === "COD" ? "COD" : "Prepaid",
    weightGrams
  );
  if (!quote) {
    return { serviceable: true };
  }
  return {
    serviceable: true,
    shippingCharge: quote.shippingCharge,
    tatDays: quote.tatDays,
    expectedDeliveryDate: quote.expectedDeliveryDate,
  };
}

// Guest-safe delivery estimate for the product page — unlike checkPincodeAction,
// this has no cart/customer context (no requireCustomer, no shipping charge), it
// just answers "is this pincode serviceable and by when" for anonymous browsing.
export type PdpDeliveryEstimate = {
  serviceable: boolean;
  message?: string;
  tatDays?: number;
  expectedDeliveryDate?: string;
};

export async function getPdpDeliveryEstimateAction(pincode: string): Promise<PdpDeliveryEstimate> {
  if (!/^\d{6}$/.test(pincode)) {
    return { serviceable: false, message: "Enter a valid 6-digit pincode." };
  }

  const serviceable = await isPincodeServiceable(pincode);
  if (!serviceable) {
    return { serviceable: false, message: "Sorry, we currently don't deliver to this pincode." };
  }

  try {
    const tat = await getExpectedDelivery({ destinationPincode: pincode, pickupDate: nextPickupDate() });
    return { serviceable: true, tatDays: tat.tatDays, expectedDeliveryDate: tat.expectedDeliveryDate };
  } catch (err) {
    console.error("[delhivery] PDP TAT lookup failed:", err);
    return { serviceable: true };
  }
}

// ─── Action: COD ──────────────────────────────────────────────────────────────

export async function placeOrderCOD(input: CheckoutInput): Promise<void> {
  const customerId = await requireCustomer("/checkout");
  await saveEmailIfMissing(customerId, input.email);
  const customer = await db.customer.findUniqueOrThrow({ where: { id: customerId } });

  const cartItems = input.buyNow ? await getBuyNowItem(input.buyNow) : await getCartWithProducts(customerId);
  if (cartItems.length === 0) redirect(input.buyNow ? "/products" : "/cart");

  const rates = await getLiveRates();
  const { items, totals } = buildLineItems(cartItems, rates);

  let shippingCharge = 0;
  let estimatedDeliveryDate: Date | undefined;
  if (input.deliveryType === "HOME_DELIVERY" && input.address) {
    if (!(await isPincodeServiceable(input.address.pincode))) {
      throw new Error("Sorry, we currently don't deliver to this pincode.");
    }
    const weightGrams = computeShipmentWeightGrams(cartItems);
    const quote = await getShippingQuote(input.address.pincode, "COD", weightGrams);
    if (quote) {
      shippingCharge = quote.shippingCharge;
      if (quote.expectedDeliveryDate) estimatedDeliveryDate = new Date(quote.expectedDeliveryDate);
    } else {
      shippingCharge = Number(process.env.DELHIVERY_FALLBACK_SHIPPING_CHARGE ?? 150);
      console.error(
        `[delhivery] shipping cost unavailable for pincode ${input.address.pincode}, using fallback charge ₹${shippingCharge}`
      );
    }
  }

  const finalTotalAmount = totals.totalAmount + shippingCharge;

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
      shippingCharge,
      estimatedDeliveryDate,
      totalAmount: finalTotalAmount,
      notes: input.notes,
      goldRateAtOrder: goldRate,
      silverRateAtOrder: silverRate,
      items: { create: items },
      statusHistory: {
        create: { status: "CONFIRMED", note: "Order placed — Cash on Delivery" },
      },
    },
  });

  await decrementCartAfterOrder(customerId, items);
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
    totals: { ...totals, totalAmount: finalTotalAmount },
    shippingCharge,
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
  await saveEmailIfMissing(customerId, input.email);

  const cartItems = input.buyNow ? await getBuyNowItem(input.buyNow) : await getCartWithProducts(customerId);
  if (cartItems.length === 0) redirect(input.buyNow ? "/products" : "/cart");

  const rates = await getLiveRates();
  const { items, totals } = buildLineItems(cartItems, rates);

  let shippingCharge = 0;
  let estimatedDeliveryDate: Date | undefined;
  if (input.deliveryType === "HOME_DELIVERY" && input.address) {
    if (!(await isPincodeServiceable(input.address.pincode))) {
      throw new Error("Sorry, we currently don't deliver to this pincode.");
    }
    const weightGrams = computeShipmentWeightGrams(cartItems);
    const quote = await getShippingQuote(input.address.pincode, "Prepaid", weightGrams);
    if (quote) {
      shippingCharge = quote.shippingCharge;
      if (quote.expectedDeliveryDate) estimatedDeliveryDate = new Date(quote.expectedDeliveryDate);
    } else {
      shippingCharge = Number(process.env.DELHIVERY_FALLBACK_SHIPPING_CHARGE ?? 150);
      console.error(
        `[delhivery] shipping cost unavailable for pincode ${input.address.pincode}, using fallback charge ₹${shippingCharge}`
      );
    }
  }

  const finalTotalAmount = totals.totalAmount + shippingCharge;

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
      shippingCharge,
      estimatedDeliveryDate,
      totalAmount: finalTotalAmount,
      notes: input.notes,
      goldRateAtOrder: goldRate,
      silverRateAtOrder: silverRate,
      items: { create: items },
      statusHistory: {
        create: { status: "PENDING_PAYMENT", note: "Awaiting online payment" },
      },
    },
  });

  const amountInPaise = Math.round(finalTotalAmount * 100);
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

// ─── Shared: Razorpay payment confirmation ─────────────────────────────────────
// Called from both the client-side verifyAndConfirmPayment action (immediately
// after checkout.js reports success) and the /api/webhooks/razorpay route (as a
// server-side reconciliation fallback if the browser never reports back). Both
// callers may race on the same order, so this is written to be idempotent.

export async function confirmRazorpayPayment(params: {
  orderId: string;
  paymentId: string;
}): Promise<"confirmed" | "already_confirmed" | "not_found"> {
  const order = await db.order.findUnique({
    where: { id: params.orderId },
    include: { items: true, address: true, customer: true },
  });

  if (!order) return "not_found";
  if (order.status !== "PENDING_PAYMENT") return "already_confirmed";

  await db.order.update({
    where: { id: order.id },
    data: {
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentId: params.paymentId,
    },
  });

  await db.orderStatusHistory.create({
    data: {
      orderId: order.id,
      status: "CONFIRMED",
      note: `Payment received (${params.paymentId})`,
    },
  });

  await decrementCartAfterOrder(order.customerId, order.items);
  revalidatePath("/cart");

  for (const item of order.items) {
    if (!item.productId) continue;
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
    shippingCharge: order.shippingCharge != null ? Number(order.shippingCharge) : undefined,
    paymentMethod: "RAZORPAY",
    paymentStatus: "PAID",
    notes: order.notes,
  });

  return "confirmed";
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
    select: { customerId: true },
  });

  if (!order || order.customerId !== customerId) {
    throw new Error("Order not found.");
  }

  const result = await confirmRazorpayPayment({
    orderId: params.orderId,
    paymentId: params.razorpayPaymentId,
  });

  if (result === "not_found") {
    throw new Error("Order not found.");
  }

  redirect(`/checkout/success/${params.orderId}`);
}
