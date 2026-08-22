import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

export default function EmptyCart() {
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
