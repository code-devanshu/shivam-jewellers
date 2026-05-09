import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { storeGetAllProducts } from "@/lib/admin-store";
import { getLiveRates } from "@/lib/live-rates";
import { formatPrice, calculatePrice } from "@/lib/price";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const [products, rates] = await Promise.all([
    storeGetAllProducts(),
    getLiveRates(),
  ]);

  const rateMap = Object.fromEntries(rates.map((r) => [r.metalId, r.ratePerGram]));

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

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
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
            {products.map((p) => {
              const rate = rateMap[p.metalId] ?? 0;
              const { totalPrice } = calculatePrice(p, rate);
              return (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="font-medium text-brown-dark">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.category.name}</div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 hidden lg:table-cell">
                    {p.metal.name} · {p.purity} · {p.weightGrams}g
                  </td>
                  <td className="px-5 py-3 font-medium text-brown-dark hidden md:table-cell">
                    {rate ? formatPrice(totalPrice) : "—"}
                  </td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{p.stockQty}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        p.isAvailable
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
