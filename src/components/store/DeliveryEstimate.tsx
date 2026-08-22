"use client";

import { useEffect, useState, useSyncExternalStore, useTransition } from "react";
import { MapPin } from "lucide-react";
import { subscribe, getSnapshot, getServerSnapshot, setDeliveryPincode } from "@/lib/deliveryLocation";
import { getPdpDeliveryEstimateAction, type PdpDeliveryEstimate } from "@/app/(store)/checkout/actions";

// Session-lived cache so navigating between products with the same pincode
// doesn't re-hit the live Delhivery TAT API on every page load.
const cache = new Map<string, PdpDeliveryEstimate>();

function ordinal(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0]}`;
}

function formatEtaFull(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const weekday = d.toLocaleDateString("en-IN", { weekday: "long" });
  const month = d.toLocaleDateString("en-IN", { month: "long" });
  return `${weekday}, ${ordinal(d.getDate())} ${month}`;
}

// Mirrors the server's nextPickupDate() — always "tomorrow 10am" — so the
// countdown shown here matches the cutoff actually used for the TAT lookup.
function msUntilPickupCutoff(now: number): number {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() + 1);
  cutoff.setHours(10, 0, 0, 0);
  return cutoff.getTime() - now;
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "soon";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad2(hours)} hours ${pad2(minutes)} minutes ${pad2(seconds)} seconds`;
}

export default function DeliveryEstimate() {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const pincode = stored?.pincode;
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(pincode ?? "");
  const [inputError, setInputError] = useState<string | null>(null);
  const [errorPincode, setErrorPincode] = useState<string | null>(null);
  const [, setFetchedTick] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [now, setNow] = useState(() => Date.now());

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

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  function submitPincode() {
    if (!/^\d{6}$/.test(inputValue)) {
      setInputError("Enter a valid 6-digit pincode");
      return;
    }
    setInputError(null);
    setDeliveryPincode(inputValue, "manual");
    setEditing(false);
  }

  const isLoading = Boolean(pincode) && !cachedResult && (isPending || errorPincode !== pincode);
  const isError = errorPincode === pincode && !cachedResult;
  const showInput = !pincode || editing;

  return (
    <div>
      {showInput ? (
        <>
          <p className="text-sm font-semibold text-brown-dark mb-2">Estimated Delivery Time</p>
          <div className="flex items-stretch rounded-lg border border-gray-200 overflow-hidden focus-within:border-rose-gold/40 transition-colors">
            <input
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value.replace(/\D/g, "").slice(0, 6));
                setInputError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && submitPincode()}
              placeholder="Enter 6 digit pincode"
              inputMode="numeric"
              className="flex-1 min-w-0 px-3.5 py-2.5 text-sm text-brown-dark placeholder:text-brown/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={submitPincode}
              className="shrink-0 px-5 text-sm font-semibold bg-blush text-rose-gold-dark hover:bg-rose-gold hover:text-white transition-colors"
            >
              Check
            </button>
          </div>
          {inputError && <p className="text-xs text-red-600 mt-1.5">{inputError}</p>}
        </>
      ) : (
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-brown-dark">
            <MapPin size={16} className="text-rose-gold shrink-0" />
            Deliver to {pincode}
          </span>
          <button
            type="button"
            onClick={() => {
              setInputValue(pincode ?? "");
              setInputError(null);
              setEditing(true);
            }}
            className="text-sm font-semibold text-rose-gold-dark hover:underline"
          >
            Change
          </button>
        </div>
      )}

      {pincode && !editing && (
        <div className="mt-2">
          {isLoading && <p className="text-sm text-brown/60">Checking delivery to {pincode}…</p>}
          {cachedResult && (
            <p className="text-sm text-brown/70">
              {cachedResult.serviceable ? (
                cachedResult.expectedDeliveryDate ? (
                  <>
                    Order within{" "}
                    <span className="font-semibold text-brown-dark tabular-nums">
                      {formatCountdown(msUntilPickupCutoff(now))}
                    </span>{" "}
                    to get it delivered by{" "}
                    <span className="font-semibold text-green-700">
                      {formatEtaFull(cachedResult.expectedDeliveryDate)}
                    </span>
                    .
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
          {isError && <p className="text-sm text-brown/60">Couldn&apos;t check delivery right now.</p>}
        </div>
      )}
    </div>
  );
}
