import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Handcrafted Gold & Silver Jewellery",
  description:
    "Shop BIS Hallmark certified gold and silver jewellery handcrafted in Deoria, UP. Rings, necklaces, bangles, earrings and more — 30+ years of craftsmanship.",
  openGraph: {
    title: "Shivam Jewellers — Handcrafted Gold & Silver Jewellery",
    description:
      "BIS Hallmark certified jewellery. Shop rings, necklaces, bangles and more from Shivam Jewellers, Deoria.",
    url: "/",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Shivam Jewellers" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
};

import { Suspense } from "react";
import { ArrowRight, ShieldCheck, Star, Truck } from "lucide-react";
import { getCategories, getFeaturedProducts, getCurrentRates } from "@/lib/data";
import { getCustomerSession } from "@/lib/customer-auth";
import { getWishlistedProductIds } from "@/lib/customer-store";
import ProductCard from "@/components/store/ProductCard";
import CategoryCarousel from "@/components/store/CategoryCarousel";
import HeroSection from "@/components/store/HeroSection";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost:3000";

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  name: "Shivam Jewellers",
  url: siteUrl,
  telephone: "+918808011114",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jamuna Gali, Malviya Rd, Pathar Deva, Raghav Nagar",
    addressLocality: "Deoria",
    addressRegion: "Uttar Pradesh",
    postalCode: "274806",
    addressCountry: "IN",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "11:00",
      closes: "18:00",
    },
  ],
  priceRange: "₹₹",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Shivam Jewellers",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/products?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default async function HomePage() {
  const [customerId, categories] = await Promise.all([
    getCustomerSession(),
    getCategories(),
  ]);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <HeroSection categories={categories} />

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

          <CategoryCarousel categories={categories} />
        </div>
      </section>

      {/* ── Featured Collection ──────────────────────────────────────────── */}
      <Suspense fallback={<FeaturedCollectionSkeleton />}>
        <FeaturedCollection customerId={customerId} />
      </Suspense>

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
                Serving families across Deoria since 1995 with authentic
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

async function FeaturedCollection({ customerId }: { customerId: string | null }) {
  const [featured, rates, wishlistedIds] = await Promise.all([
    getFeaturedProducts(),
    getCurrentRates(),
    customerId ? getWishlistedProductIds(customerId) : Promise.resolve([]),
  ]);

  const rateMap = Object.fromEntries(rates.map((r) => [r.metalId, r.ratePerGram]));

  return (
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
              ratePromise={Promise.resolve(rateMap)}
              wishlistedIdsPromise={Promise.resolve(wishlistedIds)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCollectionSkeleton() {
  return (
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden border border-blush animate-pulse"
            >
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
          ))}
        </div>
      </div>
    </section>
  );
}
