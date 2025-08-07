"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

export default function ShopSidebar({
  minPrice,
  maxPrice,
}: {
  minPrice?: number;
  maxPrice?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [min, setMin] = useState(minPrice || "");
  const [max, setMax] = useState(maxPrice || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams?.toString());
    if (min) params.set("minPrice", min.toString());
    else params.delete("minPrice");
    if (max) params.set("maxPrice", max.toString());
    else params.delete("maxPrice");
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  };

  const resetFilters = () => {
    setMin("");
    setMax("");
    const params = new URLSearchParams(searchParams?.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <aside className="sticky top-32 h-fit bg-white/80 backdrop-blur-md border border-pink-200 rounded-2xl shadow-xl px-8 py-10 w-72 flex-shrink-0 hidden md:block font-serif transition-all">
      <div className="flex items-center gap-3 mb-7">
        <div className="bg-gradient-to-br from-pink-500 to-yellow-300 rounded-full p-2">
          <SlidersHorizontal className="text-white w-5 h-5 drop-shadow" />
        </div>
        <h2 className="text-xl font-extrabold tracking-wide text-gray-800">
          Filters
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-7">
        <div className="space-y-2">
          <label className="block text-[13px] font-semibold text-gray-500 mb-1">
            Price Range
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="rounded-xl border border-pink-300 px-3 py-2 w-24 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 font-sans text-[15px] transition"
              placeholder="Min"
              min={0}
            />
            <span className="text-gray-400">—</span>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="rounded-xl border border-pink-300 px-3 py-2 w-24 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 font-sans text-[15px] transition"
              placeholder="Max"
              min={0}
            />
          </div>
        </div>
        {/* Divider line */}
        <div className="border-t border-dashed border-pink-100 my-3" />
        <button
          type="submit"
          className="w-full py-3 mt-2 font-bold bg-gradient-to-r from-pink-600 via-pink-500 to-yellow-400 rounded-xl shadow hover:scale-105 hover:from-pink-700 hover:to-yellow-500 active:scale-95 transition-all text-white text-lg tracking-wide"
        >
          Apply Filters
        </button>
        <button
          type="button"
          className="w-full text-pink-600 hover:text-pink-700 mt-1 text-sm underline transition"
          onClick={resetFilters}
        >
          Reset Filters
        </button>
      </form>
      {/* For future: More filter sections below */}
    </aside>
  );
}
