import { Suspense } from "react";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import RateBanner from "@/components/store/RateBanner";
import { Toaster } from "sonner";
import { getCurrentRates, getCategories, getFeaturedProducts } from "@/lib/data";
import { getCustomerSession } from "@/lib/customer-auth";
import NavbarWithCounts from "./NavbarWrapper";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customerId = await getCustomerSession();
  const [rates, categories, featuredProducts] = await Promise.all([
    getCurrentRates(),
    getCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <>
      <RateBanner rates={rates} />
      <Suspense
        fallback={
          <Navbar
            categories={categories}
            trendingProducts={[]}
            cartCount={0}
            wishlistCount={0}
            isLoggedIn={!!customerId}
          />
        }
      >
        <NavbarWithCounts categories={categories} trendingProducts={featuredProducts} customerId={customerId} />
      </Suspense>
      <main className="flex-1 bg-background">{children}</main>
      <Footer />
      <Toaster position="bottom-center" richColors />
    </>
  );
}
