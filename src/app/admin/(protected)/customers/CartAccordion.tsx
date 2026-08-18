"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X } from "lucide-react";
import { formatPrice } from "@/lib/price";

type Item = {
  id: string;
  quantity: number;
  product: { name: string };
  variant: { size: string | null; gemstone: string | null } | null;
  unitPrice: number;
  lineTotal: number;
};

export default function CartAccordion({
  items,
  cartValue,
}: {
  items: Item[];
  cartValue: number;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = btnRef.current?.getBoundingClientRect();
      if (rect) setPos({ top: rect.bottom + 4, left: rect.left });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 text-xs font-medium rounded-md px-1.5 py-0.5 -ml-1.5 transition-colors ${
          open ? "bg-blush/60 text-rose-gold" : "text-gray-500 hover:bg-gray-100 hover:text-rose-gold"
        }`}
      >
        <span className="max-w-48 truncate">
          {items.length === 1 ? items[0].product.name : `View ${items.length} items`}
        </span>
        <ChevronDown
          size={13}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        createPortal(
          <div
            style={{ top: pos.top, left: pos.left }}
            className="fixed z-50 w-72 max-h-72 flex flex-col bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-semibold text-brown-dark">
                {items.length} item{items.length !== 1 ? "s" : ""} in cart
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
            <ul className="overflow-y-auto divide-y divide-gray-50">
              {items.map((item, i) => (
                <li key={item.id} className="flex gap-2.5 px-3 py-2">
                  <span className="shrink-0 w-4 h-4 mt-0.5 rounded-full bg-blush text-rose-gold text-[10px] font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-brown-dark truncate">
                        {item.product.name}
                      </p>
                      <p className="shrink-0 text-xs font-semibold text-brown-dark">
                        {formatPrice(item.lineTotal)}
                      </p>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {[
                        item.variant?.size,
                        item.variant?.gemstone && item.variant.gemstone !== "None"
                          ? item.variant.gemstone
                          : null,
                        `Qty ${item.quantity}`,
                        item.quantity > 1 ? `${formatPrice(item.unitPrice)} each` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 bg-gray-50">
              <span className="text-xs font-semibold text-brown-dark">Total</span>
              <span className="text-xs font-bold text-rose-gold">{formatPrice(cartValue)}</span>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
