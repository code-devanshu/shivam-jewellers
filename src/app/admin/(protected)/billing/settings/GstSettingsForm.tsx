"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { saveStoreSettings, type StoreSettingsData } from "../actions";

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-brown-dark focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors placeholder-gray-300";

export default function GstSettingsForm({
  initialData,
}: {
  initialData: StoreSettingsData | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [storeName, setStoreName] = useState(initialData?.storeName ?? "");
  const [storeAddress, setStoreAddress] = useState(initialData?.storeAddress ?? "");
  const [gstin, setGstin] = useState(initialData?.gstin ?? "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setError("");
    setSaved(false);
    if (!gstin.trim()) {
      setError("GSTIN is required.");
      return;
    }
    startTransition(async () => {
      const res = await saveStoreSettings({ storeName, storeAddress, gstin });
      if (res.error) {
        setError(res.error);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          GSTIN <span className="text-red-500">*</span>
        </label>
        <input
          value={gstin}
          onChange={(e) => { setGstin(e.target.value.toUpperCase()); setSaved(false); }}
          placeholder="22AAAAA0000A1Z5"
          maxLength={15}
          className={inputCls}
        />
        <p className="text-xs text-gray-400 mt-1">15-character GST Identification Number</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Store Name</label>
        <input
          value={storeName}
          onChange={(e) => { setStoreName(e.target.value); setSaved(false); }}
          placeholder="Shivam Jewellers"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Store Address</label>
        <textarea
          value={storeAddress}
          onChange={(e) => { setStoreAddress(e.target.value); setSaved(false); }}
          rows={3}
          placeholder="Shop No. 1, Main Market, City – 000000"
          className={`${inputCls} resize-none`}
        />
        <p className="text-xs text-gray-400 mt-1">Appears on bill invoices</p>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {saved && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
          <CheckCircle2 size={15} />
          Settings saved successfully.
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="w-full py-2.5 bg-rose-gold hover:bg-rose-gold-dark text-white rounded-full text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : "Save Settings"}
      </button>
    </div>
  );
}
