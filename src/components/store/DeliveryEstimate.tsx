"use client";

import { useEffect, useState, useSyncExternalStore, useTransition } from "react";
import { Truck } from "lucide-react";
import { subscribe, getSnapshot, getServerSnapshot, setDeliveryPincode } from "@/lib/deliveryLocation";
import { getPdpDeliveryEstimateAction, type PdpDeliveryEstimate } from "@/app/(store)/checkout/actions";

// Session-lived cache so navigating between products with the same pincode
// doesn't re-hit the live Delhivery TAT API on every page load.
const cache = new Map<string, PdpDeliveryEstimate>();

function formatEta(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" });
}

export default function DeliveryEstimate() {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const pincode = stored?.pincode;
  const [manualOpen, setManualOpen] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const [errorPincode, setErrorPincode] = useState<string | null>(null);
  const [, setFetchedTick] = useState(0);
  const [isPending, startTransition] = useTransition();

  const cachedResult = pincode ? cache.get(pincode) : undefined;

  useEffect(() => {
    if (!pincode || cache.has(pincode)) return;
    let cancelled = false;
    startTransition(async () => {
      try {
        const result = await getPdpDeliveryEstimateAction(pincode);
        if (cancelled) return;
        cache.set(pincode, result);
        setFetchedTick((t) => t + 1);
      } catch {
        if (!cancelled) setErrorPincode(pincode);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pincode]);

  function submitManual() {
    if (!/^\d{6}$/.test(manualValue)) {
      setManualError("Enter a valid 6-digit pincode");
      return;
    }
    setManualError(null);
    setDeliveryPincode(manualValue, "manual");
    setManualOpen(false);
    setManualValue("");
  }

  const isLoading = Boolean(pincode) && !cachedResult && (isPending || errorPincode !== pincode);
  const isError = errorPincode === pincode && !cachedResult;

  return (
    <div className="flex items-start gap-3 bg-blush/30 border border-blush rounded-xl p-4">
      <Truck size={18} className="text-rose-gold mt-0.5 shrink-0" />
      <div className="flex-1">
        {!manualOpen && (
          <>
            {!pincode && (
              <button
                type="button"
                onClick={() => setManualOpen(true)}
                className="text-sm font-semibold text-rose-gold-dark hover:underline"
              >
                Check delivery date
              </button>
            )}
            {pincode && isLoading && (
              <p className="text-sm text-brown/60">Checking delivery to {pincode}…</p>
            )}
            {pincode && cachedResult && (
              <p className="text-sm text-brown-dark">
                {cachedResult.serviceable ? (
                  cachedResult.expectedDeliveryDate ? (
                    <>
                      Get it by{" "}
                      <span className="font-semibold">{formatEta(cachedResult.expectedDeliveryDate)}</span>
                      {cachedResult.tatDays !== undefined && ` (${cachedResult.tatDays} days)`} to {pincode}
                    </>
                  ) : (
                    `Delivers to ${pincode}`
                  )
                ) : (
                  <span className="text-red-600">
                    {cachedResult.message ?? `Currently not deliverable to ${pincode}`}
                  </span>
                )}
              </p>
            )}
            {pincode && isError && (
              <p className="text-sm text-brown/60">Couldn&apos;t check delivery right now.</p>
            )}
            {pincode && (
              <button
                type="button"
                onClick={() => setManualOpen(true)}
                className="text-xs text-rose-gold hover:underline mt-1"
              >
                Change pincode
              </button>
            )}
          </>
        )}

        {manualOpen && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-brown-dark">
              {pincode ? "Update delivery pincode" : "Enter your pincode"}
            </p>
            <div className="flex gap-2">
              <input
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder={pincode ?? "e.g. 110001"}
                autoFocus
                className="w-32 px-3 py-1.5 rounded-lg border border-blush text-sm focus:outline-none focus:border-rose-gold"
              />
              <button
                type="button"
                onClick={submitManual}
                className="px-3 py-1.5 rounded-lg bg-rose-gold text-white text-sm font-medium hover:bg-rose-gold-dark"
              >
                Check
              </button>
              <button
                type="button"
                onClick={() => {
                  setManualOpen(false);
                  setManualError(null);
                }}
                className="px-3 py-1.5 rounded-lg border border-blush text-sm text-brown/60"
              >
                Cancel
              </button>
            </div>
            {manualError && <p className="text-xs text-red-600">{manualError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
