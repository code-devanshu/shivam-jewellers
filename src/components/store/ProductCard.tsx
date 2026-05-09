"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { calculatePrice, formatPrice } from "@/lib/price";

type Props = {
  product: Product;
  ratePerGram: number;
};

export default function ProductCard({ product, ratePerGram }: Props) {
  const primary = product.images.find((img) => img.isPrimary) ?? product.images[0];
  const { totalPrice } = calculatePrice(product, ratePerGram);

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
            className="absolute top-3 right-3 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-rose-gold hover:bg-white transition-colors shadow-sm"
            aria-label="Add to wishlist"
            onClick={(e) => e.preventDefault()}
          >
            <Heart size={15} />
          </button>

          {product.isFeatured && (
            <span className="absolute top-3 left-3 px-2 py-0.5 bg-rose-gold text-white text-[10px] font-semibold rounded-full uppercase tracking-wide">
              Featured
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[11px] font-medium text-rose-gold uppercase tracking-wider mb-1">
            {product.metal.name} · {product.purity}
          </p>
          <h3 className="text-sm font-semibold text-brown-dark leading-snug line-clamp-1 mb-3">
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
