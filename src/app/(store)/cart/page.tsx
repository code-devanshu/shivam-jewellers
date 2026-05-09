import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { getCustomerSession } from "@/lib/customer-auth";
import { getCartItems } from "@/lib/customer-store";
import { getAllProducts, getCurrentRates } from "@/lib/data";
import CartClient from "./CartClient";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const customerId = await getCustomerSession();

  if (!customerId) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-blush rounded-full flex items-center justify-center text-rose-gold mb-6">
          <ShoppingBag size={36} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-brown-dark mb-2">Your cart is empty</h2>
        <p className="text-brown/60 mb-8 max-w-sm">
          Sign in to save items to your cart and pick up where you left off.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-rose-gold hover:bg-rose-gold-dark text-white px-8 py-3 rounded-full font-semibold text-sm transition-colors"
          >
            Browse Jewellery <ArrowRight size={16} />
          </Link>
          <Link
            href="/auth?next=/cart"
            className="inline-flex items-center gap-2 border border-rose-gold text-rose-gold hover:bg-blush px-8 py-3 rounded-full font-semibold text-sm transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const [rawItems, allProducts, rates] = await Promise.all([
    getCartItems(customerId),
    getAllProducts(),
    getCurrentRates(),
  ]);

  const productMap = new Map(allProducts.map((p) => [p.id, p]));
  const ratesMap = Object.fromEntries(rates.map((r) => [r.metalId, r.ratePerGram]));

  const items = rawItems
    .map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: productMap.get(item.productId),
      variant: item.variant
        ? {
            id: item.variant.id,
            productId: item.variant.productId,
            size: item.variant.size,
            gemstone: item.variant.gemstone,
            additionalPrice: Number(item.variant.additionalPrice),
            stockQty: item.variant.stockQty,
            sku: item.variant.sku,
          }
        : null,
    }))
    .filter((i): i is typeof i & { product: NonNullable<typeof i.product> } => !!i.product);

  if (items.length === 0) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-blush rounded-full flex items-center justify-center text-rose-gold mb-6">
          <ShoppingBag size={36} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-brown-dark mb-2">Your cart is empty</h2>
        <p className="text-brown/60 mb-8 max-w-sm">
          Browse our collection and add pieces you love.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-rose-gold hover:bg-rose-gold-dark text-white px-8 py-3 rounded-full font-semibold text-sm transition-colors"
        >
          Explore Collection <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return <CartClient items={items} rates={ratesMap} />;
}
