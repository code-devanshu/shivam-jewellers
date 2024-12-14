import AddressSection from "@/components/AddreessSection";
import CountdownTimer from "@/components/CountdownTimer";
import Gallery from "@/components/Gallery";
import { RingIcon, NecklaceIcon } from "@/components/JewelryIcon";
import { Gem } from "lucide-react";
import ProductsSection from "./components/ProductsSection";

export default async function Home() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products`,
      {
        method: "GET",
        cache: "no-store", // Ensure fresh data is fetched every time
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch products:", response.statusText);
      throw new Error("Failed to fetch products");
    }

    const products = await response.json();

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
            <CountdownTimer targetDate="2024-12-23T23:59:59Z" />
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
