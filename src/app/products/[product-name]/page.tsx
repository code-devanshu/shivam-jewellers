import { prisma } from "@/lib/prisma";
import { IndianRupee, Star } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Badge } from "@/components/ui/badge";
import ProductImageViewer from "../components/ProductImageViewer";
import { Product } from "@/model/base.model";

export default async function ProductDetailPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  // Fetch session and product data
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;

  const productId = searchParams.id;

  if (!productId) {
    return <div className="text-center text-red-500">Product not found</div>;
  }

  const product = (await prisma.product.findUnique({
    where: { id: productId },
  })) as Product;

  if (!product) {
    return <div className="text-center text-red-500">Product not found</div>;
  }

  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto py-12 px-6 bg-black">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Client Component */}
          <ProductImageViewer images={product.image} />

          {/* Right Side - Server Component */}
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

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Button className="bg-yellow-600 text-black hover:bg-yellow-700 px-6 py-3">
                Add to Cart
              </Button>
              <Button
                variant="outline"
                className="text-yellow-600 border-yellow-600 hover:bg-yellow-700 hover:text-black"
              >
                Favorite
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
