"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useOptimistic, useTransition } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductVariant } from "@/lib/types";
import { calculatePrice, formatPrice } from "@/lib/price";
import { clearCartAction, removeFromCart, restoreCartItem, updateCartQty } from "./actions";
import EmptyCart from "./EmptyCart";

type CartItem = {
  id: string;
  quantity: number;
  product: Product;
  variant: ProductVariant | null;
};

type Props = {
  items: CartItem[];
  rates: Record<string, number>; // metalId → ratePerGram
};

function CartRow({
  item,
  rates,
  onRemove,
}: {
  item: CartItem;
  rates: Record<string, number>;
  onRemove: (item: CartItem) => void;
}) {
  const [isPending, startQtyTransition] = useTransition();
  const ratePerGram = rates[item.product.metalId] ?? 0;
  const breakdown = calculatePrice(
    item.product,
    ratePerGram,
    item.variant?.additionalPrice ?? 0
  );
  const primary =
    item.product.images.find((i) => i.isPrimary) ?? item.product.images[0];

  const change = (delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      onRemove(item);
      return;
    }
    startQtyTransition(() => updateCartQty(item.id, newQty));
  };

  return (
    <div
      className={`flex gap-4 py-4 border-b border-blush last:border-0 transition-opacity ${isPending ? "opacity-50 pointer-events-none" : ""}`}
    >
      <Link href={`/products/${item.product.slug}`} className="shrink-0">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-blush/40 border border-blush">
          {primary ? (
            <Image
              src={primary.url}
              alt={item.product.name}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-rose-gold-light">
              ✦
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-rose-gold font-medium uppercase tracking-wider mb-0.5">
          {item.product.metal.name} · {item.product.purity}
        </p>
        <Link
          href={`/products/${item.product.slug}`}
          className="text-sm font-semibold text-brown-dark hover:text-rose-gold transition-colors line-clamp-2"
        >
          {item.product.name}
        </Link>
        {item.variant?.size && (
          <p className="text-xs text-brown/50 mt-0.5">Size: {item.variant.size}</p>
        )}
        {item.variant?.gemstone && (
          <p className="text-xs text-brown/50">Stone: {item.variant.gemstone}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 border border-blush rounded-full px-1 py-0.5">
            <button
              onClick={() => change(-1)}
              className="p-2 text-brown/60 hover:text-rose-gold transition-colors"
              aria-label={item.quantity <= 1 ? "Remove" : "Decrease quantity"}
            >
              <Minus size={12} />
            </button>
            <span className="w-6 text-center text-sm font-semibold text-brown-dark">
              {item.quantity}
            </span>
            <button
              onClick={() => change(1)}
              className="p-2 text-brown/60 hover:text-rose-gold transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={12} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-rose-gold-dark">
              {formatPrice(breakdown.totalPrice * item.quantity)}
            </span>
            <button
              onClick={() => onRemove(item)}
              className="p-2.5 -m-1 text-gray-300 hover:text-red-400 transition-colors"
              aria-label="Remove"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type CartAction = { type: "remove"; id: string } | { type: "clear" };

export default function CartClient({ items, rates }: Props) {
  const [optimisticItems, dispatchOptimistic] = useOptimistic(
    items,
    (state, action: CartAction) =>
      action.type === "clear" ? [] : state.filter((i) => i.id !== action.id)
  );
  const [isClearing, startClearTransition] = useTransition();

  const handleClearCart = () => {
    if (optimisticItems.length === 0) return;
    if (!window.confirm("Remove all items from your cart?")) return;

    const clearedItems = optimisticItems;

    startClearTransition(async () => {
      dispatchOptimistic({ type: "clear" });
      await clearCartAction();
    });

    toast("Cart cleared", {
      duration: 5000,
      style: {
        background: "#fff",
        border: "1px solid #ffe4e4",
        color: "#2c1810",
      },
      classNames: {
        actionButton: "!bg-rose-gold !text-white hover:!bg-rose-gold-dark",
      },
      action: {
        label: "Undo",
        onClick: () => {
          toast.promise(
            Promise.all(
              clearedItems.map((item) =>
                restoreCartItem(item.product.id, item.variant?.id ?? null, item.quantity)
              )
            ),
            {
              loading: "Restoring...",
              success: "Cart restored",
              error: "Couldn't restore cart",
              style: {
                background: "#fff",
                border: "1px solid #ffe4e4",
                color: "#2c1810",
              },
            }
          );
        },
      },
    });
  };

  const handleRemove = (item: CartItem) => {
    startTransition(async () => {
      dispatchOptimistic({ type: "remove", id: item.id });
      await removeFromCart(item.id);
    });

    toast("Removed from cart", {
      description: item.product.name,
      duration: 5000,
      style: {
        background: "#fff",
        border: "1px solid #ffe4e4",
        color: "#2c1810",
      },
      classNames: {
        description: "!text-[#4a2c24]/70",
        actionButton: "!bg-rose-gold !text-white hover:!bg-rose-gold-dark",
      },
      action: {
        label: "Undo",
        onClick: () => {
          toast.promise(
            restoreCartItem(item.product.id, item.variant?.id ?? null, item.quantity),
            {
              loading: "Restoring...",
              success: "Item restored to cart",
              error: "Couldn't restore item",
              style: {
                background: "#fff",
                border: "1px solid #ffe4e4",
                color: "#2c1810",
              },
            }
          );
        },
      },
    });
  };

  const subtotal = optimisticItems.reduce((sum, item) => {
    const ratePerGram = rates[item.product.metalId] ?? 0;
    const { basePrice } = calculatePrice(
      item.product,
      ratePerGram,
      item.variant?.additionalPrice ?? 0
    );
    return sum + basePrice * item.quantity;
  }, 0);

  const gst = optimisticItems.reduce((sum, item) => {
    const ratePerGram = rates[item.product.metalId] ?? 0;
    const { gstAmount } = calculatePrice(
      item.product,
      ratePerGram,
      item.variant?.additionalPrice ?? 0
    );
    return sum + gstAmount * item.quantity;
  }, 0);

  const total = subtotal + gst;

  if (optimisticItems.length === 0) {
    return (
      <>
        <EmptyCart />
        {isClearing && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl">
              <Loader2 className="animate-spin text-rose-gold" size={36} />
              <p className="text-brown-dark font-semibold">Clearing your cart…</p>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-brown-dark">
          Your Cart{" "}
          <span className="text-base font-normal text-brown/50">
            ({optimisticItems.length} {optimisticItems.length === 1 ? "item" : "items"})
          </span>
        </h1>
        {optimisticItems.length > 0 && (
          <button
            onClick={handleClearCart}
            className="flex items-center gap-1.5 text-xs font-medium text-brown/60 hover:text-red-500 border border-blush hover:border-red-200 rounded-full px-3 py-1.5 transition-colors"
          >
            <Trash2 size={13} />
            Clear cart
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 bg-white border border-blush rounded-2xl p-6">
          {optimisticItems.map((item) => (
            <CartRow key={item.id} item={item} rates={rates} onRemove={handleRemove} />
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white border border-blush rounded-2xl p-6 h-fit space-y-4">
          <h2 className="font-semibold text-brown-dark">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-brown/70">
              <span>Subtotal (excl. GST)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-brown/70">
              <span>GST</span>
              <span>{formatPrice(gst)}</span>
            </div>
            <div className="flex justify-between font-bold text-brown-dark border-t border-blush pt-3 mt-2">
              <span>Total</span>
              <span className="text-rose-gold-dark">{formatPrice(total)}</span>
            </div>
          </div>
          <p className="text-xs text-brown/40 leading-relaxed">
            Prices are calculated at today&apos;s live metal rate and may vary slightly at checkout.
          </p>
          <Link
            href="/checkout"
            className="w-full py-3 bg-rose-gold hover:bg-rose-gold-dark text-white rounded-full text-sm font-semibold transition flex items-center justify-center gap-2"
          >
            Proceed to Checkout <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {isClearing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl">
            <Loader2 className="animate-spin text-rose-gold" size={36} />
            <p className="text-brown-dark font-semibold">Clearing your cart…</p>
          </div>
        </div>
      )}
    </div>
  );
}
