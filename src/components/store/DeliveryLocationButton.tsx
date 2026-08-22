"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronDown, MapPin, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  setDeliveryPincode,
} from "@/lib/deliveryLocation";
import { useIsClient } from "@/lib/useIsClient";

const TOAST_STYLE = {
  background: "#fff",
  border: "1px solid #ffe4e4",
  color: "#2c1810",
};

export default function DeliveryLocationButton({
  className = "",
}: {
  className?: string;
}) {
  const stored = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [open, setOpen] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Defer swapping between "unset" and "Fast Delivery to X" until after
  // hydration settles on the real localStorage value, so a returning visitor
  // never sees the pincode flash to "unset" and back on reload.
  const mounted = useIsClient();

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function locateFailed(message: string) {
    toast.error(message, { style: TOAST_STYLE });
    inputRef.current?.focus();
  }

  function handleUseLocation() {
    if (!("geolocation" in navigator)) {
      locateFailed(
        "Location isn't available on this browser — enter your pincode instead.",
      );
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
          toast.success(`Showing delivery dates for ${data.pincode}`, {
            style: TOAST_STYLE,
          });
          setOpen(false);
        } catch {
          locateFailed(
            "Couldn't detect your pincode automatically — enter it here instead.",
          );
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        locateFailed(
          "Couldn't access your location — enter your pincode instead.",
        );
      },
      { timeout: 8000 },
    );
  }

  function submitManual() {
    if (!/^\d{6}$/.test(manualValue)) {
      setManualError("Enter a valid 6-digit pincode");
      return;
    }
    setManualError(null);
    setDeliveryPincode(manualValue, "manual");
    toast.success(`Showing delivery dates for ${manualValue}`, {
      style: TOAST_STYLE,
    });
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className={`relative shrink-0 ${className}`}>
      {!mounted ? (
        // Real value isn't known until localStorage is read on the client —
        // render a neutral skeleton instead of asserting "unset", so a
        // returning visitor never sees the pincode flash to unset and back.
        <div className="flex items-center gap-2 py-1 sm:py-2 sm:px-3 h-[42px] sm:h-[46px]">
          <div className="size-4 rounded-full bg-blush/60 shrink-0 animate-pulse" />
          <span className="hidden sm:flex flex-col gap-1">
            <span className="h-2 w-20 rounded-full bg-blush/60 animate-pulse" />
            <span className="h-2.5 w-28 rounded-full bg-blush/60 animate-pulse" />
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setOpen((v) => {
              const next = !v;
              if (next) {
                setManualValue(stored?.pincode ?? "");
                setManualError(null);
              }
              return next;
            });
          }}
          className={
            stored?.pincode
              ? "flex items-center gap-1.5 pl-0 sm:pl-2.5 pr-2 py-1.5 rounded-none sm:rounded-lg sm:border border-rose-gold/30 hover:border-rose-gold/60 transition-colors"
              : "flex items-center gap-2 py-1 sm:py-2 sm:px-3 rounded-none sm:rounded-lg sm:border sm:border-gray-200  sm:hover:border-rose-gold/40 transition-colors"
          }
        >
          {stored?.pincode ? (
            <>
              <Zap
                size={16}
                className="text-rose-gold-dark fill-rose-gold-dark shrink-0"
              />
              <span className="leading-tight text-left">
                <span className="hidden sm:block text-[10px] text-brown/50 whitespace-nowrap">
                  Where to Deliver?
                </span>
                <span className="block text-xs font-semibold text-brown-dark whitespace-nowrap">
                  Fast Delivery to {stored.pincode}
                </span>
              </span>
            </>
          ) : (
            <>
              <MapPin size={16} className="text-rose-gold shrink-0" />
              <span className="leading-tight text-left">
                <span className="hidden sm:block text-[10px] text-brown/50 whitespace-nowrap">
                  Where to Deliver?
                </span>
                <span className="block text-xs font-semibold text-brown-dark whitespace-nowrap">
                  Update Delivery Pincode
                </span>
              </span>
            </>
          )}
          <ChevronDown
            size={14}
            className={`shrink-0 transition-transform ${open ? "rotate-180" : ""} ${
              stored?.pincode ? "text-rose-gold-dark" : "text-gray-400"
            }`}
          />
        </button>
      )}

      {open && (
        <div className="absolute left-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-72 bg-white border border-blush rounded-xl shadow-lg p-4 z-50">
          <p className="text-xs text-brown/60 mb-2">
            Enter pincode to check delivery date
          </p>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={manualValue}
              onChange={(e) => {
                setManualValue(e.target.value.replace(/\D/g, "").slice(0, 6));
                setManualError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && submitManual()}
              placeholder="6-digit pincode"
              inputMode="numeric"
              className="flex-1 w-0 px-3 py-1.5 rounded-lg border border-blush bg-white text-sm focus:outline-none focus:border-rose-gold"
            />
            <button
              type="button"
              onClick={submitManual}
              className="shrink-0 px-3 py-1.5 rounded-full bg-rose-gold hover:bg-rose-gold-dark text-white text-xs font-semibold transition-colors"
            >
              Update
            </button>
          </div>
          {manualError && (
            <p className="text-xs text-red-600 mt-1.5">{manualError}</p>
          )}
          <button
            type="button"
            onClick={handleUseLocation}
            disabled={locating}
            className="mt-3 text-xs text-rose-gold-dark hover:underline disabled:opacity-60"
          >
            {locating ? "Detecting…" : "Use my current location"}
          </button>
        </div>
      )}
    </div>
  );
}
