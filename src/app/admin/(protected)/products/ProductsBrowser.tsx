"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { ChevronDown, Plus, Search, X } from "lucide-react";
import ProductsTableSkeleton from "./ProductsTableSkeleton";
import Pagination from "@/components/admin/Pagination";
import type { AdminProductStatusFilter } from "@/lib/admin-store";

const STATUS_OPTIONS: { value: AdminProductStatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "HIDDEN", label: "Hidden" },
  { value: "FEATURED", label: "Featured" },
  { value: "LOW_STOCK", label: "Low Stock" },
];

type FilterState = { q: string; status: AdminProductStatusFilter; metal: string; page: number };

function hrefFor(state: FilterState) {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.status !== "ALL") params.set("status", state.status);
  if (state.metal !== "ALL") params.set("metal", state.metal);
  if (state.page > 1) params.set("page", String(state.page));
  const qs = params.toString();
  return `/admin/products${qs ? `?${qs}` : ""}`;
}

export default function ProductsBrowser({
  query,
  status,
  metal,
  metals,
  page,
  totalPages,
  totalCount,
  children,
}: {
  query: string;
  status: AdminProductStatusFilter;
  metal: string;
  metals: { id: string; name: string }[];
  page: number;
  totalPages: number;
  totalCount: number;
  children: ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [queryInput, setQueryInput] = useState(query);
  const [prevQuery, setPrevQuery] = useState(query);
  const isFirstRender = useRef(true);

  if (query !== prevQuery) {
    setPrevQuery(query);
    setQueryInput(query);
  }

  const go = (overrides: Partial<FilterState>) => {
    const next = { q: query, status, metal, page, ...overrides };
    startTransition(() => {
      router.push(hrefFor(next), { scroll: false });
    });
  };

  const hasFilters = query !== "" || status !== "ALL" || metal !== "ALL";

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (queryInput === query) return;
    const timer = setTimeout(() => go({ q: queryInput, page: 1 }), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryInput]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-dark">Products</h1>
          <p className="text-sm text-gray-400 mt-1">{totalCount} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-rose-gold hover:bg-rose-gold-dark text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-colors"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 border-b border-gray-100">
          <div className="relative flex-1 min-w-50 max-w-xs">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-8 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-gold/30 focus:border-rose-gold/60 placeholder:text-gray-400"
            />
            {queryInput && (
              <button
                type="button"
                onClick={() => setQueryInput("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={status}
              onChange={(e) => go({ status: e.target.value as AdminProductStatusFilter, page: 1 })}
              className="appearance-none text-sm border border-gray-200 rounded-lg pl-2.5 pr-7 py-1.5 bg-white text-gray-600 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-gold/30 cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {metals.length > 1 && (
            <div className="relative">
              <select
                value={metal}
                onChange={(e) => go({ metal: e.target.value, page: 1 })}
                className="appearance-none text-sm border border-gray-200 rounded-lg pl-2.5 pr-7 py-1.5 bg-white text-gray-600 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-gold/30 cursor-pointer"
              >
                <option value="ALL">All Metals</option>
                {metals.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          )}

          {hasFilters && (
            <button
              type="button"
              onClick={() => go({ q: "", status: "ALL", metal: "ALL", page: 1 })}
              className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-rose-gold transition-colors ml-auto"
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>

        {isPending ? <ProductsTableSkeleton /> : children}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        isPending={isPending}
        onPageChange={(p) => go({ page: p })}
      />
    </>
  );
}
