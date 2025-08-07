"use client";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const STORAGE_KEY = "promoBarClosed_v1";
// ⬇️ Use a FIXED, absolute date here!
const SALE_END = new Date("2025-08-07T23:59:00+05:30"); // set your date

function getTimeLeft(targetDate: Date) {
  const now = new Date();
  let diff = Math.max(0, targetDate.getTime() - now.getTime());
  const h = Math.floor(diff / (1000 * 60 * 60));
  diff -= h * 1000 * 60 * 60;
  const m = Math.floor(diff / (1000 * 60));
  diff -= m * 1000 * 60;
  const s = Math.floor(diff / 1000);
  return { h, m, s };
}

export default function PromoBar() {
  const [closed, setClosed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    setMounted(true);
    setClosed(localStorage.getItem(STORAGE_KEY) === "1");
    setTimeLeft(getTimeLeft(SALE_END));
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setClosed(e.newValue === "1");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(SALE_END));
    }, 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  const handleClose = () => {
    setClosed(true);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  if (
    !mounted ||
    closed ||
    (timeLeft.h === 0 && timeLeft.m === 0 && timeLeft.s === 0)
  )
    return null;

  return (
    <div className="sticky top-0 z-[60] w-full">
      <div className="bg-gradient-to-r from-pink-600 to-yellow-400 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-semibold shadow-sm">
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span>
          Free Shipping on orders over{" "}
          <span className="font-bold">₹10,000</span>!{" "}
          <span className="font-semibold">
            Sale ends in{" "}
            <span className="inline-block min-w-[2ch]">{timeLeft.h}</span>h{" "}
            <span className="inline-block min-w-[2ch]">{timeLeft.m}</span>m{" "}
            <span className="inline-block min-w-[2ch]">{timeLeft.s}</span>s!
          </span>
        </span>
        <button
          onClick={handleClose}
          className="ml-3 px-2 text-xs bg-white/20 rounded-full hover:bg-white/40 transition"
          aria-label="Close promo"
        >
          ×
        </button>
      </div>
    </div>
  );
}
