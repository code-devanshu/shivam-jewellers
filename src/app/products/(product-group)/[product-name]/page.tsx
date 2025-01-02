import { Suspense } from "react";
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
import JewelryProductCard from "@/components/core/ProductCard";
import { Product } from "@/model/base.model";
import RelatedProductsSkeleton from "./RelatedProductsSkeleton";

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

  // Fetch the main product details
  const product = (await prisma.product.findUnique({
    where: { id: productId },
  })) as Product;

  if (!product) {
    return <div className="text-center text-red-500">Product not found</div>;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto py-12 px-2 lg:px-6 bg-black overflow-hidden">
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
            <ProductActions isLoggedIn={isLoggedIn} product={product} />
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-yellow-600 mb-6">
            Related Products
          </h2>
          <Suspense fallback={<RelatedProductsSkeleton />}>
            {/* Related Products */}
            <RelatedProducts
              productId={productId}
              isLoggedIn={isLoggedIn}
              product={product}
            />
          </Suspense>
        </div>
      </div>
    </>
  );
}

async function RelatedProducts({
  productId,
  product,
  isLoggedIn,
}: {
  productId: string;
  product: Product;
  isLoggedIn: boolean;
}) {
  const relatedProducts = (await prisma.product.findMany({
    where: {
      id: { not: productId }, // Exclude the current product
      AND: [
        { category: product.category },
        { subcategory: product.subcategory },
        { gender: product.gender },
      ],
    },
    take: 3, // Limit to 3 related products
  })) as Product[];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
      {relatedProducts.map((product) => (
        <JewelryProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          image={product.image}
          description={product.description}
          material={product.material}
          category={product.category}
          subcategory={product.subcategory}
          price={product.price}
          gender={product.gender}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
  );
}
