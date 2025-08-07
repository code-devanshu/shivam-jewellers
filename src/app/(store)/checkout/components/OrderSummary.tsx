"use client";

import { useCart } from "@/app/context/CartContext";
import Image from "next/image";

// Define the shipping form type locally
type ShippingFormData = {
  name: string;
  phone: string;
  address: string;
  pincode: string;
};

export default function OrderSummary({
  shippingData,
}: {
  shippingData?: ShippingFormData;
}) {
  const { items } = useCart();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="bg-white shadow rounded-xl p-6 border border-neutral-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Order Summary
      </h2>

      {/* Product items */}
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No items in cart.</p>
      ) : (
        <ul className="divide-y divide-gray-200 mb-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <div className="relative w-14 h-14 border rounded overflow-hidden bg-pink-50">
                <Image
                  src={item.images?.[0] || "/placeholder.png"}
                  alt={item.name || "Product image"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.name}</div>
                <div className="text-sm text-gray-500">
                  Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                </div>
              </div>
              <div className="font-semibold text-pink-600 text-sm">
                ₹{(item.quantity * item.price).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-between font-semibold text-gray-700 mt-4">
        <span>Total:</span>
        <span className="text-pink-600">₹{total.toLocaleString()}</span>
      </div>

      {/* Shipping details (step 2) */}
      {shippingData && (
        <div className="mt-6 text-sm text-gray-600 space-y-1 border-t pt-4">
          <div>
            <span className="font-medium text-gray-700">Ship to:</span>{" "}
            {shippingData.name}
          </div>
          <div>{shippingData.address}</div>
          <div>Pincode: {shippingData.pincode}</div>
          <div>Phone: {shippingData.phone}</div>
        </div>
      )}
    </div>
  );
}
