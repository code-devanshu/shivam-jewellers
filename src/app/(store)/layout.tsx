import Footer from "./components/Footer";
import PromoBar from "./components/PromoBar";
import CartSidebar from "./components/CartSidebar";
import Header from "./components/header";
import { CartProvider } from "../context/CartContext";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shivam Jewellers - Handcrafted Gold & Silver Jewellery in Deoria",
  description:
    "Discover the finest handcrafted gold and silver jewellery at Shivam Jewellers in Deoria. Shop engagement rings, wedding jewelry, and traditional cultural designs at affordable prices.",
  keywords: [
    "Affordable luxury jewellery",
    "Antique jewellery",
    "Best Jewellery Showrooms in Deoria",
    "Bridal jewelry",
    "Contact Number",
    "Cultural jewellery Deoria",
    "Custom jewellery Deoria",
    "Designer jewellery",
    "Diamond rings",
    "Engagement rings",
    "Fashion jewellery",
    "Gold earrings",
    "Gold jewellery in Deoria",
    "Handcrafted jewellery Deoria",
    "Jewellery Shops Deoria",
    "Jewellery Showrooms India",
    "Jewellery Showrooms in Deoria",
    "Jewellery Stores in Deoria",
    "Jewelry stores near me",
    "Map",
    "Phone Number",
    "Ratings",
    "Reviews",
    "Shivam Jewellers",
    "Silver jewellery in Deoria",
    "Traditional jewellery designs",
    "Wedding rings",
  ],

  openGraph: {
    title: "Shivam Jewellers - Handcrafted Gold & Silver Jewellery",
    description:
      "Explore handcrafted engagement rings, gold earrings, silver necklaces, and bridal jewelry at Shivam Jewellers in Deoria. Affordable luxury and timeless cultural designs await.",
    url: "https://shivamjewellers.co.in", // Replace with your actual website URL
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://shivamjewellers.co.in/assets/images/og-image.jpg", // Replace with an actual image URL
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
        url: "https://shivamjewellers.co.in/assets/images/twitter-card.jpg", // Replace with an actual Twitter image URL
        alt: "Shivam Jewellers - Jewelry in Deoria",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CartProvider>
        <PromoBar />
        <Header />
        <CartSidebar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </CartProvider>

      {/* <Socialicon /> */}
    </>
  );
}
