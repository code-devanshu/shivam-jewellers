import { redirect } from "next/navigation";
import Script from "next/script";
import { requireCustomer } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import { getLiveRates } from "@/lib/live-rates";
import { calculatePrice } from "@/lib/price";
import type { BuyNowItem } from "./actions";
import CheckoutClient from "./CheckoutClient";

export const metadata = { title: "Checkout", robots: { index: false, follow: false } };

type LiveRates = Awaited<ReturnType<typeof getLiveRates>>;

type SummaryItem = {
  id: string;
  productName: string;
  variantLabel: string | null;
  metalName: string;
  purity: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

function variantLabelFor(variant: { size: string | null; gemstone: string | null } | null): string | null {
  if (!variant) return null;
  const parts: string[] = [];
  if (variant.size) parts.push(`Size ${variant.size}`);
  if (variant.gemstone && variant.gemstone !== "None") parts.push(variant.gemstone);
  return parts.length > 0 ? parts.join(" · ") : null;
}

// Skip-cart "Buy Now" — prices a single freshly-fetched product/variant instead of
// the customer's persisted cart. Redirects back to the product page if it's gone out
// of stock since the button was clicked, or to /products if it's been deleted.
async function buildBuyNowItems(
  buyNow: BuyNowItem,
  rates: LiveRates
): Promise<{ items: SummaryItem[]; subtotal: number; gstAmount: number }> {
  const [product, variant] = await Promise.all([
    db.product.findUnique({
      where: { id: buyNow.productId },
      include: { metal: true, images: { where: { isPrimary: true }, take: 1 } },
    }),
    buyNow.variantId ? db.productVariant.findUnique({ where: { id: buyNow.variantId } }) : Promise.resolve(null),
  ]);

  if (!product) redirect("/products");
  if (!product.isAvailable) redirect(`/products/${product.slug}`);

  const ratesMap = Object.fromEntries(rates.map((r) => [r.metalId, r.ratePerGram]));
  const ratePerGram = ratesMap[product.metalId] ?? 0;
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

  return {
    items: [
      {
        id: `buynow-${product.id}`,
        productName: product.name,
        variantLabel: variantLabelFor(variant),
        metalName: product.metal.name,
        purity: product.purity,
        imageUrl: product.images[0]?.url ?? null,
        quantity: 1,
        unitPrice: breakdown.totalPrice,
        totalPrice: breakdown.totalPrice,
      },
    ],
    subtotal: breakdown.basePrice,
    gstAmount: breakdown.gstAmount,
  };
}

async function buildCartItems(
  customerId: string,
  rates: LiveRates
): Promise<{ items: SummaryItem[]; subtotal: number; gstAmount: number }> {
  const cart = await db.cart.findUnique({
    where: { customerId },
    include: {
      items: {
        include: {
          product: {
            include: {
              metal: true,
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
          variant: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const cartItems = cart?.items ?? [];
  if (cartItems.length === 0) redirect("/cart");

  const ratesMap = Object.fromEntries(rates.map((r) => [r.metalId, r.ratePerGram]));

  let subtotal = 0;
  let gstAmount = 0;

  const items = cartItems.map((ci) => {
    const { product, variant, quantity } = ci;
    const ratePerGram = ratesMap[product.metalId] ?? 0;
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
      id: ci.id,
      productName: product.name,
      variantLabel: variantLabelFor(variant),
      metalName: product.metal.name,
      purity: product.purity,
      imageUrl: product.images[0]?.url ?? null,
      quantity,
      unitPrice: breakdown.totalPrice,
      totalPrice: breakdown.totalPrice * quantity,
    };
  });

  return { items, subtotal, gstAmount };
}

type SearchParams = { buyNow?: string; variant?: string };

type Props = { searchParams: Promise<SearchParams> };

export default async function CheckoutPage({ searchParams }: Props) {
  const params = await searchParams;
  const customerId = await requireCustomer("/checkout");
  const buyNow: BuyNowItem | null = params.buyNow
    ? { productId: params.buyNow, variantId: params.variant || null }
    : null;

  const [customer, rates] = await Promise.all([
    db.customer.findUnique({ where: { id: customerId } }),
    getLiveRates(),
  ]);

  const { items, subtotal, gstAmount } = buyNow
    ? await buildBuyNowItems(buyNow, rates)
    : await buildCartItems(customerId, rates);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <CheckoutClient
        items={items}
        subtotal={subtotal}
        gstAmount={gstAmount}
        totalAmount={subtotal + gstAmount}
        customerName={customer?.name ?? null}
        customerPhone={customer?.phone ?? null}
        customerEmail={customer?.email ?? null}
        buyNow={buyNow}
      />
    </>
  );
}
