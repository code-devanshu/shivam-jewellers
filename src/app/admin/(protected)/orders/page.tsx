import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/price";
import { ArrowRight, ShoppingBag } from "lucide-react";
import type { OrderStatus } from "@prisma/client";

export const metadata = { title: "Orders" };

const STATUS_MAP: Record<OrderStatus, { label: string; cls: string }> = {
  CONFIRMED: { label: "Confirmed", cls: "bg-green-100 text-green-700" },
  PENDING_PAYMENT: { label: "Payment Pending", cls: "bg-yellow-100 text-yellow-700" },
  PROCESSING: { label: "Processing", cls: "bg-blue-100 text-blue-700" },
  SHIPPED: { label: "Shipped", cls: "bg-purple-100 text-purple-700" },
  DELIVERED: { label: "Delivered", cls: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
  PENDING: { label: "Pending", cls: "bg-gray-100 text-gray-600" },
  READY_FOR_PICKUP: { label: "Ready for Pickup", cls: "bg-teal-100 text-teal-700" },
};

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "PENDING_PAYMENT", label: "Payment Pending" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filterStatus = (status as OrderStatus | undefined) || undefined;

  const orders = await db.order.findMany({
    where: filterStatus ? { status: filterStatus } : undefined,
    include: {
      customer: true,
      items: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-brown-dark">Orders</h1>
        <p className="text-sm text-gray-400 mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => {
          const active = (filterStatus ?? "") === f.value;
          const href = f.value ? `/admin/orders?status=${f.value}` : "/admin/orders";
          return (
            <Link
              key={f.value}
              href={href}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                active
                  ? "bg-rose-gold text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <ShoppingBag size={24} />
          </div>
          <h2 className="font-semibold text-brown-dark mb-2">No orders yet</h2>
          <p className="text-sm text-gray-400">Orders will appear here once customers start placing them.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium">Order</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Customer</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Items</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Total</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => {
                const badge = STATUS_MAP[order.status];
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-brown-dark">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{fmtDate(order.createdAt)}</p>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <p className="text-brown-dark">{order.customer.name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{order.customer.email ?? ""}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-500 hidden lg:table-cell">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-brown-dark hidden md:table-cell">
                      {formatPrice(Number(order.totalAmount))}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-1.5 text-gray-400 hover:text-rose-gold transition-colors inline-flex"
                        aria-label="View order"
                      >
                        <ArrowRight size={15} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
