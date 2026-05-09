import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl text-rose-gold-light mb-6">✦</div>
      <h2 className="text-2xl font-serif font-bold text-brown-dark mb-2">
        Product not found
      </h2>
      <p className="text-brown/60 mb-8 max-w-sm">
        This piece may no longer be available. Explore our full collection to
        find something beautiful.
      </p>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 bg-rose-gold hover:bg-rose-gold-dark text-white px-8 py-3 rounded-full font-semibold text-sm transition-colors"
      >
        Browse Collection <ArrowRight size={16} />
      </Link>
    </div>
  );
}
