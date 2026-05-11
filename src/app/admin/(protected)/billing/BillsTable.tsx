"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Receipt, Plus, X } from "lucide-react";
import { formatPrice } from "@/lib/price";
import type { BillStatus } from "@prisma/client";

const STATUS_STYLE: Record<BillStatus, string> = {
  PAID: "bg-green-100 text-green-700",
  PARTIAL: "bg-yellow-100 text-yellow-700",
  UNPAID: "bg-red-100 text-red-700",
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export type BillRow = {
  id: string;
  billNumber: string;
  customerName: string | null;
  customerPhone: string | null;
  createdAt: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: BillStatus;
};

const STATUS_OPTIONS: { value: BillStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PAID", label: "Paid" },
  { value: "PARTIAL", label: "Partial" },
  { value: "UNPAID", label: "Unpaid" },
];

export default function BillsTable({ bills }: { bills: BillRow[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BillStatus | "ALL">("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bills.filter((b) => {
      const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      return (
        b.billNumber.toLowerCase().includes(q) ||
        (b.customerName?.toLowerCase().includes(q) ?? false) ||
        (b.customerPhone?.includes(q) ?? false)
      );
    });
  }, [bills, query, statusFilter]);

  if (bills.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
        <Receipt size={36} className="text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">No bills yet.</p>
        <Link
          href="/admin/billing/new"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-rose-gold hover:text-rose-gold-dark font-medium"
        >
          <Plus size={14} /> Create your first bill
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Search + filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bill #, customer, phone…"
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
        <div className="flex items-center gap-1.5">
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
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-gray-400 text-sm">No bills match your search.</p>
          <button
            onClick={() => { setQuery(""); setStatusFilter("ALL"); }}
            className="mt-2 text-xs text-rose-gold hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Bill #</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Paid</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Balance</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/billing/${bill.id}`}
                      className="font-semibold text-rose-gold hover:underline"
                    >
                      {bill.billNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-brown-dark">{bill.customerName ?? "Walk-in"}</p>
                    {bill.customerPhone && (
                      <p className="text-xs text-gray-400">{bill.customerPhone}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{fmtDate(bill.createdAt)}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-brown-dark">
                    {formatPrice(bill.totalAmount)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-green-700 font-medium">
                    {formatPrice(bill.amountPaid)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-red-600 font-medium">
                    {bill.balanceDue > 0 ? formatPrice(bill.balanceDue) : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[bill.status]}`}>
                      {bill.status === "PAID" ? "Paid" : bill.status === "PARTIAL" ? "Partial" : "Unpaid"}
                    </span>
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
