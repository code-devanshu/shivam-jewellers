"use client";

import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { CartItemActions } from "./UpdateCart";
import type { CartItem } from "@/types";

interface CartItemProps {
  item: CartItem;
}

export function CartItem({ item }: CartItemProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="relative h-16 w-16 overflow-hidden rounded">
        <Image
          src={item.product.image[0]}
          alt={item.product.name}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          fill
          className="absolute object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 self-start text-sm">
        <span className="line-clamp-1">{item.product.name}</span>
        <span className="line-clamp-1 text-muted-foreground">
          {formatPrice(item.product.price)} x {item.quantity} ={" "}
          {formatPrice(item.product.price * item.quantity)}
        </span>
        <span className="line-clamp-1 text-xs capitalize text-muted-foreground">
          {item.product.category}
        </span>
      </div>
      <CartItemActions item={item} />
    </div>
  );
}
