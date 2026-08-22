"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

type Props = {
  products: Product[];
  ratePromise: Promise<Record<string, number>>;
  wishlistedIdsPromise: Promise<string[]>;
};

export default function AlsoPurchasedCarousel({ products, ratePromise, wishlistedIdsPromise }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth * 2 + 16 : el.clientWidth * 0.6;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll("left")}
        aria-label="Previous products"
        className={`absolute left-0 top-1/3 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 bg-white border border-rose-gold-light/50 rounded-full shadow-md flex items-center justify-center text-rose-gold hover:bg-rose-gold hover:text-white transition-all duration-200 ${
          canScrollLeft ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <ChevronLeft size={18} />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-card
            className="flex-none snap-start w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] xl:w-[calc(20%-13px)]"
          >
            <ProductCard
              product={product}
              ratePromise={ratePromise}
              wishlistedIdsPromise={wishlistedIdsPromise}
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        aria-label="Next products"
        className={`absolute right-0 top-1/3 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 bg-white border border-rose-gold-light/50 rounded-full shadow-md flex items-center justify-center text-rose-gold hover:bg-rose-gold hover:text-white transition-all duration-200 ${
          canScrollRight ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
