"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, Package, Plus, Pencil } from "lucide-react";
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

type StatusFilter = "ALL" | "ACTIVE" | "HIDDEN" | "FEATURED" | "LOW_STOCK";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "HIDDEN", label: "Hidden" },
  { value: "FEATURED", label: "Featured" },
  { value: "LOW_STOCK", label: "Low Stock" },
];

export default function ProductsTable({ products }: { products: ProductRow[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [metalFilter, setMetalFilter] = useState<string>("ALL");

  const metals = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; name: string }[] = [];
    for (const p of products) {
      if (!seen.has(p.metalId)) {
        seen.add(p.metalId);
        list.push({ id: p.metalId, name: p.metalName });
      }
    }
    return list;
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (statusFilter === "ACTIVE" && !p.isAvailable) return false;
      if (statusFilter === "HIDDEN" && p.isAvailable) return false;
      if (statusFilter === "FEATURED" && !p.isFeatured) return false;
      if (statusFilter === "LOW_STOCK" && p.stockQty > 3) return false;
      if (metalFilter !== "ALL" && p.metalId !== metalFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.metalName.toLowerCase().includes(q) ||
        p.purity.toLowerCase().includes(q)
      );
    });
  }, [products, query, statusFilter, metalFilter]);

  const hasFilters = query !== "" || statusFilter !== "ALL" || metalFilter !== "ALL";

  function clearAll() {
    setQuery("");
    setStatusFilter("ALL");
    setMetalFilter("ALL");
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, category, metal, purity…"
            className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-rose-gold/30 focus:border-rose-gold/60 placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                statusFilter === opt.value
                  ? "bg-rose-gold text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {metals.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setMetalFilter("ALL")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                metalFilter === "ALL"
                  ? "bg-brown-dark text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              All Metals
            </button>
            {metals.map((m) => (
              <button
                key={m.id}
                onClick={() => setMetalFilter(m.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  metalFilter === m.id
                    ? "bg-brown-dark text-white"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
          <Package size={36} className="text-gray-200 mx-auto mb-3" />
          {hasFilters ? (
            <>
              <p className="text-gray-400 text-sm">No products match your filters.</p>
              <button
                onClick={clearAll}
                className="mt-2 text-xs text-rose-gold hover:underline"
              >
                Clear filters
              </button>
            </>
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
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-2.5 border-b border-gray-100 bg-gray-50/60">
            <p className="text-xs text-gray-400">
              {filtered.length === products.length
                ? `${products.length} product${products.length !== 1 ? "s" : ""}`
                : `${filtered.length} of ${products.length} products`}
              {hasFilters && (
                <button onClick={clearAll} className="ml-2 text-rose-gold hover:underline">
                  Clear filters
                </button>
              )}
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
              {filtered.map((p) => (
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
      )}
    </div>
  );
}
