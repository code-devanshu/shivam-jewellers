import Link from "next/link";
import { Package, Plus, Pencil } from "lucide-react";
import { formatPrice } from "@/lib/price";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export type ProductRow = {
  id: string;
  name: string;
  categoryName: string;
  metalName: string;
  metalId: string;
  purity: string;
  weightGrams: number;
  stockQty: number;
  isAvailable: boolean;
  isFeatured: boolean;
  price: number | null;
};

export default function ProductsTable({
  products,
  filteredCount,
  hasFilters,
}: {
  products: ProductRow[];
  filteredCount: number;
  hasFilters: boolean;
}) {
  if (products.length === 0) {
    return (
      <div className="p-16 text-center">
        <Package size={36} className="text-gray-200 mx-auto mb-3" />
        {hasFilters ? (
          <p className="text-gray-400 text-sm">No products match your filters.</p>
        ) : (
          <>
            <p className="text-gray-400 text-sm">No products yet.</p>
            <Link
              href="/admin/products/new"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-rose-gold hover:text-rose-gold-dark font-medium"
            >
              <Plus size={14} /> Add your first product
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="px-5 py-2.5 border-b border-gray-100 bg-gray-50/60">
        <p className="text-xs text-gray-400">
          {filteredCount} product{filteredCount !== 1 ? "s" : ""}
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
            <th className="text-left px-5 py-3 font-medium">Product</th>
            <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Metal / Purity</th>
            <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Price</th>
            <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Stock</th>
            <th className="text-left px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-5 py-3">
                <div className="font-medium text-brown-dark">{p.name}</div>
                <div className="text-xs text-gray-400">{p.categoryName}</div>
              </td>
              <td className="px-5 py-3 text-gray-500 hidden lg:table-cell">
                {p.metalName} · {p.purity} · {p.weightGrams}g
              </td>
              <td className="px-5 py-3 font-medium text-brown-dark hidden md:table-cell">
                {p.price != null ? formatPrice(p.price) : "—"}
              </td>
              <td className="px-5 py-3 hidden md:table-cell">
                <span
                  className={`text-sm font-medium ${
                    p.stockQty <= 0
                      ? "text-red-500"
                      : p.stockQty <= 3
                      ? "text-amber-500"
                      : "text-gray-500"
                  }`}
                >
                  {p.stockQty}
                </span>
              </td>
              <td className="px-5 py-3">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    p.isAvailable ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {p.isAvailable ? "Active" : "Hidden"}
                </span>
                {p.isFeatured && (
                  <span className="ml-1.5 inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-gold/10 text-rose-gold">
                    Featured
                  </span>
                )}
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-2 justify-end">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="p-1.5 text-gray-400 hover:text-rose-gold transition-colors"
                    aria-label="Edit"
                  >
                    <Pencil size={15} />
                  </Link>
                  <DeleteProductButton id={p.id} name={p.name} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
