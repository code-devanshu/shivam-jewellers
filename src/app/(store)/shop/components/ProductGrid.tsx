import { Product } from "@/types/product";
import ProductCard from "../../components/ProductCard";

export default function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length)
    return (
      <div className="text-center text-gray-400 py-20 text-xl font-semibold">
        No products found.
      </div>
    );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
