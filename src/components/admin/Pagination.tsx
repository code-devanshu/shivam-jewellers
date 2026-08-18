"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

function getPageNumbers(page: number, totalPages: number): (number | "...")[] {
  const siblings = 1;
  const start = Math.max(2, page - siblings);
  const end = Math.min(totalPages - 1, page + siblings);

  const pages: (number | "...")[] = [1];
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);

  return pages;
}

export default function Pagination({
  page,
  totalPages,
  isPending = false,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  isPending?: boolean;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || isPending}
        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-rose-gold disabled:opacity-30 disabled:hover:text-gray-500 transition-colors px-2 py-1.5"
        aria-label="Previous page"
      >
        <ChevronLeft size={14} />
        Prev
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-xs text-gray-300 select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              disabled={isPending}
              aria-current={p === page ? "page" : undefined}
              className={`min-w-[28px] h-7 rounded-full text-xs font-semibold transition-colors disabled:opacity-50 ${
                p === page
                  ? "bg-rose-gold text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || isPending}
        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-rose-gold disabled:opacity-30 disabled:hover:text-gray-500 transition-colors px-2 py-1.5"
        aria-label="Next page"
      >
        Next
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
