import { TooltipProvider } from "@radix-ui/react-tooltip";
import JewelryProductCard from "./ProductCard";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Product } from "@/model/base.model";

interface ProductsSectionProps {
  products: Product[];
}

export default async function ProductsSection({
  products,
}: ProductsSectionProps) {
  // Fetch the session (user info) on the server
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;
  return (
    <section className="py-12">
      <h2 className="text-center text-3xl font-bold text-yellow-400 mb-8">
        Our Exclusive Products
      </h2>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
        <TooltipProvider>
          {products.map((product) => (
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
        </TooltipProvider>
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <p className="text-center text-gray-400 font-medium">
          No products available at the moment.
        </p>
      )}
    </section>
  );
}
