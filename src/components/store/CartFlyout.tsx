"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { formatPrice } from "@/lib/price";

export type FlyoutItem = {
  name: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
};

export default function CartFlyout({
  item,
  onClose,
}: {
  item: FlyoutItem | null;
  onClose: () => void;
}) {
  const [entered, setEntered] = useState(false);
  const [prevItem, setPrevItem] = useState(item);

  // Reset the enter transition whenever a new item opens the flyout (or it closes) —
  // done during render, not in an effect, per React's guidance for resetting state
  // when a prop changes: https://react.dev/learn/you-might-not-need-an-effect
  if (item !== prevItem) {
    setPrevItem(item);
    setEntered(false);
  }

  useEffect(() => {
    if (!item) return;
    const raf = requestAnimationFrame(() => setEntered(true));
    const timer = setTimeout(onClose, 6000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-90 flex justify-end">
      <div
        className={`absolute inset-0 bg-brown-dark/30 transition-opacity duration-300 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-sm h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          entered ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-blush">
          <p className="flex items-center gap-2 text-sm font-semibold text-brown-dark">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white">
              <Check size={12} />
            </span>
            Added to cart
          </p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-brown/40 hover:text-brown-dark transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-3 px-5 py-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-blush/40 border border-blush shrink-0">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-rose-gold-light text-xl">
                ✦
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-brown-dark line-clamp-2">{item.name}</p>
            <p className="text-xs text-brown/50 mt-1">Qty: {item.quantity}</p>
            <p className="text-sm font-bold text-rose-gold-dark mt-1">{formatPrice(item.price)}</p>
          </div>
        </div>

        <div className="mt-auto px-5 py-4 border-t border-blush flex flex-col gap-2.5">
          <Link
            href="/cart"
            onClick={onClose}
            className="w-full py-3 bg-rose-gold hover:bg-rose-gold-dark text-white rounded-full text-sm font-semibold transition text-center"
          >
            View Cart
          </Link>
          <button
            onClick={onClose}
            className="w-full py-3 border border-blush text-brown-dark hover:border-rose-gold hover:text-rose-gold rounded-full text-sm font-semibold transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
