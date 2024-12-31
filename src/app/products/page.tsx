import ProductsSection from "@/components/core/ProductsSection";
import { prisma } from "@/lib/prisma";
import { Product } from "@/model/base.model";

export const revalidate = 60; // Revalidate every 60 seconds
const Products = async () => {
  const products = (await prisma.product.findMany({
    orderBy: { createdAt: "desc" }, // Sort by creation date
  })) as Product[];

  return (
    <div className="max-w-7xl mx-auto p-2">
      <h1>Product cards</h1>
      <ProductsSection products={products} />
    </div>
  );
};

export default Products;
