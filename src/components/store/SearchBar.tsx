"use client";

import { useState, useRef, useEffect } from "react";
import { Search, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Category, Product } from "@/lib/types";

type Props = {
  categories: Category[];
  trendingProducts: Product[];
};

const PLACEHOLDER_TERMS = [
  "rings",
  "necklaces",
  "gold bangles",
  "bridal sets",
  "earrings",
  "pendants",
  "chains",
];

export default function SearchBar({ categories, trendingProducts }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [phIndex, setPhIndex] = useState(0);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const id = setInterval(
      () => setPhIndex((i) => (i + 1) % PLACEHOLDER_TERMS.length),
      2600,
    );
    return () => clearInterval(id);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/products?q=${encodeURIComponent(q)}`);
      setOpen(false);
    } else {
      router.push("/products");
      setOpen(false);
    }
  }

  function selectTag(term: string) {
    setQuery(term);
    router.push(`/products?q=${encodeURIComponent(term)}`);
    setOpen(false);
  }

  const popularSearches = categories.slice(0, 5).map((c) => c.name);
  const trending = trendingProducts.slice(0, 3);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="relative overflow-hidden rounded-full bg-white/95 backdrop-blur-sm border border-white/60 shadow-xl focus-within:ring-2 focus-within:ring-rose-gold/40">
          <style>{`
            @keyframes sb-ph-in {
              from { opacity: 0; transform: translateY(7px); }
              to   { opacity: 1; transform: translateY(0);   }
            }
            .sb-ph-term { animation: sb-ph-in 0.35s ease both; }
          `}</style>

          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-brown/50 pointer-events-none z-10"
            size={18}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            placeholder=""
            className="w-full pl-12 pr-5 py-4 bg-transparent text-brown focus:outline-none text-sm relative z-10"
          />

          {/* Animated placeholder — visible only when input is empty */}
          {!query && (
            <div className="pointer-events-none absolute inset-0 flex items-center pl-12 pr-5 z-0">
              <span className="text-sm text-brown/40 flex items-center whitespace-nowrap">
                Search for&nbsp;
                <span key={phIndex} className="sb-ph-term text-brown/55">
                  {PLACEHOLDER_TERMS[phIndex]}
                </span>
              </span>
            </div>
          )}
        </div>
      </form>

      {open && (
        <div className="absolute top-full mt-3 w-full bg-white rounded-2xl shadow-2xl border border-blush/60 overflow-hidden z-50">
          {/* Popular Searches */}
          <div className="px-5 pt-5 pb-4 border-b border-blush/40">
            <p className="text-[11px] font-semibold text-brown/40 uppercase tracking-[0.15em] mb-3">
              Popular Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => selectTag(term)}
                  className="flex items-center gap-1.5 text-sm text-brown hover:text-rose-gold border border-blush hover:border-rose-gold/40 hover:bg-blush/30 px-3.5 py-1.5 rounded-full transition-colors"
                >
                  <TrendingUp size={12} className="text-rose-gold" />
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Trending Products */}
          {trending.length > 0 && (
            <div className="px-5 pt-4 pb-5">
              <p className="text-[11px] font-semibold text-brown/40 uppercase tracking-[0.15em] mb-4">
                Trending Products
              </p>
              <div className="grid grid-cols-3 gap-4">
                {trending.map((product) => {
                  const primary =
                    product.images.find((img) => img.isPrimary) ??
                    product.images[0];
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => setOpen(false)}
                      className="group flex flex-col items-center text-center gap-2"
                    >
                      <div className="w-full aspect-square rounded-xl overflow-hidden bg-blush/40 relative">
                        {primary ? (
                          <Image
                            src={primary.url}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="160px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-rose-gold-light text-3xl">
                            ✦
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-brown-dark font-medium leading-snug line-clamp-2">
                        {product.name}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer hint */}
          <div className="px-5 py-3 bg-blush/20 border-t border-blush/40 text-center">
            <p className="text-xs text-brown/40">
              Press <kbd className="font-medium text-brown/60">Enter</kbd> to
              search all products
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
