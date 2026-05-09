"use client";

import { useActionState, useTransition, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw, X } from "lucide-react";
import { overrideRates, clearRateOverrides, type RateFormState } from "./actions";

type Props = { currentGold: number | null; currentSilver: number | null };

const inputCls =
  "w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-brown-dark text-sm focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors";

const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

export default function RatesClient({ currentGold, currentSilver }: Props) {
  const [state, formAction, isPending] = useActionState(overrideRates, { status: "idle" } as RateFormState);
  const [isClearing, startClear] = useTransition();
  const [gold, setGold] = useState(currentGold !== null ? String(currentGold * 10) : "");
  const [silver, setSilver] = useState(currentSilver !== null ? String(currentSilver * 10) : "");

  // Sync inputs when server re-renders with fresh props (e.g. after clear)
  useEffect(() => { setGold(currentGold !== null ? String(currentGold * 10) : ""); }, [currentGold]);
  useEffect(() => { setSilver(currentSilver !== null ? String(currentSilver * 10) : ""); }, [currentSilver]);

  useEffect(() => {
    if (state.status === "idle") return;
    if (state.status === "success") toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  function handleClear() {
    startClear(async () => {
      await clearRateOverrides();
      toast.success("Rate overrides cleared. Using live API rates.");
    });
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-brown-dark">Metal Rates</h1>
        <p className="text-sm text-gray-400 mt-1">
          Override today&apos;s live spot rate with the IBJA or your preferred rate.
          Overrides reset when the server restarts (persist to DB once Supabase is connected).
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 text-sm text-amber-800">
        <p className="font-semibold mb-1">Why override?</p>
        <p>
          goldapi.io shows the international spot price. Indian jewellers use the{" "}
          <strong>IBJA rate</strong> (India Bullion and Jewellers Association) which includes
          import duty. Enter the IBJA rate here to keep prices accurate.
        </p>
      </div>

      <form action={formAction} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <div>
          <label className={labelCls}>Gold Rate (₹ per 10g)</label>
          <input
            name="gold"
            type="number"
            step="1"
            min="0"
            value={gold}
            onChange={(e) => setGold(e.target.value)}
            className={inputCls}
            placeholder="e.g. 75000"
          />
          <p className="text-xs text-gray-400 mt-1">
            For 24K gold. The system uses purity % to compute value for lower karats.
          </p>
        </div>

        <div>
          <label className={labelCls}>Silver Rate (₹ per 10g)</label>
          <input
            name="silver"
            type="number"
            step="0.1"
            min="0"
            value={silver}
            onChange={(e) => setSilver(e.target.value)}
            className={inputCls}
            placeholder="e.g. 950"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending || isClearing}
            className="flex items-center gap-2 bg-rose-gold hover:bg-rose-gold-dark disabled:opacity-60 text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-colors"
          >
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            Apply Override
          </button>
          <button
            type="button"
            disabled={isPending || isClearing}
            onClick={handleClear}
            className="flex items-center gap-2 border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 disabled:opacity-60 px-6 py-2.5 rounded-full font-semibold text-sm transition-colors"
          >
            {isClearing ? <Loader2 size={15} className="animate-spin" /> : <X size={15} />}
            Clear Overrides
          </button>
        </div>
      </form>
    </div>
  );
}
