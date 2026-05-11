"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "../actions";
import type { OrderStatus } from "@prisma/client";

const ALL_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "PENDING_PAYMENT", label: "Payment Pending" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function StatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === currentStatus && !note.trim()) return;
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, status, note || undefined);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Order status updated");
        setNote("");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-brown-dark focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
          Note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Dispatched via BlueDart, AWB #12345"
          rows={2}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-brown-dark focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors resize-none placeholder-gray-300"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2 bg-rose-gold hover:bg-rose-gold-dark text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-60"
      >
        {isPending ? "Updating…" : "Update Status"}
      </button>
    </form>
  );
}
