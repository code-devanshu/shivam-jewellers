"use client";

import { useCart } from "@/app/context/CartContext";
import { X, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CartSidebar() {
  const router = useRouter();
  const {
    items,
    open,
    setOpen,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    setOpen(false);
    router.push("/checkout");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />
      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-70 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        } rounded-l-2xl flex flex-col`}
        style={{ minHeight: "100vh" }}
        aria-label="Cart Sidebar"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-pink-600" />
            <span className="text-xl font-bold text-pink-600">Your Cart</span>
          </div>
          <button
            className="text-gray-400 hover:text-pink-600 transition"
            onClick={() => setOpen(false)}
            aria-label="Close cart"
          >
            <X size={28} />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-20 gap-3 text-neutral-400">
              <ShoppingCart size={64} />
              <div className="font-semibold text-lg mt-2">
                Your cart is empty
              </div>
              <p className="text-sm text-neutral-400">
                Add some dazzling pieces!
              </p>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-4 bg-pink-50/50 rounded-xl p-3 shadow-sm"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-pink-200 bg-white">
                    <Image
                      src={item.images?.[0] || "/placeholder.png"}
                      alt={item.name || "Product image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      ₹{item.price.toLocaleString()}
                    </div>

                    {/* ➕➖ Quantity controls */}
                    <div className="flex items-center mt-2 gap-2">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="bg-white border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center text-gray-600 hover:text-pink-600 hover:border-pink-400 transition"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="bg-white border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center text-gray-600 hover:text-pink-600 hover:border-pink-400 transition"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <button
                    className="ml-2 text-red-400 hover:text-red-600 transition"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove item"
                  >
                    <Trash2 size={20} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-6 border-t flex flex-col gap-3">
          <div className="flex justify-between items-center font-semibold text-lg">
            <span>Total:</span>
            <span className="text-pink-600">₹{total.toLocaleString()}</span>
          </div>
          <button
            className={`w-full bg-gradient-to-r from-pink-600 to-pink-500 text-white py-3 rounded-xl font-bold shadow-lg text-lg transition
    ${
      items.length === 0
        ? "opacity-50 cursor-not-allowed grayscale"
        : "hover:from-pink-700 hover:to-pink-600"
    }
  `}
            onClick={handleCheckout}
            disabled={items.length === 0}
          >
            Checkout
          </button>

          {items.length > 0 && (
            <button
              className="w-full text-sm text-neutral-400 hover:text-red-500 transition mt-2"
              onClick={clearCart}
            >
              Clear Cart
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
