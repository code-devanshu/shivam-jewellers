import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { storeGetAllProducts, storeGetAllCategories } from "@/lib/admin-store";
import { mockMetals } from "@/lib/mock/data";
import ProductForm from "@/components/admin/ProductForm";
import { updateProduct } from "../../actions";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const products = await storeGetAllProducts();
  const product = products.find((p) => p.id === id);
  return { title: product ? `Edit: ${product.name}` : "Edit Product" };
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [products, categories] = await Promise.all([
    storeGetAllProducts(),
    storeGetAllCategories(),
  ]);
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  const boundAction = updateProduct.bind(null, id);

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="p-1.5 text-gray-400 hover:text-brown-dark transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-dark">Edit Product</h1>
          <p className="text-sm text-gray-400 mt-0.5">{product.name}</p>
        </div>
      </div>

      <ProductForm
        action={boundAction}
        categories={categories}
        metals={mockMetals}
        product={product}
      />
    </div>
  );
}
