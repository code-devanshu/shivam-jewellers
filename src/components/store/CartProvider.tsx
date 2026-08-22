"use client";

import { createContext, useCallback, useContext, useState } from "react";
import CartFlyout, { type FlyoutItem } from "@/components/store/CartFlyout";

type CartContextValue = {
  count: number;
  setCount: (n: number) => void;
  increment: (by?: number) => void;
  showFlyout: (item: FlyoutItem) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export default function CartProvider({
  initialCount,
  children,
}: {
  initialCount: number;
  children: React.ReactNode;
}) {
  const [count, setCount] = useState(initialCount);
  const [flyoutItem, setFlyoutItem] = useState<FlyoutItem | null>(null);

  const increment = useCallback((by = 1) => setCount((c) => c + by), []);
  const showFlyout = useCallback((item: FlyoutItem) => setFlyoutItem(item), []);
  const closeFlyout = useCallback(() => setFlyoutItem(null), []);

  return (
    <CartContext.Provider value={{ count, setCount, increment, showFlyout }}>
      {children}
      <CartFlyout item={flyoutItem} onClose={closeFlyout} onQuickAdd={() => increment(1)} />
    </CartContext.Provider>
  );
}
