import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import RateBanner from "@/components/store/RateBanner";
import { Toaster } from "sonner";
import { getCurrentRates, getCategories } from "@/lib/data";
import { getCustomerSession } from "@/lib/customer-auth";
import { getCartItemCount, getWishlistItemCount } from "@/lib/customer-store";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customerId = await getCustomerSession();

  const [rates, categories, cartCount, wishlistCount] = await Promise.all([
    getCurrentRates(),
    getCategories(),
    customerId ? getCartItemCount(customerId) : Promise.resolve(0),
    customerId ? getWishlistItemCount(customerId) : Promise.resolve(0),
  ]);

  return (
    <>
      <RateBanner rates={rates} />
      <Navbar
        categories={categories}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        isLoggedIn={!!customerId}
      />
      <main className="flex-1 bg-background">{children}</main>
      <Footer />
      <Toaster position="bottom-center" richColors />
    </>
  );
}
