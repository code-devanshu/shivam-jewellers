import Link from "next/link";
import { Plus } from "lucide-react";
import { storeGetAllProducts } from "@/lib/admin-store";
import { getLiveRates } from "@/lib/live-rates";
import { calculatePrice } from "@/lib/price";
import ProductsTable, { type ProductRow } from "./ProductsTable";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const [products, rates] = await Promise.all([
    storeGetAllProducts(),
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-dark">Products</h1>
          <p className="text-sm text-gray-400 mt-1">{products.length} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-rose-gold hover:bg-rose-gold-dark text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-colors"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <ProductsTable products={rows} />
    </div>
  );
}
