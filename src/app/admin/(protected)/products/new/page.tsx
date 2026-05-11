import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { storeGetAllCategories } from "@/lib/admin-store";
import { mockMetals } from "@/lib/mock/data";
import ProductForm from "@/components/admin/ProductForm";
import { createProduct } from "../actions";

export const metadata = { title: "Add Product" };

export default async function NewProductPage() {
  const categories = await storeGetAllCategories();

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="p-1.5 text-gray-400 hover:text-brown-dark transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-dark">Add Product</h1>
          <p className="text-sm text-gray-400 mt-0.5">Create a new product listing</p>
        </div>
      </div>

      <ProductForm action={createProduct} categories={categories} metals={mockMetals} />
    </div>
  );
}
