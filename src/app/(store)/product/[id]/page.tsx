import { notFound } from "next/navigation";
import { ProductActions } from "./ProductActions";
import ProductImageGallery from "./ProductImageGallery";
import {
  getProductById,
  getRelatedProducts,
} from "@/app/(admin)/admin/actions/product-actions";
import ProductCard from "../../components/ProductCard";
import { Metadata } from "next";

interface Props {
  params: { name: string };
  searchParams: { id?: string };
  // plus others if needed
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  // Await params and searchParams just like official docs
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const productId = resolvedSearchParams.id;

  if (!productId) {
    return {
      title: "Product Not Found",
      description: "No product id provided",
    };
  }

  const product = await getProductById(productId);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "Product not found in our catalog.",
    };
  }

  return {
    title: product.name,
    description: product.description ?? "Buy premium products from us.",
    openGraph: {
      title: product.name,
      description: product.description ?? "",
      url: `https://shivamjewllers.co.in/product/${resolvedParams.name}?id=${product.id}`,
      siteName: "Shivam Jewellers",
      images: [
        {
          url: product.images?.[0] ?? "/placeholder.png",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description ?? "",
      images: [product.images?.[0] ?? "/placeholder.png"],
    },
  };
}

export default async function ProductDetailsPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { id?: string };
}) {
  const productId = searchParams?.id;

  if (!productId) return notFound();

  const product = await getProductById(productId);

  if (!product) return notFound();

  const related = await getRelatedProducts(product.id, product.category || "");

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        {/* Gallery */}
        <div className="w-full md:w-1/2">
          <ProductImageGallery
            images={product.images || []}
            name={product.name}
          />
        </div>

        {/* Details */}
        <div className="flex-1 space-y-6">
          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 font-serif uppercase tracking-tight">
            {product.name}
          </h1>

          {/* Price + Material */}
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-2xl font-bold text-yellow-600">
              ₹ {product.price.toLocaleString()}
            </p>
            {product.material && (
              <span className="bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
                Material: {product.material.toUpperCase()}
              </span>
            )}
            {product.weight && (
              <span className="text-gray-600 text-sm font-medium">
                · {product.weight}g
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-3">
            {product.category && (
              <span className="text-yellow-700 border border-yellow-400 text-xs font-semibold px-3 py-1 rounded-full">
                {product.category}
              </span>
            )}
            {product.subCategory && (
              <span className="text-blue-700 border border-blue-400 text-xs font-semibold px-3 py-1 rounded-full">
                {product.subCategory}
              </span>
            )}
            {product.gender && (
              <span className="text-pink-700 border border-pink-400 text-xs font-semibold px-3 py-1 rounded-full">
                {product.gender}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-gray-700 leading-relaxed text-base">
              {product.description}
            </p>
          )}

          {/* Actions (Quantity + Add to Cart) */}
          <div className="pt-4">
            <ProductActions product={product} />
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pt-10 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
