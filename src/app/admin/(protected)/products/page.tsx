import { adminGetProductsPage, storeGetMetals, type AdminProductStatusFilter } from "@/lib/admin-store";
import { getLiveRates } from "@/lib/live-rates";
import { calculatePrice } from "@/lib/price";
import { db } from "@/lib/db";
import ProductsBrowser from "./ProductsBrowser";
import ProductsTable, { type ProductRow } from "./ProductsTable";

export const metadata = { title: "Products" };

const PAGE_SIZE = 20;
const STATUS_VALUES: AdminProductStatusFilter[] = ["ALL", "ACTIVE", "HIDDEN", "FEATURED", "LOW_STOCK"];

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; metal?: string; page?: string }>;
}) {
  const { q, status: statusParam, metal, page: pageParam } = await searchParams;
  const status = STATUS_VALUES.includes(statusParam as AdminProductStatusFilter)
    ? (statusParam as AdminProductStatusFilter)
    : "ALL";
  const query = q?.trim() || undefined;
  const page = Math.max(1, Number(pageParam) || 1);

  const [{ products, totalCount: filteredCount }, allMetals, allProductsCount, rates] = await Promise.all([
    adminGetProductsPage(
      { status, metalId: metal, query },
      { skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE },
    ),
    storeGetMetals(),
    db.product.count(),
    getLiveRates(),
  ]);

  const rateMap = Object.fromEntries(rates.map((r) => [r.metalId, r.ratePerGram]));

  const rows: ProductRow[] = products.map((p) => {
    const rate = rateMap[p.metalId] ?? 0;
    const price = rate > 0 ? calculatePrice(p, rate).totalPrice : null;
    return {
      id: p.id,
      name: p.name,
      categoryName: p.category.name,
      metalName: p.metal.name,
      metalId: p.metalId,
      purity: p.purity,
      weightGrams: p.weightGrams,
      stockQty: p.stockQty,
      isAvailable: p.isAvailable,
      isFeatured: p.isFeatured,
      price,
    };
  });

  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const hasFilters = Boolean(query) || status !== "ALL" || Boolean(metal);

  return (
    <div className="p-8">
      <ProductsBrowser
        query={q ?? ""}
        status={status}
        metal={metal ?? "ALL"}
        metals={allMetals}
        page={page}
        totalPages={totalPages}
        totalCount={allProductsCount}
      >
        <ProductsTable products={rows} filteredCount={filteredCount} hasFilters={hasFilters} />
      </ProductsBrowser>
    </div>
  );
}
