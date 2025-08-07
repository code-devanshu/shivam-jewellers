import { notFound } from "next/navigation";
import { ProductActions } from "./ProductActions";
import ProductImageGallery from "./ProductImageGallery";
import {
  getProductById,
  getRelatedProducts,
} from "@/app/(admin)/admin/actions/product-actions";
import ProductCard from "../../components/ProductCard";
import { Metadata } from "next";
import { slugify } from "@/lib/utils";
import { Suspense } from "react";

export const generateMetadata = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}): Promise<Metadata> => {
  const { id } = await searchParams;

  if (!id) {
    return {
      title: "Product Not Found",
      description: "No product id provided",
    };
  }

  const product = await getProductById(id);

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
      url: `https://shivamjewllers.co.in/product/${slugify(product.name)}?id=${
        product.id
      }`,
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
};

export default async function ProductDetailsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { id } = await searchParams;

  if (!id) return notFound();

  const product = await getProductById(id);

  if (!product) return notFound();

  const relatedPromise = getRelatedProducts(id, product.category || "");

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
          <h1 className="text-4xl font-bold text-gray-900 font-serif uppercase tracking-tight">
            {product.name}
          </h1>

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

          {product.description && (
            <p className="text-gray-700 leading-relaxed text-base">
              {product.description}
            </p>
          )}

          <div className="pt-4">
            <ProductActions product={product} />
          </div>
        </div>
      </div>

      {/* Related Products */}
      <Suspense
        fallback={
          <p className="mt-10 text-center text-sm text-gray-400">
            Loading related products...
          </p>
        }
      >
        {/* This async block handles related product rendering */}
        {await (async () => {
          const related = await relatedPromise;

          if (!related || related.length === 0) return null;

          return (
            <section className="mt-10 pt-10 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Related Products
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {related.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </section>
          );
        })()}
      </Suspense>
    </main>
  );
}
