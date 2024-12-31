import { useCart } from "@/context/CartContext";
import React from "react";
import { TrashIcon } from "lucide-react";
import type { CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CartItemActionsProps {
  item: CartItem;
}

export function CartItemActions({ item }: CartItemActionsProps) {
  const { updateCartItemQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (qty: number) => {
    const quantity = Number(qty);
    if (quantity >= 1) {
      updateCartItemQuantity(item.product.id, quantity);
    }
  };

  const handleRemoveClick = () => {
    removeFromCart(item.product.id);
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            handleQuantityChange(item.quantity - 1);
          }}
        >
          -
        </Button>
      </div>
      <Input
        className="h-8 w-14 text-center text-xs"
        type="text"
        readOnly
        min="1"
        value={item.quantity}
        onChange={(e) => {
          handleQuantityChange(Number(e.target.value));
        }}
      />
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => {
          handleQuantityChange(item.quantity + 1);
        }}
      >
        +
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 border-none bg-red-500 hover:bg-red-600"
        onClick={handleRemoveClick}
      >
        <TrashIcon className="h-4 w-4 text-white" />
      </Button>
    </div>
  );
}
