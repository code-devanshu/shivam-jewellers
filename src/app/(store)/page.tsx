import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Handcrafted Gold & Silver Jewellery",
  description:
    "Shop BIS Hallmark certified gold and silver jewellery handcrafted in Deoria, UP. Rings, necklaces, bangles, earrings and more — 30+ years of trusted craftsmanship.",
  openGraph: {
    title: "Shivam Jewellers — Handcrafted Gold & Silver Jewellery",
    description:
      "BIS Hallmark certified jewellery. Shop rings, necklaces, bangles and more from Shivam Jewellers, Deoria.",
    url: "/",
    type: "website",
  },
};
import { ArrowRight, ShieldCheck, Star, Truck } from "lucide-react";
import { getCategories, getProducts, getCurrentRates } from "@/lib/data";
import { getCustomerSession } from "@/lib/customer-auth";
import { getWishlistedProductIds } from "@/lib/customer-store";
import ProductCard from "@/components/store/ProductCard";
import CategoryCard from "@/components/store/CategoryCard";
import HeroSection from "@/components/store/HeroSection";

export default async function HomePage() {
  const customerId = await getCustomerSession();

  const [categories, featured, rates, wishlistedIds] = await Promise.all([
    getCategories(),
    getProducts({ featured: true }),
    getCurrentRates(),
    customerId ? getWishlistedProductIds(customerId) : Promise.resolve([]),
  ]);

  const rateMap = Object.fromEntries(rates.map((r) => [r.metalId, r.ratePerGram]));

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <HeroSection categories={categories} featured={featured} />

      {/* ── Shop by Category ─────────────────────────────────────────────── */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-rose-gold text-xs font-semibold uppercase tracking-widest mb-1">
                Browse
              </p>
              <h2 className="text-3xl font-serif font-bold text-brown-dark">
                Shop by Category
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden md:flex items-center gap-1.5 text-sm text-rose-gold hover:text-rose-gold-dark font-medium transition-colors"
            >
              All products <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Collection ──────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-rose-gold text-xs font-semibold uppercase tracking-widest mb-1">
                Handpicked
              </p>
              <h2 className="text-3xl font-serif font-bold text-brown-dark">
                Featured Collection
              </h2>
            </div>
            <Link
              href="/products?featured=true"
              className="hidden md:flex items-center gap-1.5 text-sm text-rose-gold hover:text-rose-gold-dark font-medium transition-colors"
            >
              View all <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                ratePerGram={rateMap[product.metalId] ?? 0}
                isWishlisted={wishlistedIds.includes(product.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Pillars ────────────────────────────────────────────────── */}
      <section className="py-16 bg-blush/30 border-t border-blush">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 bg-rose-gold/10 rounded-full flex items-center justify-center text-rose-gold">
                <ShieldCheck size={26} />
              </div>
              <h3 className="font-semibold text-brown-dark text-base">
                BIS Hallmark Certified
              </h3>
              <p className="text-sm text-brown/60 leading-relaxed max-w-xs">
                Every piece carries the BIS hallmark, guaranteeing purity and
                quality you can trust.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 bg-rose-gold/10 rounded-full flex items-center justify-center text-rose-gold">
                <Star size={26} />
              </div>
              <h3 className="font-semibold text-brown-dark text-base">
                30+ Years of Trust
              </h3>
              <p className="text-sm text-brown/60 leading-relaxed max-w-xs">
                Serving families across Mumbai since 1995 with authentic
                craftsmanship and fair pricing.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 bg-rose-gold/10 rounded-full flex items-center justify-center text-rose-gold">
                <Truck size={26} />
              </div>
              <h3 className="font-semibold text-brown-dark text-base">
                Insured Delivery
              </h3>
              <p className="text-sm text-brown/60 leading-relaxed max-w-xs">
                Fully insured shipping across India with real-time tracking on
                every order.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
