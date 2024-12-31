"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/model/base.model";
import Image from "next/image";

interface ProductActionsProps {
  product: Product;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const { cartItems, addToCart, updateCartItemQuantity } = useCart();

  const cartItem = cartItems.find((item) => item.product.id === product.id);
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(product);

    // Show a toast notification with adjusted alignment and UI
    toast({
      title: "Item Added to Cart",
      description: (
        <div className="flex items-center gap-4 mt-2">
          {/* Product Image */}
          <Image
            src={product.image[0]} // Assuming product.image is an array of URLs
            alt={product.name}
            width={50}
            height={50}
            className="rounded-md object-cover"
          />
          <div>
            {/* Product Name */}
            <p className="font-semibold text-white">{product.name}</p>
            {/* Success Message */}
            <p className="text-sm text-gray-400">Added to cart successfully!</p>
          </div>
        </div>
      ),
      className: "bg-black border border-yellow-600 text-white shadow-lg", // Styled for dark theme
    });
  };

  return (
    <div className="flex items-center gap-4">
      {cartItem?.quantity && cartItem?.quantity > 0 ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="text-yellow-600 border-yellow-600 hover:bg-yellow-700 hover:text-black"
            onClick={() =>
              updateCartItemQuantity(
                product.id,
                cartItem.quantity > 1 ? cartItem.quantity - 1 : 0
              )
            }
          >
            -
          </Button>
          <span className="text-white">{cartItem.quantity}</span>
          <Button
            variant="outline"
            className="text-yellow-600 border-yellow-600 hover:bg-yellow-700 hover:text-black"
            onClick={() =>
              updateCartItemQuantity(product.id, cartItem.quantity + 1)
            }
          >
            +
          </Button>
        </div>
      ) : (
        <Button
          className="bg-yellow-600 text-black hover:bg-yellow-700 px-6 py-3"
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
      )}
    </div>
  );
}
