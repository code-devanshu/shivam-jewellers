"use client";

import Image from "next/image";
import { Product } from "@/types/product";

type OrderDetailsProps = {
  items: (Product & { quantity: number })[];
};

export default function OrderDetails({ items }: OrderDetailsProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="space-y-8">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-5 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Thumbnail */}
          <div className="relative w-24 h-24 rounded overflow-hidden border border-gray-200 flex-shrink-0">
            <Image
              src={item.images?.[0] || "/placeholder.png"}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1">
            <h4 className="text-lg font-serif font-semibold text-gray-800">
              {item.name}
            </h4>
            {item.description && (
              <p className="text-sm text-gray-500 mt-1 mb-3">
                {item.description}
              </p>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Qty: {item.quantity}</span>
              <span className="font-medium text-gray-800">
                ₹{item.price * item.quantity}
              </span>
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-between text-lg font-semibold text-gray-800 pt-6 border-t">
        <span>Total</span>
        <span>₹{subtotal}</span>
      </div>
    </div>
  );
}
