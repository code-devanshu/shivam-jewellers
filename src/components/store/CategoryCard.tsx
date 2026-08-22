"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";

type Props = { category: Category };

export default function CategoryCard({ category }: Props) {
  const imageUrls = category.imageUrls ?? [];
  const images =
    imageUrls.length > 0
      ? imageUrls
      : category.imageUrl
        ? [category.imageUrl]
        : [];

  const [idx, setIdx] = useState(0);
  // Only the current + next image are mounted as <Image>s (not all of them),
  // so a category with several photos doesn't flood the initial load.
  const [loadedIdx, setLoadedIdx] = useState<Set<number>>(
    () => new Set(images.length > 1 ? [0, 1] : images.length === 1 ? [0] : []),
  );

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setIdx((i) => {
        const next = (i + 1) % images.length;
        const following = (next + 1) % images.length;
        setLoadedIdx((loaded) =>
          loaded.has(following) ? loaded : new Set(loaded).add(following),
        );
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <Link href={`/products?category=${category.slug}`} className="group flex flex-col items-center gap-1.5 sm:gap-2">
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-rose-gold-light/30 shadow-sm group-hover:shadow-md transition-all duration-200">
        {images.length > 0 ? (
          images.map((url, i) =>
            loadedIdx.has(i) ? (
              <Image
                key={url}
                src={url}
                alt={category.name}
                fill
                className={`object-cover transition-all duration-700 ease-in-out ${
                  i === idx
                    ? "opacity-100 scale-100 group-hover:scale-105"
                    : "opacity-0 scale-100"
                }`}
                sizes="(max-width: 640px) 25vw, (max-width: 1024px) 16vw, 11vw"
              />
            ) : null,
          )
        ) : (
          <div className="w-full h-full bg-linear-to-br from-blush to-rose-gold-light/30 flex items-center justify-center text-3xl text-rose-gold">
            ✦
          </div>
        )}
      </div>

      <p className="text-[11px] sm:text-xs font-medium text-brown-dark text-center line-clamp-1">
        {category.name}
      </p>
    </Link>
  );
}
