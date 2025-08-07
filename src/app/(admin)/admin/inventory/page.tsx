import Link from "next/link";
import PaginationControls from "../components/PaginationControls";
import ProductTable from "../components/ProductTable";
import { getProducts } from "../actions/product-actions";
import SearchBar from "../components/SearchBar";

interface Props {
  searchParams?: { page?: string; search?: string };
}

export default async function InventoryPage({ searchParams }: Props) {
  const page = Number(searchParams?.page) || 1;
  const search = searchParams?.search || "";
  const limit = 10;

  const { products, total } = await getProducts(page, limit, { search });
  const totalPages = Math.ceil(total / limit);

  return (
    <main className="max-w-full mx-auto p-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Link href="/admin/add-product">
          <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-semibold shadow">
            + Add Product
          </button>
        </Link>
      </div>

      {/* ✅ Now client-interactive SearchBar */}
      <SearchBar />

      <div className="rounded-xl bg-white shadow-lg border border-neutral-200 p-6">
        <ProductTable products={products} />
        <PaginationControls page={page} totalPages={totalPages} />
      </div>
    </main>
  );
}
