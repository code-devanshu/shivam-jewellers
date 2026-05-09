"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { calculatePrice, formatPrice } from "@/lib/price";
import { removeFromWishlist } from "./actions";

type WishlistEntry = {
  productId: string;
  product: Product;
};

type Props = {
  items: WishlistEntry[];
  rates: Record<string, number>;
};

function WishlistCard({
  entry,
  rates,
}: {
  entry: WishlistEntry;
  rates: Record<string, number>;
}) {
  const [isPending, startTransition] = useTransition();
  const ratePerGram = rates[entry.product.metalId] ?? 0;
  const { totalPrice } = calculatePrice(entry.product, ratePerGram);
  const primary =
    entry.product.images.find((i) => i.isPrimary) ?? entry.product.images[0];

  const remove = () =>
    startTransition(() => removeFromWishlist(entry.productId));

  return (
    <div
      className={`bg-white border border-blush rounded-2xl overflow-hidden shadow-sm transition-opacity ${isPending ? "opacity-40 pointer-events-none" : ""}`}
    >
      <Link href={`/products/${entry.product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-blush/40">
          {primary ? (
            <Image
              src={primary.url}
              alt={entry.product.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-rose-gold-light">
              ✦
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <p className="text-[11px] text-rose-gold font-medium uppercase tracking-wider mb-0.5">
          {entry.product.metal.name} · {entry.product.purity}
        </p>
        <Link
          href={`/products/${entry.product.slug}`}
          className="text-sm font-semibold text-brown-dark hover:text-rose-gold transition-colors line-clamp-1"
        >
          {entry.product.name}
        </Link>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-rose-gold-dark">
            {formatPrice(totalPrice)}
          </span>
          <button
            onClick={remove}
            className="p-1.5 text-gray-300 hover:text-red-400 transition-colors"
            aria-label="Remove from wishlist"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WishlistClient({ items, rates }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-serif font-bold text-brown-dark mb-6">
        My Wishlist{" "}
        <span className="text-base font-normal text-brown/50">
          ({items.length} {items.length === 1 ? "item" : "items"})
        </span>
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((entry) => (
          <WishlistCard key={entry.productId} entry={entry} rates={rates} />
        ))}
      </div>
    </div>
  );
}
