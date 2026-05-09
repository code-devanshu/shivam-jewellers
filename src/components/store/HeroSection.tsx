"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SearchBar from "@/components/store/SearchBar";
import type { Category, Product } from "@/lib/types";

type Props = {
  categories: Category[];
  featured: Product[];
};

const SPARKLES = [
  { top: "8%",  left: "5%",  size: 14, delay: 0,   dur: 6   },
  { top: "15%", left: "85%", size: 10, delay: 1.2, dur: 7   },
  { top: "30%", left: "92%", size: 8,  delay: 0.5, dur: 5.5 },
  { top: "72%", left: "88%", size: 12, delay: 2,   dur: 6.5 },
  { top: "82%", left: "8%",  size: 9,  delay: 0.8, dur: 7.5 },
  { top: "65%", left: "3%",  size: 11, delay: 1.5, dur: 5   },
  { top: "45%", left: "96%", size: 7,  delay: 2.5, dur: 8   },
  { top: "20%", left: "12%", size: 13, delay: 3,   dur: 6   },
  { top: "55%", left: "78%", size: 8,  delay: 0.3, dur: 7   },
  { top: "88%", left: "50%", size: 10, delay: 1.8, dur: 5.5 },
  { top: "5%",  left: "45%", size: 7,  delay: 2.8, dur: 8.5 },
  { top: "38%", left: "2%",  size: 9,  delay: 1,   dur: 6.8 },
  { top: "60%", left: "60%", size: 6,  delay: 3.5, dur: 7.2 },
  { top: "92%", left: "22%", size: 11, delay: 0.6, dur: 5.8 },
  { top: "25%", left: "68%", size: 8,  delay: 2.2, dur: 9   },
];

export default function HeroSection({ categories, featured }: Props) {
  return (
    <section className="relative bg-linear-to-br from-brown-dark via-brown to-rose-gold-dark min-h-[88vh] flex items-center">
      <style>{`
        @keyframes sj-float-up {
          0%   { transform: translateY(0)    rotate(0deg);   opacity: 0; }
          12%  { opacity: 0.9; }
          88%  { opacity: 0.4; }
          100% { transform: translateY(-90px) rotate(180deg); opacity: 0; }
        }
        @keyframes sj-shimmer {
          0%   { transform: translateX(-120%) skewX(-18deg); }
          100% { transform: translateX(400%)  skewX(-18deg); }
        }
        @keyframes sj-orb-a {
          0%,100% { transform: translate(0px,  0px)   scale(1);    }
          33%     { transform: translate(40px, -25px)  scale(1.06); }
          66%     { transform: translate(-18px, 20px)  scale(0.94); }
        }
        @keyframes sj-orb-b {
          0%,100% { transform: translate(0px,   0px)   scale(1);    }
          40%     { transform: translate(-30px,  22px) scale(1.09); }
          70%     { transform: translate(20px,  -28px) scale(0.96); }
        }
        @keyframes sj-fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes sj-spin-cw  { to { transform: rotate(360deg);  } }
        @keyframes sj-spin-ccw { to { transform: rotate(-360deg); } }
        @keyframes sj-glow {
          0%,100% { box-shadow: 0 0 18px rgba(183,110,121,0.35); }
          50%     { box-shadow: 0 0 36px rgba(183,110,121,0.65), 0 0 56px rgba(183,110,121,0.2); }
        }

        .sj-sparkle   { animation: sj-float-up  var(--sj-dur,6s)  var(--sj-delay,0s) ease-in-out infinite; }
        .sj-shimmer   { animation: sj-shimmer    5s               2.5s               ease-in-out infinite; }
        .sj-orb-a     { animation: sj-orb-a      14s              ease-in-out         infinite; }
        .sj-orb-b     { animation: sj-orb-b      17s              ease-in-out         infinite; }
        .sj-ring-cw   { animation: sj-spin-cw    35s linear       infinite; }
        .sj-ring-ccw  { animation: sj-spin-ccw   22s linear       infinite; }
        .sj-fu-1      { animation: sj-fade-up    0.75s 0.10s both ease-out; }
        .sj-fu-2      { animation: sj-fade-up    0.75s 0.28s both ease-out; }
        .sj-fu-3      { animation: sj-fade-up    0.75s 0.46s both ease-out; }
        .sj-fu-4      { animation: sj-fade-up    0.75s 0.64s both ease-out; }
        .sj-fu-5      { animation: sj-fade-up    0.75s 0.82s both ease-out; }
        .sj-btn-primary:hover  { animation: sj-glow 1.4s ease-in-out infinite; }
      `}</style>

      {/* ── Decorative layer (clipped so it never bleeds outside the section) ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Aurora orbs */}
        <div className="sj-orb-a absolute top-[-20%] left-[-8%] w-[58%] h-[80%] rounded-full bg-rose-gold/18 blur-[130px]" />
        <div className="sj-orb-b absolute bottom-[-12%] right-[-4%] w-[52%] h-[72%] rounded-full bg-rose-gold-dark/14 blur-[110px]" />
        <div className="absolute top-[40%] left-[38%] w-[28%] h-[36%] rounded-full bg-cream/4 blur-[80px] animate-pulse" />

        {/* Dot-grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1.5px 1.5px, #D4B0B7 1.5px, transparent 0)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Shimmer sweep */}
        <div className="sj-shimmer absolute inset-y-0 left-0 w-[18%] bg-linear-to-r from-transparent via-cream/[0.05] to-transparent" />

        {/* Floating sparkles */}
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className="sj-sparkle absolute select-none text-rose-gold-light"
            style={{
              top: s.top,
              left: s.left,
              fontSize: s.size,
              "--sj-delay": `${s.delay}s`,
              "--sj-dur": `${s.dur}s`,
              opacity: 0,
            } as React.CSSProperties}
          >
            ✦
          </span>
        ))}

        {/* Rotating rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="sj-ring-cw w-215 h-215 rounded-full opacity-[0.05]"
            style={{ border: "1px solid #D4B0B7" }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="sj-ring-ccw w-145 h-145 rounded-full opacity-[0.07]"
            style={{ border: "1px dashed #b76e79" }}
          />
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="max-w-2xl mx-auto text-center">

          <p className="sj-fu-1 text-rose-gold-light text-xs font-semibold uppercase tracking-[0.25em] mb-5">
            ✦ BIS Hallmark Certified Jewellery
          </p>

          <h1 className="sj-fu-2 text-5xl md:text-6xl font-serif font-bold text-cream leading-tight mb-6">
            Jewellery That
            <br />
            <span className="text-rose-gold-light">Tells Your Story</span>
          </h1>

          <p className="sj-fu-3 text-blush/70 text-lg leading-relaxed mb-8">
            Exquisite handcrafted gold and silver jewellery. Every piece
            certified, every moment cherished.
          </p>

          <div className="sj-fu-4 relative z-10 mb-10">
            <SearchBar categories={categories} trendingProducts={featured} />
          </div>

          <div className="sj-fu-5 flex flex-wrap justify-center gap-4">
            <Link
              href="/products"
              className="sj-btn-primary inline-flex items-center gap-2 bg-rose-gold hover:bg-rose-gold-dark text-white px-8 py-3.5 rounded-full font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link
              href="/products?category=necklaces"
              className="inline-flex items-center gap-2 border border-rose-gold-light/50 text-cream hover:bg-rose-gold-light/10 hover:border-rose-gold-light/80 px-8 py-3.5 rounded-full font-medium transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Bridal Collection
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-rose-gold-light/30 text-rose-gold-light hover:bg-rose-gold-light/10 hover:border-rose-gold-light/60 px-8 py-3.5 rounded-full font-medium transition-all duration-300 text-sm hover:scale-105 active:scale-95"
            >
              Custom Order
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
