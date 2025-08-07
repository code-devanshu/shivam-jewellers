import { getMetalRates } from "../actions/metal-actions";
import { getProducts } from "../actions/product-actions";
import ProductForm from "../components/ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; error?: string }>;
}) {
  const { id, error } = await searchParams;

  if (!id) return notFound();

  const { products } = await getProducts();
  const rates = await getMetalRates();

  const product = products.find((p) => p.id === id);
  if (!product) return notFound();

  return (
    <main className="max-w-4xl mx-auto py-10">
      <div className="rounded-xl bg-white shadow-lg border border-neutral-200 p-8">
        <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
        <ProductForm
          initial={product}
          isEdit
          error={error}
          metalRates={rates}
        />
      </div>
    </main>
  );
}
