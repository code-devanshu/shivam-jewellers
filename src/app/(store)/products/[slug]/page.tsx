import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductBySlug, getCurrentRates, getAllProducts } from "@/lib/data";
import { getCustomerSession } from "@/lib/customer-auth";
import { getWishlistedProductIds } from "@/lib/customer-store";
import { calculatePrice } from "@/lib/price";
import ProductDetail from "@/components/store/ProductDetail";
import type { Product } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.filter((p) => p.isAvailable).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const description =
    product.description ??
    `Shop ${product.name} at Shivam Jewellers. BIS Hallmark certified handcrafted jewellery.`;

  const ogImage = product.images?.[0]?.url;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: `${product.name} | Shivam Jewellers`,
      description,
      url: `/products/${slug}`,
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage, alt: product.name }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: product.name,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

// Awaits the (potentially slow) rate lookup on its own so the rest of the page
// doesn't have to block on it — streamed in via the Suspense boundary below.
async function ProductJsonLd({
  product,
  ratePromise,
}: {
  product: Product;
  ratePromise: Promise<number>;
}) {
  const ratePerGram = await ratePromise;
  const { totalPrice } = calculatePrice(product, ratePerGram);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description ??
      `BIS Hallmark certified ${product.metal.name} jewellery from Shivam Jewellers.`,
    image: product.images.map((img) => img.url),
    brand: { "@type": "Brand", name: "Shivam Jewellers" },
    material: product.metal.name,
    offers: {
      "@type": "Offer",
      availability: product.isAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceCurrency: "INR",
      price: totalPrice,
      seller: { "@type": "Organization", name: "Shivam Jewellers" },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
    />
  );
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  // Only the product itself (cheap, cached lookup) and the session (cookie read,
  // no DB hit) block the page. The live rate and wishlist DB lookups are started
  // here but not awaited — they stream in below their own Suspense boundaries so
  // the breadcrumb/gallery/name paint immediately instead of waiting on them.
  const [product, customerId] = await Promise.all([
    getProductBySlug(slug),
    getCustomerSession(),
  ]);

  if (!product) notFound();

  const ratePromise = getCurrentRates().then(
    (rates) => rates.find((r) => r.metalId === product.metalId)?.ratePerGram ?? 0
  );
  const wishlistPromise = customerId
    ? getWishlistedProductIds(customerId).then((ids) => ids.includes(product.id))
    : Promise.resolve(false);

  return (
    <>
      <Suspense fallback={null}>
        <ProductJsonLd product={product} ratePromise={ratePromise} />
      </Suspense>
      <ProductDetail
        product={product}
        ratePromise={ratePromise}
        customerId={customerId}
        wishlistPromise={wishlistPromise}
      />
    </>
  );
}
