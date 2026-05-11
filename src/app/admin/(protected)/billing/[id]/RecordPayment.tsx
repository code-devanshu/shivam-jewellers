"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { recordBillPayment } from "../actions";

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-brown-dark focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors placeholder-gray-300";

export default function RecordPayment({
  billId,
  balanceDue,
}: {
  billId: string;
  balanceDue: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [method, setMethod] = useState<"CASH" | "UPI" | "CARD">("CASH");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleSubmit() {
    setError("");
    setSuccess("");
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    startTransition(async () => {
      const res = await recordBillPayment(billId, amt, method, note || undefined);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess("Payment recorded.");
        setAmount("");
        setNote("");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1.5">
        {(["CASH", "UPI", "CARD"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMethod(m)}
            className={`py-1.5 rounded-lg text-xs font-semibold transition ${
              method === m
                ? "bg-rose-gold text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Amount (₹)</label>
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Balance: ₹${balanceDue.toLocaleString("en-IN")}`}
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Note (optional)</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="UPI ref, cheque #, etc."
          className={inputCls}
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {success && <p className="text-xs text-green-600">{success}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full py-2 bg-rose-gold hover:bg-rose-gold-dark text-white rounded-full text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? <><Loader2 size={13} className="animate-spin" /> Recording…</> : "Record Payment"}
      </button>
    </div>
  );
}
