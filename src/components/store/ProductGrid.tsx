"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import ProductCard from "@/components/store/ProductCard";
import { loadMoreProducts } from "@/app/(store)/products/actions";
import type { Product } from "@/lib/types";

type Filters = {
  categorySlug?: string;
  metalId?: string;
  featured?: boolean;
  query?: string;
};

type Props = {
  initialProducts: Product[];
  initialHasMore: boolean;
  filters: Filters;
  rateMap: Record<string, number>;
  wishlistedIds: string[];
};

export default function ProductGrid({
  initialProducts,
  initialHasMore,
  filters,
  rateMap,
  wishlistedIds,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isPending) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        startTransition(async () => {
          const result = await loadMoreProducts(filters, page);
          setProducts((prev) => [...prev, ...result.products]);
          setHasMore(result.hasMore);
          setPage((p) => p + 1);
        });
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isPending, page, filters]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map((product, idx) => (
          <ProductCard
            key={product.id}
            product={product}
            ratePerGram={rateMap[product.metalId] ?? 0}
            isWishlisted={wishlistedIds.includes(product.id)}
            priority={idx < 3}
          />
        ))}
        {isPending &&
          Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>
      {hasMore && <div ref={sentinelRef} className="h-1" />}
    </>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-blush animate-pulse">
      <div className="aspect-square bg-blush/40" />
      <div className="p-4 space-y-2.5">
        <div className="h-2.5 w-1/3 bg-blush/60 rounded-full" />
        <div className="h-3.5 w-4/5 bg-blush/60 rounded-full" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-4 w-16 bg-blush/60 rounded-full" />
          <div className="h-3 w-8 bg-blush/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
