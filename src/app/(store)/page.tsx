import Image from "next/image";
import ProductCard from "./components/ProductCard";
import { getProducts } from "../(admin)/admin/actions/product-actions";
import AddressSection from "./components/AddreessSection";
import Gallery from "./components/Gallery";

export default async function HomePage() {
  const { products } = await getProducts(1, 8);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 font-serif">
      {/* Hero Section */}
      <section className="relative h-[320px] sm:h-[400px] md:h-[480px] rounded-lg overflow-hidden shadow-xl">
        <Image
          src="/hero-banner.jpg"
          alt="Elegant Jewelry Collection"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent flex flex-col justify-center items-start p-6 sm:p-12 text-white">
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight drop-shadow-lg">
            Timeless Jewelry,
            <br /> Crafted for You
          </h1>
          <a
            href="/shop"
            className="mt-6 sm:mt-8 inline-block bg-gradient-to-r from-pink-600 to-pink-500 text-white font-semibold py-3 sm:py-4 px-8 sm:px-14 rounded shadow-lg hover:from-pink-700 hover:to-pink-600 transition max-w-max"
          >
            Shop Now
          </a>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mt-16 sm:mt-20">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-8 sm:mb-10 text-gray-900 tracking-wide">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
          {products.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      <div className="mt-10">
        <Gallery />
        <AddressSection />
      </div>
    </main>
  );
}
