import { getCartItemCount, getWishlistItemCount } from "@/lib/customer-store";
import Navbar from "@/components/store/Navbar";
import type { Category, Product } from "@/lib/types";

export default async function NavbarWithCounts({
  categories,
  trendingProducts,
  customerId,
}: {
  categories: Category[];
  trendingProducts: Product[];
  customerId: string | null;
}) {
  const [cartCount, wishlistCount] = await Promise.all([
    customerId ? getCartItemCount(customerId) : Promise.resolve(0),
    customerId ? getWishlistItemCount(customerId) : Promise.resolve(0),
  ]);
  return (
    <Navbar
      categories={categories}
      trendingProducts={trendingProducts}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      isLoggedIn={!!customerId}
    />
  );
}
