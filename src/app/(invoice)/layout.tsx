import { CartProvider } from "../context/CartContext";

// app/invoice/layout.tsx
export default function InvoiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CartProvider>{children}</CartProvider>
    </>
  );
}
