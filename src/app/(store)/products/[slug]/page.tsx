import { notFound } from "next/navigation";
import { getProductBySlug, getCurrentRates, getAllProducts } from "@/lib/data";
import { getCustomerSession } from "@/lib/customer-auth";
import { getWishlistedProductIds } from "@/lib/customer-store";
import { calculatePrice } from "@/lib/price";
import ProductDetail from "@/components/store/ProductDetail";

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

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const [product, rates, customerId] = await Promise.all([
    getProductBySlug(slug),
    getCurrentRates(),
    getCustomerSession(),
  ]);

  if (!product) notFound();

  const ratePerGram =
    rates.find((r) => r.metalId === product.metalId)?.ratePerGram ?? 0;

  let isWishlisted = false;
  if (customerId) {
    const ids = await getWishlistedProductIds(customerId);
    isWishlisted = ids.includes(product.id);
  }

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetail
        product={product}
        ratePerGram={ratePerGram}
        customerId={customerId}
        isWishlisted={isWishlisted}
      />
    </>
  );
}
