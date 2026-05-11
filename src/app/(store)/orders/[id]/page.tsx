import { notFound } from "next/navigation";
import Link from "next/link";
import { getCustomerSession } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/price";
import {
  ArrowLeft,
  Package,
  MapPin,
  Store,
  Download,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
} from "lucide-react";

export const metadata = { title: "Order Details", robots: { index: false, follow: false } };

const STATUS_MAP: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customerId = await getCustomerSession();

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: { orderBy: { createdAt: "asc" } },
      address: true,
      invoice: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order || order.customerId !== customerId) notFound();

  const isPickup = order.deliveryType === "STORE_PICKUP";
  const badge = STATUS_MAP[order.status] ?? { label: order.status, cls: "bg-gray-100 text-gray-600", Icon: Clock };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-brown/50 hover:text-brown-dark transition mb-6"
      >
        <ArrowLeft size={15} /> Back to Orders
      </Link>

      {/* Header */}
      <div className="bg-cream border border-blush rounded-2xl px-6 py-5 mb-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-brown/50 uppercase tracking-wider font-medium">Order Number</p>
            <p className="text-lg font-bold text-brown-dark mt-0.5">{order.orderNumber}</p>
            <p className="text-xs text-brown/50 mt-1">{fmtDate(order.createdAt)}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>
              {badge.label}
            </span>
            {order.invoice && (
              <a
                href={`/api/invoice/${order.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-gold hover:text-rose-gold-dark transition border border-rose-gold/30 hover:border-rose-gold rounded-full px-3 py-1"
              >
                <Download size={12} /> Download Invoice
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white border border-blush rounded-2xl p-6 mb-5">
        <h2 className="font-semibold text-brown-dark mb-4 flex items-center gap-2">
          <Package size={16} className="text-rose-gold" />
          Items
        </h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-start gap-4 text-sm">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-brown-dark">{item.productName}</p>
                {item.variantLabel && (
                  <p className="text-xs text-brown/50">{item.variantLabel}</p>
                )}
                <p className="text-xs text-brown/50">
                  {item.metalName} · {item.purity} · {Number(item.weightGrams)}g
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-brown/50">×{item.quantity}</p>
                <p className="font-semibold text-brown-dark">
                  {formatPrice(Number(item.totalPrice))}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-blush mt-5 pt-4 space-y-1.5">
          <div className="flex justify-between text-sm text-brown/60">
            <span>Subtotal (excl. GST)</span>
            <span>{formatPrice(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between text-sm text-brown/60">
            <span>GST</span>
            <span>{formatPrice(Number(order.gstAmount))}</span>
          </div>
          <div className="flex justify-between font-bold text-brown-dark text-base border-t border-blush pt-2 mt-1">
            <span>Total</span>
            <span className="text-rose-gold">{formatPrice(Number(order.totalAmount))}</span>
          </div>
        </div>
      </div>

      {/* Delivery + Payment */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white border border-blush rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            {isPickup ? (
              <Store size={15} className="text-rose-gold" />
            ) : (
              <MapPin size={15} className="text-rose-gold" />
            )}
            <p className="text-xs font-semibold text-brown/60 uppercase tracking-wide">
              {isPickup ? "Store Pickup" : "Delivery Address"}
            </p>
          </div>
          {isPickup ? (
            <p className="text-sm text-brown-dark">
              Jamuna Gali, Malviya Rd,
              <br />
              Deoria, UP 274806
            </p>
          ) : order.address ? (
            <div className="text-sm text-brown-dark space-y-0.5">
              <p className="font-medium">{order.address.name}</p>
              <p className="text-brown/60 text-xs">{order.address.phone}</p>
              <p className="text-brown/60 text-xs">{order.address.line1}</p>
              {order.address.line2 && (
                <p className="text-brown/60 text-xs">{order.address.line2}</p>
              )}
              <p className="text-brown/60 text-xs">
                {order.address.city}, {order.address.state} – {order.address.pincode}
              </p>
            </div>
          ) : (
            <p className="text-sm text-brown/50">—</p>
          )}
        </div>

        <div className="bg-white border border-blush rounded-2xl p-5">
          <p className="text-xs font-semibold text-brown/60 uppercase tracking-wide mb-3">Payment</p>
          <p className="text-sm font-medium text-brown-dark">
            {order.paymentMethod === "COD"
              ? "Cash on Delivery"
              : order.paymentMethod === "RAZORPAY"
              ? "Paid Online"
              : order.paymentMethod ?? "—"}
          </p>
          <p className="text-xs text-brown/50 mt-1">
            Status:{" "}
            <span
              className={
                order.paymentStatus === "PAID"
                  ? "text-green-600 font-semibold"
                  : "text-yellow-600 font-semibold"
              }
            >
              {order.paymentStatus}
            </span>
          </p>
          {order.paymentId && (
            <p className="text-[10px] text-brown/40 mt-1 break-all">{order.paymentId}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-white border border-blush rounded-2xl p-5 mb-5">
          <p className="text-xs font-semibold text-brown/60 uppercase tracking-wide mb-1.5">Notes</p>
          <p className="text-sm text-brown/70">{order.notes}</p>
        </div>
      )}

      {/* Status History */}
      {order.statusHistory.length > 0 && (
        <div className="bg-white border border-blush rounded-2xl p-6 mb-8">
          <h2 className="font-semibold text-brown-dark mb-4 text-sm">Order Timeline</h2>
          <div className="space-y-3">
            {order.statusHistory.map((h, i) => {
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
                    {h.note && <p className="text-xs text-brown/50">{h.note}</p>}
                    <p className="text-xs text-brown/40 mt-0.5">
                      {h.createdAt.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {i < order.statusHistory.length - 1 && (
                    <div className="absolute left-[27px] mt-5 h-full w-px bg-blush" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-brown/50 hover:text-brown-dark transition"
      >
        <ArrowLeft size={15} /> Back to Orders
      </Link>
    </div>
  );
}
