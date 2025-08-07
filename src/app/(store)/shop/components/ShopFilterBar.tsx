"use client";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import FilterDrawer from "./FilterDrawer";

export default function ShopFilterBar() {
  const [showDrawer, setShowDrawer] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");

  // Remove a filter
  function clearFilter(type: string) {
    const newParams = new URLSearchParams(params.toString());
    if (type === "minPrice") newParams.delete("minPrice");
    if (type === "maxPrice") newParams.delete("maxPrice");
    newParams.delete("page");
    router.push(`/shop?${newParams.toString()}`);
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 py-3 mb-7 border-b border-gray-100">
        <button
          className="flex items-center px-4 py-1 rounded-full border border-pink-200 bg-white shadow hover:bg-pink-50 transition text-pink-600 font-semibold"
          onClick={() => setShowDrawer(true)}
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" /> Filter
        </button>
        {/* Render active filter chips */}
        {minPrice && (
          <span className="flex items-center px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700 font-medium text-[15px] shadow-sm">
            ₹{minPrice} min
            <button
              className="ml-2 hover:text-red-500"
              onClick={() => clearFilter("minPrice")}
            >
              <X className="w-4 h-4" />
            </button>
          </span>
        )}
        {maxPrice && (
          <span className="flex items-center px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700 font-medium text-[15px] shadow-sm">
            ₹{maxPrice} max
            <button
              className="ml-2 hover:text-red-500"
              onClick={() => clearFilter("maxPrice")}
            >
              <X className="w-4 h-4" />
            </button>
          </span>
        )}
      </div>
      {showDrawer && (
        <FilterDrawer
          initialMin={minPrice}
          initialMax={maxPrice}
          onClose={() => setShowDrawer(false)}
        />
      )}
    </>
  );
}
