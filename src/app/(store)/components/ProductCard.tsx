"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product";
import { useCart } from "@/app/context/CartContext";
import { slugify } from "@/lib/utils";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();

  return (
    <article className="flex flex-col bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden transition hover:shadow-md">
      {/* Image */}
      <Link
        href={`/product/${slugify(product.name)}?id=${product.id}`}
        className="relative block w-full h-60 bg-gray-50"
      >
        <Image
          src={product.images?.[0] || "/images/placeholder.webp"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col justify-between p-5 space-y-3">
        {/* Title */}
        <h2 className="text-xl font-extrabold uppercase tracking-wide text-gray-900">
          {product.name}
        </h2>

        {/* Price + Material Badge */}
        <div className="flex items-center justify-between">
          <span className="text-yellow-600 text-lg font-semibold">
            ₹ {product.price.toFixed(2)}
          </span>
          {product.material && (
            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
              {product.material.toUpperCase()}
            </span>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-2">
          {product.category && (
            <span className="text-yellow-700 border border-yellow-400 text-xs font-semibold px-3 py-1 rounded-full">
              {product.category}
            </span>
          )}
          {product.subCategory && (
            <span className="text-blue-700 border border-blue-400 text-xs font-semibold px-3 py-1 rounded-full">
              {product.subCategory}
            </span>
          )}
          {product.gender && (
            <span className="text-pink-700 border border-pink-400 text-xs font-semibold px-3 py-1 rounded-full">
              {product.gender}
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => addToCart(product)}
          className="w-full mt-4 bg-gradient-to-r from-pink-600 to-pink-500 text-white font-semibold text-sm py-3 rounded-full transition hover:from-pink-700 hover:to-pink-600 shadow"
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}
