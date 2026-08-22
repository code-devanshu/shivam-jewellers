"use client";

import { useState, useSyncExternalStore } from "react";
import { MapPin, X } from "lucide-react";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  getDismissedSnapshot,
  getDismissedServerSnapshot,
  setDeliveryPincode,
  dismissLocationPrompt,
} from "@/lib/deliveryLocation";

export default function DeliveryLocationPrompt() {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dismissed = useSyncExternalStore(subscribe, getDismissedSnapshot, getDismissedServerSnapshot);
  const [mode, setMode] = useState<"prompt" | "manual">("prompt");
  const [manualValue, setManualValue] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  if (stored?.pincode || dismissed) return null;

  function handleAllowLocation() {
    setLocateError(null);
    if (!("geolocation" in navigator)) {
      setLocateError("Location isn't available on this browser.");
      setMode("manual");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch("/api/geocode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }),
          });
          if (!res.ok) throw new Error("geocode failed");
          const data = (await res.json()) as { pincode: string };
          setDeliveryPincode(data.pincode, "geo");
        } catch {
          setLocateError("Couldn't detect your pincode automatically.");
          setMode("manual");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setLocateError("Location access denied.");
        setMode("manual");
      },
      { timeout: 8000 }
    );
  }

  function submitManual() {
    if (!/^\d{6}$/.test(manualValue)) {
      setManualError("Enter a valid 6-digit pincode");
      return;
    }
    setManualError(null);
    setDeliveryPincode(manualValue, "manual");
  }

  return (
    <div className="bg-blush/40 border-b border-blush">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3 flex-wrap">
        <MapPin size={16} className="text-rose-gold shrink-0" />

        {mode === "prompt" && (
          <>
            <p className="text-xs sm:text-sm text-brown-dark flex-1 min-w-0">
              Allow location access to see accurate delivery dates on every product.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleAllowLocation}
                disabled={locating}
                className="px-3 py-1.5 rounded-full bg-rose-gold hover:bg-rose-gold-dark text-white text-xs font-semibold transition-colors disabled:opacity-60"
              >
                {locating ? "Detecting…" : "Allow location"}
              </button>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className="text-xs text-rose-gold-dark hover:underline"
              >
                Enter pincode
              </button>
              <button
                type="button"
                onClick={dismissLocationPrompt}
                aria-label="Dismiss"
                className="text-brown/40 hover:text-brown-dark"
              >
                <X size={16} />
              </button>
            </div>
          </>
        )}

        {mode === "manual" && (
          <>
            {locateError && <p className="text-xs text-red-600 basis-full">{locateError}</p>}
            <input
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit pincode"
              autoFocus
              className="w-32 px-3 py-1.5 rounded-lg border border-blush bg-white text-sm focus:outline-none focus:border-rose-gold"
            />
            <button
              type="button"
              onClick={submitManual}
              className="px-3 py-1.5 rounded-full bg-rose-gold hover:bg-rose-gold-dark text-white text-xs font-semibold transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={dismissLocationPrompt}
              aria-label="Dismiss"
              className="text-brown/40 hover:text-brown-dark ml-auto"
            >
              <X size={16} />
            </button>
            {manualError && <p className="text-xs text-red-600 basis-full">{manualError}</p>}
          </>
        )}
      </div>
    </div>
  );
}
