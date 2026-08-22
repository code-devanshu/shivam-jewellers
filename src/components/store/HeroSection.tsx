"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Banner } from "@/lib/types";

type Props = {
  banners: Banner[];
};

export default function HeroSection({ banners }: Props) {
  const slides = banners;
  const [current, setCurrent] = useState(0);
  // Only the current + next slide are mounted as <Image>s (not all of them),
  // so the carousel doesn't flood the initial load with images that compete
  // with the hero's LCP image for bandwidth.
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(
    () => new Set(slides.length > 1 ? [0, 1] : slides.length === 1 ? [0] : []),
  );

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % slides.length;
        const following = (next + 1) % slides.length;
        setLoadedSlides((loaded) =>
          loaded.has(following) ? loaded : new Set(loaded).add(following),
        );
        return next;
      });
    }, 4500);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section
      className="relative overflow-hidden flex items-center min-h-[36vh] sm:min-h-[46vh] lg:min-h-[52vh]"
      style={{ backgroundColor: "#1a0e0a" }}
    >
      {/* ── Background carousel ───────────────────────────────────── */}
      {slides.length > 0 && (
        <div className="absolute inset-0">
          {slides.map((banner, i) => {
            const image = loadedSlides.has(i) && (
              <Image
                src={banner.imageUrl}
                alt={banner.title ?? ""}
                fill
                className="object-cover object-center"
                priority={i === 0}
                sizes="100vw"
              />
            );
            const style = {
              opacity: i === current ? 1 : 0,
              transition: "opacity 1.2s ease-in-out",
            };
            return banner.linkUrl ? (
              <Link
                key={banner.id}
                href={banner.linkUrl}
                className="absolute inset-0 block"
                style={style}
                aria-label={banner.title ?? "Featured banner"}
              >
                {image}
              </Link>
            ) : (
              <div key={banner.id} className="absolute inset-0" style={style}>
                {image}
              </div>
            );
          })}

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
      <div className="relative w-full max-w-5xl mx-auto px-6 sm:px-8 py-6 sm:py-8 lg:py-10 text-center">
        {/* Badge */}
        <p
          className="text-[10px] sm:text-[11px] font-semibold uppercase mb-2 sm:mb-3"
          style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.28em" }}
        >
          BIS Hallmark Certified · Est. 1995 · Deoria, UP
        </p>

        {/* Decorative rule */}
        <div className="hidden sm:flex items-center justify-center gap-3 mb-3">
          <div
            className="h-px w-10"
            style={{ backgroundColor: "rgba(200,150,100,0.35)" }}
          />
          <span style={{ color: "rgba(200,150,100,0.55)", fontSize: 12 }}>
            ✦
          </span>
          <div
            className="h-px w-10"
            style={{ backgroundColor: "rgba(200,150,100,0.35)" }}
          />
        </div>

        {/* Store name */}
        <h1
          className="font-serif font-bold leading-[1.05] tracking-tight mb-2 sm:mb-3"
          style={{ fontSize: "clamp(2.1rem, 7.5vw, 4.5rem)", color: "#fff" }}
        >
          Shivam Jewellers
        </h1>

        {/* Tagline */}
        <p
          className="leading-relaxed mb-3 sm:mb-4 max-w-sm mx-auto text-sm sm:text-base"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          Fine gold &amp; silver jewellery, crafted with 30 years of tradition.
          Every piece BIS hallmark certified.
        </p>

        {/* Primary CTA */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-7 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-sm transition-all"
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

        {/* Slide indicator dots */}
        {slides.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 sm:mt-5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width: i === current ? 22 : 7,
                  height: 7,
                  borderRadius: 9999,
                  backgroundColor:
                    i === current
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
