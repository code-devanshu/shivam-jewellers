"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { Product, ProductVariant } from "@/lib/types";
import { calculatePrice, formatPrice } from "@/lib/price";
import { removeFromCart, updateCartQty } from "./actions";

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
}: {
  item: CartItem;
  rates: Record<string, number>;
}) {
  const [isPending, startTransition] = useTransition();
  const ratePerGram = rates[item.product.metalId] ?? 0;
  const breakdown = calculatePrice(
    item.product,
    ratePerGram,
    item.variant?.additionalPrice ?? 0
  );
  const primary =
    item.product.images.find((i) => i.isPrimary) ?? item.product.images[0];

  const change = (delta: number) =>
    startTransition(() => updateCartQty(item.id, item.quantity + delta));
  const remove = () =>
    startTransition(() => removeFromCart(item.id));

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
              className="p-1 text-brown/60 hover:text-rose-gold transition-colors disabled:opacity-40"
              disabled={item.quantity <= 1}
            >
              <Minus size={12} />
            </button>
            <span className="w-6 text-center text-sm font-semibold text-brown-dark">
              {item.quantity}
            </span>
            <button
              onClick={() => change(1)}
              className="p-1 text-brown/60 hover:text-rose-gold transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-rose-gold-dark">
              {formatPrice(breakdown.totalPrice * item.quantity)}
            </span>
            <button
              onClick={remove}
              className="p-1.5 text-gray-300 hover:text-red-400 transition-colors"
              aria-label="Remove"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartClient({ items, rates }: Props) {
  const subtotal = items.reduce((sum, item) => {
    const ratePerGram = rates[item.product.metalId] ?? 0;
    const { basePrice } = calculatePrice(
      item.product,
      ratePerGram,
      item.variant?.additionalPrice ?? 0
    );
    return sum + basePrice * item.quantity;
  }, 0);

  const gst = items.reduce((sum, item) => {
    const ratePerGram = rates[item.product.metalId] ?? 0;
    const { gstAmount } = calculatePrice(
      item.product,
      ratePerGram,
      item.variant?.additionalPrice ?? 0
    );
    return sum + gstAmount * item.quantity;
  }, 0);

  const total = subtotal + gst;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-serif font-bold text-brown-dark mb-6">
        Your Cart{" "}
        <span className="text-base font-normal text-brown/50">
          ({items.length} {items.length === 1 ? "item" : "items"})
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 bg-white border border-blush rounded-2xl p-6">
          {items.map((item) => (
            <CartRow key={item.id} item={item} rates={rates} />
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
            Prices are calculated at today's live metal rate and may vary slightly at checkout.
          </p>
          <button
            disabled
            className="w-full py-3 bg-rose-gold/40 text-white rounded-full text-sm font-semibold cursor-not-allowed"
            title="Coming soon"
          >
            Proceed to Checkout
          </button>
          <p className="text-center text-xs text-brown/40">Checkout coming soon</p>
        </div>
      </div>
    </div>
  );
}
