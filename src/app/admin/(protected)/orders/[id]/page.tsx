import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/price";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Download,
  MapPin,
  Package,
  Store,
  Truck,
  XCircle,
} from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import StatusUpdater from "./StatusUpdater";

export const metadata = { title: "Order Details" };

const STATUS_MAP: Record<OrderStatus, { label: string; cls: string; Icon: React.ElementType }> = {
  CONFIRMED: { label: "Confirmed", cls: "bg-green-100 text-green-700", Icon: CheckCircle },
  PENDING_PAYMENT: { label: "Payment Pending", cls: "bg-yellow-100 text-yellow-700", Icon: Clock },
  PROCESSING: { label: "Processing", cls: "bg-blue-100 text-blue-700", Icon: Clock },
  SHIPPED: { label: "Shipped", cls: "bg-purple-100 text-purple-700", Icon: Truck },
  DELIVERED: { label: "Delivered", cls: "bg-green-100 text-green-700", Icon: CheckCircle },
  CANCELLED: { label: "Cancelled", cls: "bg-red-100 text-red-700", Icon: XCircle },
  PENDING: { label: "Pending", cls: "bg-gray-100 text-gray-600", Icon: Clock },
  READY_FOR_PICKUP: { label: "Ready for Pickup", cls: "bg-teal-100 text-teal-700", Icon: Store },
};

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

function fmtDateTime(d: Date) {
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { orderBy: { createdAt: "asc" } },
      address: true,
      invoice: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) notFound();

  const isPickup = order.deliveryType === "STORE_PICKUP";
  const badge = STATUS_MAP[order.status];

  return (
    <div className="p-8 max-w-5xl">
      {/* Back */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brown-dark transition mb-6"
      >
        <ArrowLeft size={15} /> Back to Orders
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column — main info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Order Number</p>
                <p className="text-lg font-bold text-brown-dark mt-0.5">{order.orderNumber}</p>
                <p className="text-xs text-gray-400 mt-1">{fmtDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>
                  {badge.label}
                </span>
                {order.invoice && (
                  <a
                    href={`/api/admin/invoice/${order.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-gold hover:text-rose-gold-dark border border-rose-gold/30 hover:border-rose-gold rounded-full px-3 py-1 transition"
                  >
                    <Download size={12} /> Invoice
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Customer</p>
            <p className="font-medium text-brown-dark">{order.customer.name ?? "—"}</p>
            {order.customer.email && (
              <p className="text-sm text-gray-400 mt-0.5">{order.customer.email}</p>
            )}
            {order.customer.phone && (
              <p className="text-sm text-gray-400 mt-0.5">{order.customer.phone}</p>
            )}
          </div>

          {/* Items */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-semibold text-brown-dark mb-4 flex items-center gap-2 text-sm">
              <Package size={15} className="text-rose-gold" /> Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start gap-4 text-sm pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-brown-dark">{item.productName}</p>
                    {item.variantLabel && (
                      <p className="text-xs text-gray-400">{item.variantLabel}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {item.metalName} · {item.purity} · {Number(item.weightGrams)}g
                    </p>
                    {item.metalRate && (
                      <p className="text-xs text-gray-400">
                        Rate: {formatPrice(Number(item.metalRate))}/g
                        {item.makingCharge && (
                          <span>
                            {" · "}Making:{" "}
                            {item.makingChargeType === "PERCENT"
                              ? `${Number(item.makingCharge)}%`
                              : formatPrice(Number(item.makingCharge))}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">×{item.quantity}</p>
                    <p className="font-semibold text-brown-dark">
                      {formatPrice(Number(item.totalPrice))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal (excl. GST)</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>GST</span>
                <span>{formatPrice(Number(order.gstAmount))}</span>
              </div>
              <div className="flex justify-between font-bold text-brown-dark text-base border-t border-gray-100 pt-2 mt-1">
                <span>Total</span>
                <span className="text-rose-gold">{formatPrice(Number(order.totalAmount))}</span>
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              {isPickup ? (
                <Store size={14} className="text-rose-gold" />
              ) : (
                <MapPin size={14} className="text-rose-gold" />
              )}
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {isPickup ? "Store Pickup" : "Delivery Address"}
              </p>
            </div>
            {isPickup ? (
              <p className="text-sm text-brown-dark">Jamuna Gali, Malviya Rd, Deoria, UP 274806</p>
            ) : order.address ? (
              <div className="text-sm text-brown-dark space-y-0.5">
                <p className="font-medium">{order.address.name}</p>
                <p className="text-gray-400 text-xs">{order.address.phone}</p>
                <p className="text-gray-400 text-xs">{order.address.line1}</p>
                {order.address.line2 && <p className="text-gray-400 text-xs">{order.address.line2}</p>}
                <p className="text-gray-400 text-xs">
                  {order.address.city}, {order.address.state} – {order.address.pincode}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Payment</p>
            <p className="text-sm font-medium text-brown-dark">
              {order.paymentMethod === "COD"
                ? "Cash on Delivery"
                : order.paymentMethod === "RAZORPAY"
                ? "Paid Online (Razorpay)"
                : order.paymentMethod ?? "—"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Status:{" "}
              <span
                className={
                  order.paymentStatus === "PAID"
                    ? "text-green-600 font-semibold"
                    : order.paymentStatus === "FAILED"
                    ? "text-red-600 font-semibold"
                    : "text-yellow-600 font-semibold"
                }
              >
                {order.paymentStatus}
              </span>
            </p>
            {order.razorpayOrderId && (
              <p className="text-[10px] text-gray-400 mt-1 break-all">
                Razorpay Order: {order.razorpayOrderId}
              </p>
            )}
            {order.paymentId && (
              <p className="text-[10px] text-gray-400 mt-0.5 break-all">
                Payment ID: {order.paymentId}
              </p>
            )}
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Notes</p>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Right column — status management + timeline */}
        <div className="space-y-5">
          {/* Status updater */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Update Status</p>
            <StatusUpdater orderId={order.id} currentStatus={order.status} />
          </div>

          {/* Timeline */}
          {order.statusHistory.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Timeline</p>
              <div className="space-y-4">
                {[...order.statusHistory].reverse().map((h) => {
                  const hBadge = STATUS_MAP[h.status];
                  const Icon = hBadge?.Icon ?? Clock;
                  return (
                    <div key={h.id} className="flex gap-3 items-start">
                      <div className="mt-0.5 shrink-0">
                        <Icon size={14} className="text-rose-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brown-dark">
                          {hBadge?.label ?? h.status}
                        </p>
                        {h.note && <p className="text-xs text-gray-400">{h.note}</p>}
                        <p className="text-xs text-gray-300 mt-0.5">{fmtDateTime(h.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
