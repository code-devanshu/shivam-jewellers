"use client";

import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import CustomersTableSkeleton from "./CustomersTableSkeleton";
import Pagination from "@/components/admin/Pagination";

function hrefFor(leadsOnly: boolean, page: number) {
  const params = new URLSearchParams();
  if (!leadsOnly) params.set("filter", "all");
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/admin/customers${qs ? `?${qs}` : ""}`;
}

export default function CustomersBrowser({
  leadsOnly,
  page,
  totalPages,
  totalCount,
  leadsCount,
  children,
}: {
  leadsOnly: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  leadsCount: number;
  children: ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const go = (href: string) => {
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-brown-dark">Customers</h1>
        <p className="text-sm text-gray-400 mt-1">
          {totalCount} total · {leadsCount} with items in cart
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <select
              value={leadsOnly ? "leads" : "all"}
              onChange={(e) => go(hrefFor(e.target.value !== "all", 1))}
              className="appearance-none text-sm border border-gray-200 rounded-lg pl-2.5 pr-7 py-1.5 bg-white text-gray-600 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-gold/30 cursor-pointer"
            >
              <option value="leads">Leads (has cart)</option>
              <option value="all">All customers</option>
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {isPending ? <CustomersTableSkeleton /> : children}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        isPending={isPending}
        onPageChange={(p) => go(hrefFor(leadsOnly, p))}
      />
    </>
  );
}
