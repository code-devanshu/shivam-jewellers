"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { deleteBill } from "../actions";

export default function DeleteBillButton({
  billId,
  billNumber,
}: {
  billId: string;
  billNumber: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError("");
    startTransition(async () => {
      const result = await deleteBill(billId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/admin/billing");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-full px-3 py-1 transition"
      >
        <Trash2 size={12} /> Delete
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="shrink-0 w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={16} className="text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-brown-dark">Delete Bill?</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  <span className="font-medium">{billNumber}</span> will be permanently deleted along with all its items and payment records. This cannot be undone.
                </p>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setOpen(false); setError(""); }}
                disabled={isPending}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-full transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {isPending ? (
                  <><Loader2 size={13} className="animate-spin" /> Deleting…</>
                ) : (
                  "Delete Bill"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
