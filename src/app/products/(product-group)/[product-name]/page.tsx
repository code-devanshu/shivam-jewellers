import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { IndianRupee, Star } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import ProductImageViewer from "@/app/products/components/ProductImageViewer";
import ProductActions from "@/app/products/components/ProductActions";
import { Product } from "@/model/base.model";
import JewelryProductCard from "@/components/core/ProductCard";
import { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { id?: string };
}): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { id: searchParams.id },
    select: {
      name: true,
      description: true,
      category: true,
      subcategory: true,
      image: true,
    },
  });

  if (!product) {
    return {
      title: "Product Not Found - Shivam Jewellers",
      description: "The product you are looking for does not exist.",
    };
  }

  return {
    title: `${product.name} - Shivam Jewellers`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} - Shivam Jewellers`,
      description: product.description.slice(0, 160),
      images: product.image.map((img) => ({
        url: img,
        alt: product.name,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} - Shivam Jewellers`,
      description: product.description.slice(0, 160),
      images: product.image[0] || "",
    },
  };
}

export default async function ProductDetailPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;

  const productId = searchParams.id;

  if (!productId) {
    return <div className="text-center text-red-500">Product not found</div>;
  }

  // Fetch the current product
  const product = (await prisma.product.findUnique({
    where: { id: productId },
  })) as Product;

  if (!product) {
    return <div className="text-center text-red-500">Product not found</div>;
  }

  // Fetch related products
  const relatedProducts = (await prisma.product.findMany({
    where: {
      id: { not: productId }, // Exclude the current product
      AND: [
        { category: product.category },
        { subcategory: product.subcategory },
        { gender: product.gender },
      ],
    },
    take: 3, // Limit to 4 related products
  })) as Product[];

  return (
    <>
      <div className="max-w-7xl mx-auto py-12 px-6 bg-black overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Product Images */}
          <div className="flex justify-center lg:justify-start w-full lg:w-1/2">
            <ProductImageViewer images={product.image} />
          </div>

          {/* Right Side - Product Details */}
          <div className="w-full lg:w-1/2">
            <h1 className="text-4xl font-bold mb-4 text-white">
              {product.name}
            </h1>
            <div className="mb-4 flex items-center">
              {isLoggedIn ? (
                <span className="text-2xl font-semibold text-yellow-600 flex items-center">
                  <IndianRupee className="inline h-5 mr-1" />
                  {product.price.toFixed(2)}
                </span>
              ) : (
                <Tooltip>
                  <TooltipTrigger>
                    <span
                      className="text-2xl font-semibold text-gray-500 flex items-center cursor-pointer"
                      style={{
                        textShadow: "0 0 8px rgba(255, 255, 255, 0.2)",
                        filter: "blur(3px)",
                        opacity: 0.8,
                      }}
                    >
                      <IndianRupee className="inline h-5 mr-1" />
                      {100000}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 text-white px-4 py-2 text-sm rounded-md shadow-lg z-50">
                    Login to view the price
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Material */}
            <div className="mb-2">
              <h2 className="text-lg font-medium text-yellow-600">Material:</h2>
              <p className="text-gray-400">{product.material}</p>
            </div>

            {/* Category, Subcategory, and Gender */}
            <div className="mb-6 flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="text-yellow-600 border-yellow-600"
              >
                {product.category}
              </Badge>
              <Badge
                variant="outline"
                className="text-yellow-600 border-yellow-600"
              >
                {product.subcategory}
              </Badge>
              <Badge
                variant="outline"
                className="text-yellow-600 border-yellow-600"
              >
                {product.gender}
              </Badge>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <h2 className="text-lg font-medium text-yellow-600">Rating:</h2>
              {product.rating ? (
                <p className="text-gray-400 flex items-center gap-1">
                  <Star className="text-yellow-600" />
                  {product.rating.toFixed(1)} / 5
                </p>
              ) : (
                <p className="text-gray-400">Not yet rated</p>
              )}
            </div>

            {/* Full Description */}
            <div className="mb-6">
              <h2 className="text-lg font-medium text-yellow-600">
                Product Description:
              </h2>
              <p className="text-gray-400 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Action Buttons - Client Component */}
            <ProductActions product={product} />
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-yellow-600 mb-6">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {relatedProducts.map((product) => (
              <JewelryProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                image={product.image[0]}
                description={product.description}
                material={product.material}
                category={product.category}
                subcategory={product.subcategory}
                price={product.price}
                gender={product.gender}
                isLoggedIn={isLoggedIn} // Placeholder for logged-in status, replace with actual logic when implemented.
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
