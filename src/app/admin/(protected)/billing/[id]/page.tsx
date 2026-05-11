import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/price";
import {
  ArrowLeft,
  Download,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { BillStatus } from "@prisma/client";
import RecordPayment from "./RecordPayment";

export const metadata = { title: "Bill Details" };

const STATUS_STYLE: Record<BillStatus, { cls: string; label: string }> = {
  PAID: { cls: "bg-green-100 text-green-700", label: "Paid" },
  PARTIAL: { cls: "bg-yellow-100 text-yellow-700", label: "Partial" },
  UNPAID: { cls: "bg-red-100 text-red-700", label: "Unpaid" },
};

const METHOD_LABEL: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CARD: "Card",
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

export default async function BillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const bill = await db.bill.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { orderBy: { createdAt: "asc" } },
      payments: { orderBy: { paidAt: "asc" } },
    },
  });

  if (!bill) notFound();

  const badge = STATUS_STYLE[bill.status];
  const customerName = bill.customer?.name ?? bill.customerName ?? "Walk-in Customer";
  const customerPhone = bill.customer?.phone ?? bill.customerPhone;
  const customerEmail = bill.customer?.email ?? bill.customerEmail;
  const balanceDue = Number(bill.balanceDue);

  return (
    <div className="p-8 max-w-5xl">
      <Link
        href="/admin/billing"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brown-dark transition mb-6"
      >
        <ArrowLeft size={15} /> Back to Billing
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — main info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Bill Number</p>
                <p className="text-lg font-bold text-brown-dark mt-0.5">{bill.billNumber}</p>
                <p className="text-xs text-gray-400 mt-1">{fmtDate(bill.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>
                  {badge.label}
                </span>
                <a
                  href={`/api/admin/bill-invoice/${bill.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-gold hover:text-rose-gold-dark border border-rose-gold/30 hover:border-rose-gold rounded-full px-3 py-1 transition"
                >
                  <Download size={12} /> Invoice PDF
                </a>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Customer</p>
            <p className="font-medium text-brown-dark">{customerName}</p>
            {customerPhone && <p className="text-sm text-gray-400 mt-0.5">{customerPhone}</p>}
            {customerEmail && <p className="text-sm text-gray-400 mt-0.5">{customerEmail}</p>}
            {bill.customer && (
              <p className="text-xs text-rose-gold mt-1.5">Linked to customer account</p>
            )}
          </div>

          {/* Items */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-semibold text-brown-dark mb-4 flex items-center gap-2 text-sm">
              <Package size={15} className="text-rose-gold" /> Items
            </h2>
            <div className="space-y-4">
              {bill.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start gap-4 text-sm pb-4 border-b border-gray-50 last:border-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-brown-dark">{item.productName}</p>
                    {item.variantLabel && <p className="text-xs text-gray-400">{item.variantLabel}</p>}
                    {item.metalName && (
                      <p className="text-xs text-gray-400">
                        {item.metalName}
                        {item.purity && ` · ${item.purity}`}
                        {item.weightGrams && ` · ${Number(item.weightGrams)}g`}
                        {item.metalRate && ` @ ${formatPrice(Number(item.metalRate))}/g`}
                      </p>
                    )}
                    {item.hsnCode && (
                      <p className="text-xs text-gray-300">HSN: {item.hsnCode}{item.gstPercent ? ` · GST ${Number(item.gstPercent)}%` : ""}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.type === "CUSTOM" ? "Custom item" : "Catalog product"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">×{item.quantity}</p>
                    <p className="font-semibold text-brown-dark">
                      {formatPrice(Number(item.totalPrice) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal (excl. GST)</span>
                <span>{formatPrice(Number(bill.subtotal))}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>GST</span>
                <span>{formatPrice(Number(bill.gstAmount))}</span>
              </div>
              <div className="flex justify-between font-bold text-brown-dark text-base border-t border-gray-100 pt-2 mt-1">
                <span>Total</span>
                <span className="text-rose-gold">{formatPrice(Number(bill.totalAmount))}</span>
              </div>
              {Number(bill.amountPaid) > 0 && (
                <>
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Amount Paid</span>
                    <span>{formatPrice(Number(bill.amountPaid))}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-red-600">
                    <span>Balance Due</span>
                    <span>{balanceDue > 0 ? formatPrice(balanceDue) : "—"}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          {bill.notes && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Notes</p>
              <p className="text-sm text-gray-600">{bill.notes}</p>
            </div>
          )}
        </div>

        {/* Right — payment panel + history */}
        <div className="space-y-5">
          {/* Record payment (only if not fully paid) */}
          {bill.status !== "PAID" && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Record Payment</p>
              <RecordPayment billId={bill.id} balanceDue={balanceDue} />
            </div>
          )}

          {bill.status === "PAID" && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-3">
              <CheckCircle size={18} className="text-green-600 shrink-0" />
              <p className="text-sm font-semibold text-green-700">Fully Paid</p>
            </div>
          )}

          {/* Payment history */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Payment History</p>
            {bill.payments.length === 0 ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <AlertCircle size={14} />
                <span>No payments recorded yet.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {bill.payments.map((p) => (
                  <div key={p.id} className="flex gap-3 items-start">
                    <div className="mt-0.5 shrink-0">
                      <Clock size={13} className="text-rose-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-brown-dark">
                          {formatPrice(Number(p.amount))}
                        </p>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {METHOD_LABEL[p.method]}
                        </span>
                      </div>
                      {p.note && <p className="text-xs text-gray-400 mt-0.5">{p.note}</p>}
                      <p className="text-xs text-gray-300 mt-0.5">{fmtDateTime(p.paidAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
