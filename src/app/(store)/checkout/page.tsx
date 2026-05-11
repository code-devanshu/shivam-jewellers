import { redirect } from "next/navigation";
import { requireCustomer } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import { getLiveRates } from "@/lib/live-rates";
import { calculatePrice } from "@/lib/price";
import CheckoutClient from "./CheckoutClient";

export const metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default async function CheckoutPage() {
  const customerId = await requireCustomer("/checkout");

  const [customer, cart, rates] = await Promise.all([
    db.customer.findUnique({ where: { id: customerId } }),
    db.cart.findUnique({
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
    }),
    getLiveRates(),
  ]);

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

    const variantParts: string[] = [];
    if (variant?.size) variantParts.push(`Size ${variant.size}`);
    if (variant?.gemstone && variant.gemstone !== "None") variantParts.push(variant.gemstone);

    return {
      id: ci.id,
      productName: product.name,
      variantLabel: variantParts.length > 0 ? variantParts.join(" · ") : null,
      metalName: product.metal.name,
      purity: product.purity,
      imageUrl: product.images[0]?.url ?? null,
      quantity,
      unitPrice: breakdown.totalPrice,
      totalPrice: breakdown.totalPrice * quantity,
    };
  });

  return (
    <CheckoutClient
      items={items}
      subtotal={subtotal}
      gstAmount={gstAmount}
      totalAmount={subtotal + gstAmount}
      customerName={customer?.name ?? null}
      customerPhone={customer?.phone ?? null}
      customerEmail={customer?.email ?? null}
    />
  );
}
