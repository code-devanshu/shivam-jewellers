import "./globals.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="font-serif">
      <body className="bg-neutral-50 text-gray-900 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
