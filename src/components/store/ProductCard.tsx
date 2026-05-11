"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { calculatePrice, formatPrice } from "@/lib/price";
import { addToCart } from "@/app/(store)/cart/actions";
import { toggleWishlist } from "@/app/(store)/wishlist/actions";
import { isRedirectError } from "next/dist/client/components/redirect-error";

type Props = {
  product: Product;
  ratePerGram: number;
  isWishlisted?: boolean;
};

export default function ProductCard({ product, ratePerGram, isWishlisted: initialWishlisted = false }: Props) {
  const primary = product.images.find((img) => img.isPrimary) ?? product.images[0];
  const { totalPrice } = calculatePrice(product, ratePerGram);
  const [cartState, setCartState] = useState<"idle" | "adding" | "added">("idle");
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [, startTransition] = useTransition();
  const [, startWishlistTransition] = useTransition();

  function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !wishlisted;
    setWishlisted(next);
    startWishlistTransition(async () => {
      try {
        const confirmed = await toggleWishlist(product.id);
        setWishlisted(confirmed);
        toast.success(confirmed ? "Added to wishlist" : "Removed from wishlist");
      } catch (err) {
        if (isRedirectError(err)) throw err;
        setWishlisted(!next);
        toast.error("Please sign in to save items");
      }
    });
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (cartState !== "idle") return;
    setCartState("adding");
    startTransition(async () => {
      try {
        await addToCart(product.id, null);
        setCartState("added");
        setTimeout(() => setCartState("idle"), 2000);
      } catch (err) {
        if (isRedirectError(err)) throw err;
        setCartState("idle");
      }
    });
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-blush shadow-sm hover:shadow-md transition-all duration-200">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-blush/40">
          {primary ? (
            <Image
              src={primary.url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-rose-gold-light text-4xl">
              ✦
            </div>
          )}

          {/* Wishlist button */}
          <button
            className={`absolute top-3 right-3 p-1.5 backdrop-blur-sm rounded-full transition-colors shadow-sm ${
              wishlisted
                ? "bg-rose-gold text-white hover:bg-rose-gold-dark"
                : "bg-white/80 text-rose-gold hover:bg-white"
            }`}
            aria-label="Toggle wishlist"
            onClick={handleToggleWishlist}
          >
            <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
          </button>

          {product.isFeatured && (
            <span className="absolute top-3 left-3 px-2 py-0.5 bg-rose-gold text-white text-[10px] font-semibold rounded-full uppercase tracking-wide">
              Featured
            </span>
          )}

          {/* Add to Cart — slides up on hover, always visible on mobile */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out">
            <button
              onClick={handleAddToCart}
              disabled={cartState === "adding"}
              className={`w-full py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors ${
                cartState === "added"
                  ? "bg-green-500 text-white"
                  : "bg-rose-gold hover:bg-rose-gold-dark text-white disabled:opacity-70"
              }`}
            >
              {cartState === "added" ? (
                <><Check size={13} /> Added!</>
              ) : cartState === "adding" ? (
                "Adding…"
              ) : (
                <><ShoppingBag size={13} /> Add to Cart</>
              )}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[11px] font-medium text-rose-gold uppercase tracking-wider mb-1">
            {product.metal.name} · {product.purity}
          </p>
          <h3 className="text-sm font-semibold text-brown-dark leading-snug line-clamp-1 mb-2">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-rose-gold-dark">
              {formatPrice(totalPrice)}
            </span>
            <span className="text-xs text-brown/40">{product.weightGrams}g</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
