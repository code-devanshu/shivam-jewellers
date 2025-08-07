"use client";
import { useRouter, useSearchParams } from "next/navigation";

const sortOptions = [
  { label: "Best Matches", value: "best" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest First", value: "newest" },
];

export default function ShopSortDropdown() {
  const router = useRouter();
  const params = useSearchParams();
  const sort = params.get("sort") || "best";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newSort = e.target.value;
    const newParams = new URLSearchParams(params.toString());
    newParams.set("sort", newSort);
    newParams.delete("page"); // reset to first page on sort
    router.push(`/shop?${newParams.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-600 font-medium">Sort By:</span>
      <select
        className="border border-gray-300 rounded-full px-4 py-2 font-semibold text-gray-700 shadow-sm focus:border-pink-400 transition"
        value={sort}
        onChange={handleChange}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
