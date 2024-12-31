import { useCart } from "@/context/CartContext";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ShoppingCartIcon } from "lucide-react";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { CartItem } from "../../app/products/components/CartItem";
import Link from "next/link";

export default function CartSheet() {
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          aria-label="Cart"
          variant="outline"
          size="icon"
          className="relative"
        >
          <div className="relative ms-4">
            <div
              className="bg-black text-white border-yellow-600 hover:bg-yellow-700 p-2 rounded-full"
              aria-label="Cart"
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {itemCount > 0 && (
                <Badge className="absolute -right-2 -top-2 g-6 w-6 h-6 rounded-full p-2">
                  {itemCount}
                </Badge>
              )}
            </div>
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col pr-0 sm:max-w-lg bg-white">
        <SheetHeader className="px-1">
          <SheetTitle>Cart {itemCount > 0 && `(${itemCount})`}</SheetTitle>
        </SheetHeader>

        {itemCount > 0 && (
          <div className="flex flex-col gap-5 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-5 pr-6">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="space-y-3">
                    <CartItem item={item} />
                  </div>
                ))}

                <SheetClose asChild>
                  <Link
                    href="/cart"
                    className="w-full bg-black text-center text-white hover:bg-gray-800 py-2 text-sm rounded-md"
                  >
                    Go to Cart
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/checkout"
                    className="w-full bg-yellow-600 text-center text-black hover:bg-yellow-700 py-2 text-sm rounded-md"
                  >
                    Checkout
                  </Link>
                </SheetClose>
              </div>
            </ScrollArea>
          </div>
        )}
        <Separator />
      </SheetContent>
    </Sheet>
  );
}
