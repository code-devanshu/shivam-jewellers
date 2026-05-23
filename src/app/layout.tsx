import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Shivam Jewellers", template: "%s | Shivam Jewellers" },
  description:
    "BIS Hallmark certified gold and silver jewellery handcrafted in Deoria, UP. Shop rings, necklaces, bangles, earrings and more. 30+ years of craftsmanship.",
  keywords: [
    "gold jewellery",
    "silver jewellery",
    "BIS hallmark",
    "jewellery Deoria",
    "gold rings",
    "silver bangles",
    "handcrafted jewellery",
    "Shivam Jewellers",
  ],
  authors: [{ name: "Shivam Jewellers" }],
  openGraph: {
    type: "website",
    siteName: "Shivam Jewellers",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
