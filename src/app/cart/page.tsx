"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { TrashIcon } from "lucide-react";

export default function CartPage() {
  const { cartItems, updateCartItemQuantity, removeFromCart } = useCart();

  // Calculate totals
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const deliveryFee = 1250; // Fixed delivery fee
  const total = subtotal + deliveryFee;

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 bg-black text-white">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Section - Cart Items */}
        <div className="w-full lg:w-2/3 h-[calc(100vh-96px)] overflow-y-auto">
          <h1 className="text-3xl font-bold mb-6">Bag</h1>
          <div className="space-y-6">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-start gap-6 border-b border-gray-700 pb-6"
                >
                  {/* Product Image */}
                  <Image
                    src={item.product.image[0]} // Assuming product.image is an array
                    alt={item.product.name}
                    width={120}
                    height={120}
                    className="rounded-md h-28 object-contain"
                  />

                  {/* Product Details */}
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-white">
                      {item.product.name}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {item.product.category}
                    </p>
                    <p className="text-sm text-gray-400 line-clamp-3">
                      {item.product.description || "No description available."}
                    </p>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex flex-col items-end justify-between">
                    {/* Price */}
                    <p className="text-lg font-bold text-yellow-600">
                      ₹ {item.product.price.toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        className="border-gray-400 text-gray-500 hover:bg-gray-200"
                        onClick={() =>
                          updateCartItemQuantity(
                            item.product.id,
                            Math.max(item.quantity - 1, 0)
                          )
                        }
                      >
                        -
                      </Button>
                      <span className="text-white">{item.quantity}</span>
                      <Button
                        variant="outline"
                        className="border-gray-400 text-gray-500 hover:bg-gray-200"
                        onClick={() =>
                          updateCartItemQuantity(
                            item.product.id,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </Button>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      className="text-red-500 hover:text-red-600 text-sm mt-2 hover:underline"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Your bag is empty.</p>
            )}
          </div>
        </div>

        {/* Right Section - Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="sticky top-6 bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Summary</h2>
            <div className="space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between">
                <p className="text-gray-400">Subtotal</p>
                <p className="text-white">₹ {subtotal.toFixed(2)}</p>
              </div>
              {/* Delivery Fee */}
              <div className="flex justify-between">
                <p className="text-gray-400">Estimated Delivery & Handling</p>
                <p className="text-white">₹ {deliveryFee.toFixed(2)}</p>
              </div>
              {/* Total */}
              <div className="flex justify-between border-t border-gray-700 pt-4">
                <p className="text-lg font-bold">Total</p>
                <p className="text-lg font-bold text-yellow-600">
                  ₹ {total.toFixed(2)}
                </p>
              </div>
            </div>
            {/* Checkout Buttons */}
            <div className="mt-6 space-y-4">
              <Button className="w-full bg-gray-900 text-white hover:bg-gray-700 py-3">
                Guest Checkout
              </Button>
              <Button className="w-full bg-yellow-600 text-black hover:bg-yellow-700 py-3">
                Member Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
