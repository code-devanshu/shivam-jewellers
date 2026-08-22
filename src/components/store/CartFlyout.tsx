"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { calculatePrice, formatPrice } from "@/lib/price";
import type { Product } from "@/lib/types";
import { addToCart } from "@/app/(store)/cart/actions";
import { getFlyoutAlsoPurchased } from "@/app/(store)/products/actions";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { errorToastStyle } from "@/lib/toast-styles";

export type FlyoutItem = {
  productId: string;
  name: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
};

function AlsoPurchasedCard({
  product,
  rateMap,
  onAdd,
}: {
  product: Product;
  rateMap: Record<string, number>;
  onAdd: () => void;
}) {
  const [added, setAdded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const primary = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const { totalPrice } = calculatePrice(product, rateMap[product.metalId] ?? 0);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isPending || added) return;
    startTransition(async () => {
      try {
        await addToCart(product.id, null);
        setAdded(true);
        onAdd();
        setTimeout(() => setAdded(false), 2000);
      } catch (err) {
        if (isRedirectError(err)) throw err;
        toast.error("Couldn't add to cart", {
          description: "Please try again.",
          style: errorToastStyle,
        });
      }
    });
  }

  return (
    <Link href={`/products/${product.slug}`} className="flex-none w-28 group">
      <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-blush/40 border border-blush">
        {primary ? (
          <Image
            src={primary.url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="112px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-rose-gold-light text-xl">
            ✦
          </div>
        )}
        <button
          onClick={handleAdd}
          disabled={isPending}
          aria-label="Quick add to cart"
          className={`absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-colors ${
            added
              ? "bg-green-500 text-white"
              : "bg-white text-rose-gold hover:bg-rose-gold hover:text-white"
          }`}
        >
          {added ? <Check size={12} /> : <Plus size={12} />}
        </button>
      </div>
      <p className="text-xs font-medium text-brown-dark mt-1.5 line-clamp-1">{product.name}</p>
      <p className="text-xs font-bold text-rose-gold-dark">{formatPrice(totalPrice)}</p>
    </Link>
  );
}

function AlsoPurchasedStrip({ productId, onAdd }: { productId: string; onAdd: () => void }) {
  const [state, setState] = useState<{
    productId: string;
    products: Product[];
    rateMap: Record<string, number>;
  } | null>(null);

  // Reset during render (not in the effect) when the flyout switches to a new
  // item, so the effect body never calls setState synchronously on mount.
  if (state !== null && state.productId !== productId) {
    setState(null);
  }

  useEffect(() => {
    let cancelled = false;
    getFlyoutAlsoPurchased(productId).then((result) => {
      if (!cancelled) setState({ productId, ...result });
    });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (state === null) {
    return (
      <div className="px-5 pb-4 flex gap-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex-none w-28">
            <div className="w-28 h-28 rounded-xl bg-blush/40 animate-pulse" />
            <div className="h-3 w-20 bg-blush/40 rounded mt-1.5 animate-pulse" />
            <div className="h-3 w-12 bg-blush/40 rounded mt-1 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (state.products.length === 0) return null;

  return (
    <div className="px-5 pb-4">
      <p className="text-xs font-semibold text-brown-dark uppercase tracking-wide mb-2.5">
        Customers also purchased
      </p>
      <div
        className="flex gap-3 overflow-x-auto no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {state.products.map((product) => (
          <AlsoPurchasedCard
            key={product.id}
            product={product}
            rateMap={state.rateMap}
            onAdd={onAdd}
          />
        ))}
      </div>
    </div>
  );
}

export default function CartFlyout({
  item,
  onClose,
  onQuickAdd,
}: {
  item: FlyoutItem | null;
  onClose: () => void;
  onQuickAdd: () => void;
}) {
  const [entered, setEntered] = useState(false);
  const [prevItem, setPrevItem] = useState(item);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset the enter transition whenever a new item opens the flyout (or it closes) —
  // done during render, not in an effect, per React's guidance for resetting state
  // when a prop changes: https://react.dev/learn/you-might-not-need-an-effect
  if (item !== prevItem) {
    setPrevItem(item);
    setEntered(false);
  }

  function clearAutoClose() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function scheduleAutoClose() {
    clearAutoClose();
    closeTimerRef.current = setTimeout(onClose, 6000);
  }

  useEffect(() => {
    if (!item) return;
    const raf = requestAnimationFrame(() => setEntered(true));
    scheduleAutoClose();
    return () => {
      cancelAnimationFrame(raf);
      clearAutoClose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        onMouseEnter={clearAutoClose}
        onMouseLeave={scheduleAutoClose}
        onTouchStart={clearAutoClose}
        onTouchEnd={scheduleAutoClose}
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

        <div className="flex-1 overflow-y-auto">
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

          <AlsoPurchasedStrip productId={item.productId} onAdd={onQuickAdd} />
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
