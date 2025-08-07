"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function FilterDrawer({
  initialMin,
  initialMax,
  onClose,
}: {
  initialMin?: string | null;
  initialMax?: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [min, setMin] = useState(initialMin || "");
  const [max, setMax] = useState(initialMax || "");

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    const newParams = new URLSearchParams(params.toString());
    if (min) newParams.set("minPrice", min);
    else newParams.delete("minPrice");
    if (max) newParams.set("maxPrice", max);
    else newParams.delete("maxPrice");
    newParams.delete("page");
    router.push(`/shop?${newParams.toString()}`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Drawer/modal */}
      <div
        className="relative w-full max-w-md md:max-w-sm bg-white rounded-t-2xl md:rounded-2xl shadow-2xl p-8 md:my-8 animate-slideInUp md:animate-slideInRight"
        style={{ bottom: 0, right: 0 }}
      >
        <button
          className="absolute top-4 right-4 bg-white rounded-full p-2 shadow hover:bg-pink-50"
          onClick={onClose}
          aria-label="Close filter"
          type="button"
        >
          <X className="w-6 h-6 text-pink-600" />
        </button>
        <h2 className="text-2xl font-bold mb-8 text-gray-800 font-serif">
          Filter Products
        </h2>
        <form className="space-y-7" onSubmit={handleApply}>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-500 mb-1">
              Min Price
            </label>
            <input
              type="number"
              min={0}
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="rounded-xl border border-pink-300 px-3 py-2 w-full focus:border-pink-500 focus:ring-2 focus:ring-pink-100 font-sans text-[15px] transition"
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-500 mb-1">
              Max Price
            </label>
            <input
              type="number"
              min={0}
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="rounded-xl border border-pink-300 px-3 py-2 w-full focus:border-pink-500 focus:ring-2 focus:ring-pink-100 font-sans text-[15px] transition"
              placeholder="Unlimited"
            />
          </div>
          <button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-pink-600 to-pink-500 text-white py-3 rounded-xl font-bold shadow-lg hover:scale-105 hover:from-pink-700 hover:to-pink-600 active:scale-95 transition-all text-lg tracking-wide"
          >
            Apply Filters
          </button>
        </form>
      </div>
    </div>
  );
}
