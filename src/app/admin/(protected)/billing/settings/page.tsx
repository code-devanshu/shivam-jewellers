import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getStoreSettings } from "../actions";
import GstSettingsForm from "./GstSettingsForm";

export const metadata = { title: "GST & Store Settings" };

export default async function GstSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="p-8 max-w-lg">
      <Link
        href="/admin/billing"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brown-dark transition mb-6"
      >
        <ArrowLeft size={15} /> Back to Billing
      </Link>

      <h1 className="text-xl font-bold text-brown-dark mb-1">GST &amp; Store Details</h1>
      <p className="text-sm text-gray-400 mb-6">
        These details appear on every bill invoice. GSTIN is required before you can create a bill.
      </p>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <GstSettingsForm initialData={settings} />
      </div>
    </div>
  );
}
