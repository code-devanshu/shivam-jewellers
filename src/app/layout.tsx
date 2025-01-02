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
  title: "Shivam Jewellers - Handcrafted Gold & Silver Jewellery in Deoria",
  description:
    "Discover the finest handcrafted gold and silver jewellery at Shivam Jewellers in Deoria. Shop engagement rings, wedding jewelry, and traditional cultural designs at affordable prices.",
  keywords: [
    "Shivam Jewellers",
    "Gold jewellery in Deoria",
    "Silver jewellery in Deoria",
    "Handcrafted jewellery Deoria",
    "Engagement rings",
    "Wedding rings",
    "Bridal jewelry",
    "Traditional jewellery designs",
    "Affordable luxury jewellery",
    "Custom jewellery Deoria",
    "Cultural jewellery Deoria",
    "Jewelry stores near me",
    "Gold earrings",
    "Diamond rings",
    "Fashion jewellery",
    "Antique jewellery",
    "Designer jewellery",
  ],
  openGraph: {
    title: "Shivam Jewellers - Handcrafted Gold & Silver Jewellery",
    description:
      "Explore handcrafted engagement rings, gold earrings, silver necklaces, and bridal jewelry at Shivam Jewellers in Deoria. Affordable luxury and timeless cultural designs await.",
    url: "https://shivamjewellers.com", // Replace with your actual website URL
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://shivamjewellers.com/assets/images/og-image.jpg", // Replace with an actual image URL
        width: 1200,
        height: 630,
        alt: "Shivam Jewellers - Handcrafted Gold & Silver Jewellery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shivam Jewellers - Handcrafted Gold & Silver Jewellery in Deoria",
    description:
      "Shop exquisite gold, silver, diamond, and bridal jewelry at Shivam Jewellers. Custom designs and cultural elegance for every occasion.",
    images: [
      {
        url: "https://shivamjewellers.com/assets/images/twitter-card.jpg", // Replace with an actual Twitter image URL
        alt: "Shivam Jewellers - Jewelry in Deoria",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  const shouldHideHeaderFooter = session?.user?.email === "admin@admin.com";
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
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
