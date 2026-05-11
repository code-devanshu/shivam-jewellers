import { notFound } from "next/navigation";
import { getProductBySlug, getCurrentRates } from "@/lib/data";
import { getCustomerSession } from "@/lib/customer-auth";
import { getWishlistedProductIds } from "@/lib/customer-store";
import ProductDetail from "@/components/store/ProductDetail";

type Props = { params: Promise<{ slug: string }> };

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

  return (
    <ProductDetail
      product={product}
      ratePerGram={ratePerGram}
      customerId={customerId}
      isWishlisted={isWishlisted}
    />
  );
}
