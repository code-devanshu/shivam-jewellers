import AddressSection from "@/components/core/AddreessSection";
import CountdownTimer from "@/components/core/CountdownTimer";
import Gallery from "@/components/core/Gallery";
import { RingIcon, NecklaceIcon } from "@/components/core/JewelryIcon";
import ProductsSection from "@/components/core/ProductsSection";
import { prisma } from "@/lib/prisma";
import { Product } from "@/model/base.model";
import { Gem } from "lucide-react";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  try {
    const products = (await prisma.product.findMany({
      take: 6, // Limit to 10 records
      orderBy: { createdAt: "desc" }, // Sort by creation date
    })) as Product[];

    return (
      <div className="bg-black">
        {/* Hero Section */}
        <div className="min-h-[70vh] flex flex-col items-center justify-center py-12">
          <div className="bg-black bg-opacity-50 p-12 rounded-lg text-center max-w-4xl w-full mx-4 mb-12">
            <div className="flex justify-center space-x-8 mb-8">
              <RingIcon className="w-12 h-12 text-yellow-400" />
              <Gem className="w-12 h-12 text-yellow-400" />
              <NecklaceIcon className="w-12 h-12 text-yellow-400" />
            </div>
            <h1 className="text-5xl font-bold text-yellow-400 mb-4">
              Shivam Jewellers
            </h1>
            <p className="text-2xl text-white mb-12">
              Our online store is coming soon
            </p>
            <CountdownTimer targetDate="2025-01-20T23:59:59Z" />
            <p className="text-white mt-12 text-lg">
              Get ready for a dazzling collection of fine jewelry
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Products Section */}
          <ProductsSection products={products} />
          <Gallery />
          <AddressSection />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in Home component:", error);
    return (
      <div className="text-center text-red-500">
        Failed to load products. Please try again later.
      </div>
    );
  }
}
