import { getCartItemCount, getWishlistItemCount } from "@/lib/customer-store";
import Navbar from "@/components/store/Navbar";
import type { Category } from "@/lib/types";

export default async function NavbarWithCounts({
  categories,
  customerId,
}: {
  categories: Category[];
  customerId: string | null;
}) {
  const [cartCount, wishlistCount] = await Promise.all([
    customerId ? getCartItemCount(customerId) : Promise.resolve(0),
    customerId ? getWishlistItemCount(customerId) : Promise.resolve(0),
  ]);
  return (
    <Navbar
      categories={categories}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      isLoggedIn={!!customerId}
    />
  );
}
