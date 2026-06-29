"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/types";

type Props = {
  categories: Category[];
};

export default function HeroSection({ categories }: Props) {
  const slides = useMemo(
    () =>
      categories
        .flatMap((c) => (c.imageUrls ?? []).slice(0, 1))
        .filter(Boolean)
        .slice(0, 6),
    [categories]
  );

  console.log("[HeroSection] categories:", categories.map((c) => ({ name: c.name, imageUrls: c.imageUrls })));
  console.log("[HeroSection] slides:", slides);

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section
      className="relative overflow-hidden flex items-center"
      style={{ minHeight: "70vh", backgroundColor: "#1a0e0a" }}
    >
      {/* ── Background carousel ───────────────────────────────────── */}
      {slides.length > 0 && (
        <div className="absolute inset-0">
          {slides.map((url, i) => (
            <div
              key={url}
              className="absolute inset-0"
              style={{
                opacity: i === current ? 1 : 0,
                transition: "opacity 1.2s ease-in-out",
              }}
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover object-center"
                priority={i === 0}
                sizes="100vw"
              />
            </div>
          ))}

          {/* Warm dark overlay — matches site's brown tone, not cold black */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(26,14,10,0.62)" }}
          />
          {/* Warm gradient: subtle rose-gold blush at bottom */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(26,14,10,0.28) 0%, rgba(26,14,10,0.04) 45%, rgba(80,30,10,0.55) 100%)",
            }}
          />
        </div>
      )}

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="relative w-full max-w-3xl mx-auto px-6 sm:px-8 py-14 lg:py-20 text-center">

        {/* Badge */}
        <p
          className="text-[11px] font-semibold uppercase mb-4"
          style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.28em" }}
        >
          BIS Hallmark Certified · Est. 1995 · Deoria, UP
        </p>

        {/* Decorative rule */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="h-px w-14" style={{ backgroundColor: "rgba(200,150,100,0.35)" }} />
          <span style={{ color: "rgba(200,150,100,0.55)", fontSize: 12 }}>✦</span>
          <div className="h-px w-14" style={{ backgroundColor: "rgba(200,150,100,0.35)" }} />
        </div>

        {/* Store name */}
        <h1
          className="font-serif font-bold leading-[1.05] tracking-tight mb-4"
          style={{ fontSize: "clamp(2.8rem, 8vw, 5.5rem)", color: "#fff" }}
        >
          Shivam<br />Jewellers
        </h1>

        {/* Tagline */}
        <p
          className="leading-relaxed mb-7 max-w-sm mx-auto text-base sm:text-lg"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          Fine gold &amp; silver jewellery, crafted with 30 years of tradition.
          Every piece BIS hallmark certified.
        </p>

        {/* Primary CTA */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-9 py-3.5 rounded-full font-semibold text-sm transition-all"
          style={{
            backgroundColor: "var(--color-rose-gold, #c4956a)",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(196,149,106,0.30)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              "var(--color-rose-gold-dark, #a67850)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              "var(--color-rose-gold, #c4956a)";
          }}
        >
          Browse Collection <ArrowRight size={15} />
        </Link>

        {/* Category pills */}
        {categories.length > 0 && (
          <>
            <div className="flex items-center justify-center gap-3 mt-8 mb-4">
              <div className="h-px w-12" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
              <span
                className="text-[10px] font-semibold uppercase"
                style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em" }}
              >
                Shop by category
              </span>
              <div className="h-px w-12" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
            </div>

            <div
              className="flex gap-2 overflow-x-auto justify-start sm:justify-center pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="flex-none text-[12px] font-medium px-4 py-1.5 rounded-full transition-all whitespace-nowrap"
                  style={{
                    color: "rgba(255,255,255,0.70)",
                    border: "1px solid rgba(255,255,255,0.20)",
                  }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Slide indicator dots */}
        {slides.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-7">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width: i === current ? 22 : 7,
                  height: 7,
                  borderRadius: 9999,
                  backgroundColor: i === current
                    ? "var(--color-rose-gold, #c4956a)"
                    : "rgba(255,255,255,0.28)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.35s ease",
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
