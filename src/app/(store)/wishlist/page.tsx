import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { getCustomerSession } from "@/lib/customer-auth";
import { getWishlistItems } from "@/lib/customer-store";
import { getAllProducts, getCurrentRates } from "@/lib/data";
import WishlistClient from "./WishlistClient";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const customerId = await getCustomerSession();

  if (!customerId) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-blush rounded-full flex items-center justify-center text-rose-gold mb-6">
          <Heart size={36} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-brown-dark mb-2">
          Your wishlist is empty
        </h2>
        <p className="text-brown/60 mb-8 max-w-sm">
          Sign in to save pieces you love and revisit them anytime.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-rose-gold hover:bg-rose-gold-dark text-white px-8 py-3 rounded-full font-semibold text-sm transition-colors"
          >
            Explore Collection <ArrowRight size={16} />
          </Link>
          <Link
            href="/auth?next=/wishlist"
            className="inline-flex items-center gap-2 border border-rose-gold text-rose-gold hover:bg-blush px-8 py-3 rounded-full font-semibold text-sm transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const [rawItems, allProducts, rates] = await Promise.all([
    getWishlistItems(customerId),
    getAllProducts(),
    getCurrentRates(),
  ]);

  const productMap = new Map(allProducts.map((p) => [p.id, p]));
  const ratesMap = Object.fromEntries(rates.map((r) => [r.metalId, r.ratePerGram]));

  const items = rawItems
    .map((item) => ({
      productId: item.productId,
      product: productMap.get(item.productId),
    }))
    .filter((i): i is typeof i & { product: NonNullable<typeof i.product> } => !!i.product);

  if (items.length === 0) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-blush rounded-full flex items-center justify-center text-rose-gold mb-6">
          <Heart size={36} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-brown-dark mb-2">
          Your wishlist is empty
        </h2>
        <p className="text-brown/60 mb-8 max-w-sm">
          Browse our collection and save pieces you love.
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

  return <WishlistClient items={items} rates={ratesMap} />;
}
