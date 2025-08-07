"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  useEffect(() => {
    // Sync with URL if search is changed outside
    setQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", query);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
    setQuery("");
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-wrap items-center gap-2 mb-4"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="w-full md:w-1/3 border rounded px-4 py-2"
      />

      <button
        type="submit"
        className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded"
      >
        Search
      </button>

      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded border"
        >
          Clear
        </button>
      )}
    </form>
  );
}
