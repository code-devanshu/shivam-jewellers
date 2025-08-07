"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginationControls({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("page", newPage.toString());
    router.push(`/admin?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex justify-center items-center gap-3 mt-12">
      <button
        className="p-2 rounded disabled:opacity-30 hover:bg-pink-50"
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        aria-label="Previous Page"
      >
        <ChevronLeft />
      </button>
      <span className="px-4 font-semibold text-gray-700">
        Page {page} of {totalPages}
      </span>
      <button
        className="p-2 rounded disabled:opacity-30 hover:bg-pink-50"
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next Page"
      >
        <ChevronRight />
      </button>
    </nav>
  );
}
