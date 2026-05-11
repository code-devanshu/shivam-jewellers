import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, MapPin, Store, Package, ArrowRight } from "lucide-react";
import { getCustomerSession } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/price";

export const metadata = { title: "Order Confirmed", robots: { index: false, follow: false } };

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    CONFIRMED: { label: "Confirmed", cls: "bg-green-100 text-green-700" },
    PENDING_PAYMENT: { label: "Payment Pending", cls: "bg-yellow-100 text-yellow-700" },
    PROCESSING: { label: "Processing", cls: "bg-blue-100 text-blue-700" },
    SHIPPED: { label: "Shipped", cls: "bg-purple-100 text-purple-700" },
    DELIVERED: { label: "Delivered", cls: "bg-green-100 text-green-700" },
    CANCELLED: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
    PENDING: { label: "Pending", cls: "bg-gray-100 text-gray-600" },
    READY_FOR_PICKUP: { label: "Ready for Pickup", cls: "bg-teal-100 text-teal-700" },
  };
  const badge = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>
      {badge.label}
    </span>
  );
}

export default async function OrderSuccessPage({
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
    },
  });

  if (!order || order.customerId !== customerId) notFound();

  const isPickup = order.deliveryType === "STORE_PICKUP";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* ── Hero ── */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-brown-dark mb-2">Order Confirmed!</h1>
        <p className="text-brown/60 text-sm">
          Thank you for your purchase. We&apos;ll keep you updated on your order status.
        </p>
      </div>

      {/* ── Order meta ── */}
      <div className="bg-cream border border-blush rounded-2xl px-6 py-5 mb-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-brown/50 uppercase tracking-wider font-medium">Order Number</p>
            <p className="text-lg font-bold text-brown-dark mt-0.5">{order.orderNumber}</p>
            <p className="text-xs text-brown/50 mt-1">{fmtDate(order.createdAt)}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* ── Items ── */}
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
                  {item.metalName} · {item.purity}
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
            <span>Total Paid</span>
            <span className="text-rose-gold">{formatPrice(Number(order.totalAmount))}</span>
          </div>
        </div>
      </div>

      {/* ── Delivery + Payment ── */}
      <div className="grid grid-cols-2 gap-4 mb-8">
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
                order.paymentStatus === "PAID" ? "text-green-600 font-semibold" : "text-yellow-600 font-semibold"
              }
            >
              {order.paymentStatus}
            </span>
          </p>
          {order.paymentId && (
            <p className="text-[10px] text-brown/40 mt-1 break-all">{order.paymentId}</p>
          )}
          {order.notes && (
            <div className="mt-3 pt-3 border-t border-blush">
              <p className="text-xs font-semibold text-brown/60 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-xs text-brown/60">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/orders"
          className="flex-1 flex items-center justify-center gap-2 border-2 border-rose-gold text-rose-gold hover:bg-blush py-3 rounded-full text-sm font-semibold transition"
        >
          View My Orders <ArrowRight size={15} />
        </Link>
        <Link
          href="/products"
          className="flex-1 flex items-center justify-center gap-2 bg-rose-gold hover:bg-rose-gold-dark text-white py-3 rounded-full text-sm font-semibold transition"
        >
          Continue Shopping <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
