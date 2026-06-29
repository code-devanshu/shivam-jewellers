"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";

type Props = { category: Category; priority?: boolean };

export default function CategoryCard({ category, priority = false }: Props) {
  const imageUrls = category.imageUrls ?? [];
  const images =
    imageUrls.length > 0
      ? imageUrls
      : category.imageUrl
        ? [category.imageUrl]
        : [];

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % images.length), 3000);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <Link href={`/products?category=${category.slug}`} className="group block">
      <div className="relative aspect-square rounded-2xl overflow-hidden border border-rose-gold-light/30 shadow-sm hover:shadow-md transition-all duration-200">
        {images.length > 0 ? (
          images.map((url, i) => (
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
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              priority={priority && i === 0}
            />
          ))
        ) : (
          <div className="w-full h-full bg-linear-to-br from-blush to-rose-gold-light/30 flex items-center justify-center text-3xl text-rose-gold">
            ✦
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-brown-dark/70 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-sm font-semibold text-white">{category.name}</p>
          {images.length > 1 && (
            <div className="flex gap-1 mt-1.5">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`h-0.5 rounded-full transition-all duration-500 ${
                    i === idx ? "bg-white w-4" : "bg-white/40 w-1.5"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
