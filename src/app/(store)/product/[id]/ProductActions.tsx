"use client";

import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { useCart } from "@/app/context/CartContext";

export function ProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();

  return (
    <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 md:mb-0 md:mr-6 text-pink-600 hover:underline"
      >
        &larr; Back
      </button>
      <button
        type="button"
        className="w-full md:w-auto bg-gradient-to-r from-pink-600 to-pink-500 text-white font-semibold py-3 px-10 rounded-full shadow-lg hover:from-pink-700 hover:to-pink-600 transition"
        onClick={() => addToCart(product)}
      >
        Add to Cart
      </button>
    </div>
  );
}
