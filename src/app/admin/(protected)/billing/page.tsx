import Link from "next/link";
import { db } from "@/lib/db";
import { Plus, Settings, AlertTriangle } from "lucide-react";
import { getStoreSettings } from "./actions";
import BillsTable, { type BillRow } from "./BillsTable";

export const metadata = { title: "Billing" };

export default async function BillingListPage() {
  const [bills, settings] = await Promise.all([
    db.bill.findMany({
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true, phone: true } } },
    }),
    getStoreSettings(),
  ]);

  const hasGstConfig = !!(settings?.gstin?.trim());

  const rows: BillRow[] = bills.map((b) => ({
    id: b.id,
    billNumber: b.billNumber,
    customerName: b.customer?.name ?? b.customerName,
    customerPhone: b.customer?.phone ?? b.customerPhone,
    createdAt: b.createdAt.toISOString(),
    totalAmount: Number(b.totalAmount),
    amountPaid: Number(b.amountPaid),
    balanceDue: Number(b.balanceDue),
    status: b.status,
  }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-brown-dark">Billing</h1>
          <p className="text-sm text-gray-400 mt-0.5">Walk-in counter bills &amp; direct invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/billing/settings"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-brown-dark border border-gray-200 hover:border-gray-300 rounded-full transition-colors"
          >
            <Settings size={13} /> GST Settings
          </Link>
          <Link
            href="/admin/billing/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-gold hover:bg-rose-gold-dark text-white text-sm font-semibold rounded-full transition-colors"
          >
            <Plus size={16} /> New Bill
          </Link>
        </div>
      </div>

      {!hasGstConfig && (
        <div className="mb-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">GST details not configured</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Add your GSTIN and store details before creating bills.{" "}
              <Link href="/admin/billing/settings" className="underline font-semibold">
                Set up now →
              </Link>
            </p>
          </div>
        </div>
      )}

      <BillsTable bills={rows} />
    </div>
  );
}
