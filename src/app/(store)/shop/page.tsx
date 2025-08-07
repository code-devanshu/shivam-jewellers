import { getProducts } from "@/app/(admin)/admin/actions/product-actions";
import ProductGrid from "./components/ProductGrid";
import ShopFilterBar from "./components/ShopFilterBar";
import ShopSortDropdown from "./components/ShopSortDropdown";

interface ShopPageProps {
  searchParams: {
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: ShopPageProps["searchParams"];
}) {
  const page = Number(searchParams?.page) || 1;
  const limit = 12;
  const minPrice = searchParams?.minPrice
    ? Number(searchParams.minPrice)
    : undefined;
  const maxPrice = searchParams?.maxPrice
    ? Number(searchParams.maxPrice)
    : undefined;
  const sort = searchParams?.sort || "best";

  // Use your getProducts action with filter and sort
  const { products, total } = await getProducts(page, limit, {
    minPrice,
    maxPrice,
    sort,
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 font-serif">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h1 className="text-3xl md:text-4xl font-serif font-extrabold tracking-tight text-gray-800 flex items-center gap-3">
          Earrings
          <span className="text-lg font-sans font-medium text-gray-400">
            ({total} results)
          </span>
        </h1>
        <div className="mt-4 md:mt-0">
          <ShopSortDropdown />
        </div>
      </div>
      <ShopFilterBar />
      <ProductGrid products={products} />
    </main>
  );
}
