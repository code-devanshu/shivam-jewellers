import { getMetalRates } from "../../actions/metal-actions";
import ProductForm from "../../components/ProductForm";

export default async function AddProductPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const { error } = searchParams ? await searchParams : {};
  const rates = await getMetalRates();
  return (
    <main className="max-w-4xl mx-auto py-10">
      <div className="rounded-xl bg-white shadow-lg border border-neutral-200 p-8">
        <h2 className="text-2xl font-bold mb-4">Add Product</h2>
        <ProductForm error={error} metalRates={rates ?? undefined} />
      </div>
    </main>
  );
}
