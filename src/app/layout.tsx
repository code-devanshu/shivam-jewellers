import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Socialicon } from "@/components/core/Socialicon";
import Header from "@/components/core/header";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Shivam Jewellers - Gold & Silver Jewellery in Deoria",
  description:
    "Explore handcrafted gold and silver jewellery at Shivam Jewellers, located at Mahasay Ji Ki Gali, Malviya Road, Deoria, UP. We bring you affordable luxury with timeless designs rooted in cultural significance.",
  keywords: [
    "Shivam Jewellers",
    "Gold jewellery",
    "Silver jewellery",
    "Handcrafted jewellery",
    "Jewellery in Deoria",
    "Affordable luxury jewellery",
    "Cultural jewellery designs",
  ],
  openGraph: {
    title: "Shivam Jewellers - Gold & Silver Jewellery",
    description:
      "Discover the finest handcrafted gold and silver jewellery at Shivam Jewellers. Affordable luxury and cultural heritage in every piece.",
    url: "https://shivamjewellers.com", // Replace with your actual website URL
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shivam Jewellers - Gold & Silver Jewellery",
    description:
      "Explore the best of gold and silver jewellery at Shivam Jewellers in Deoria. Handcrafted elegance for every occasion.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const shouldHideHeaderFooter = Boolean(session);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${
          !shouldHideHeaderFooter ? "bg-black" : ""
        }`}
      >
        <CartProvider>
          {!shouldHideHeaderFooter && <Header />}

          <TooltipProvider>
            <div
              className={`${
                !shouldHideHeaderFooter &&
                "mt-10 sm:mt-14 md:mt-16 lg:mt-[4.5rem] "
              }`}
            >
              {children}
            </div>
          </TooltipProvider>

          <Socialicon />
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
