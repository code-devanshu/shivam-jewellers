import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IndianRupee } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TooltipProvider } from "@radix-ui/react-tooltip";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch the session (user info) on the server
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;

  // Fetch product data from Prisma or API
  const product = (await prisma.product.findUnique({
    where: { id: params.id },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })) as unknown as any;

  if (!product) {
    return <div className="text-center text-red-500">Product not found</div>;
  }

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Product Image */}
          <div className="relative w-full lg:w-1/2 h-96">
            <Image
              src={product.image}
              alt={product.name}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>

          {/* Product Details */}
          <div className="w-full lg:w-1/2">
            <h1 className="text-3xl font-bold mb-4 text-white">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mb-4">
              {isLoggedIn ? (
                <span className="text-xl font-semibold text-yellow-600 flex items-center">
                  <IndianRupee className="inline h-5 mr-1" />
                  {product.price.toFixed(2)}
                </span>
              ) : (
                <Tooltip>
                  <TooltipTrigger>
                    {/* Blurred Price */}
                    <span
                      className="text-xl font-semibold text-yellow-600 flex items-center cursor-pointer"
                      style={{
                        textShadow: "0 0 8px rgba(255, 255, 255, 0.5)",
                        filter: "blur(3px)",
                        opacity: 0.7,
                      }}
                    >
                      <IndianRupee className="inline h-5 mr-1" />
                      {100000}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-white px-4 py-2 text-sm rounded-md shadow-lg z-50">
                    Login to view the price
                  </TooltipContent>
                </Tooltip>
              )}
              <Badge
                variant="outline"
                className="px-3 py-1 rounded-full text-sm"
              >
                {product.gender}
              </Badge>
            </div>
            <p className="text-gray-300 mb-4">{product.description}</p>
            <div className="flex gap-2">
              {product.category && (
                <Badge
                  variant="outline"
                  className="px-3 py-1 rounded-full text-sm"
                >
                  {product.category}
                </Badge>
              )}
              {product.subcategory && (
                <Badge
                  variant="outline"
                  className="px-3 py-1 rounded-full text-sm"
                >
                  {product.subcategory}
                </Badge>
              )}
            </div>

            <Button className="mt-8 bg-yellow-500 text-white hover:bg-yellow-600">
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
