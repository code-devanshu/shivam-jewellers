import Link from "next/link";
import { requireCustomer } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/price";
import { ArrowRight, Package, ShoppingBag } from "lucide-react";

export const metadata = { title: "My Orders", robots: { index: false, follow: false } };

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  CONFIRMED: { label: "Confirmed", cls: "bg-green-100 text-green-700" },
  PENDING_PAYMENT: { label: "Payment Pending", cls: "bg-yellow-100 text-yellow-700" },
  PROCESSING: { label: "Processing", cls: "bg-blue-100 text-blue-700" },
  SHIPPED: { label: "Shipped", cls: "bg-purple-100 text-purple-700" },
  DELIVERED: { label: "Delivered", cls: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
  PENDING: { label: "Pending", cls: "bg-gray-100 text-gray-600" },
  READY_FOR_PICKUP: { label: "Ready for Pickup", cls: "bg-teal-100 text-teal-700" },
};

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function OrdersPage() {
  const customerId = await requireCustomer("/orders");

  const orders = await db.order.findMany({
    where: { customerId },
    include: {
      items: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-serif font-bold text-brown-dark mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={48} className="mx-auto text-blush mb-4" />
          <p className="text-brown/60 mb-6">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-rose-gold hover:bg-rose-gold-dark text-white px-6 py-3 rounded-full text-sm font-semibold transition"
          >
            Shop Now <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = STATUS_MAP[order.status] ?? { label: order.status, cls: "bg-gray-100 text-gray-600" };
            const itemCount = order.items.length;
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white border border-blush rounded-2xl px-6 py-5 hover:border-rose-gold/40 hover:shadow-sm transition group"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-xs text-brown/50 uppercase tracking-wider font-medium mb-0.5">
                      Order Number
                    </p>
                    <p className="font-bold text-brown-dark text-base">{order.orderNumber}</p>
                    <p className="text-xs text-brown/40 mt-1">{fmtDate(order.createdAt)}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1.5 text-sm text-brown/60">
                    <Package size={14} className="text-rose-gold" />
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-rose-gold-dark">
                      {formatPrice(Number(order.totalAmount))}
                    </span>
                    <ArrowRight size={15} className="text-brown/30 group-hover:text-rose-gold transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
