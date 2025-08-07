"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

type ContactFormValues = {
  fullName: string;
  email: string;
  phone: string;
};

type AddressFormValues = {
  street: string;
  city: string;
  state: string;
  pincode: string;
};

interface CheckoutState {
  contact: ContactFormValues;
  address: AddressFormValues;
  payment: {
    invoiceOrder: boolean;
  };
}

export default function InvoicePage() {
  const [invoiceData, setInvoiceData] = useState<CheckoutState | null>(null);
  const router = useRouter();
  const { items: order } = useCart();

  useEffect(() => {
    const saved = sessionStorage.getItem("checkoutState");
    if (saved) {
      try {
        const parsed: CheckoutState = JSON.parse(saved);
        if (!parsed?.payment?.invoiceOrder) {
          router.replace("/checkout");
        } else {
          setInvoiceData(parsed);
        }
      } catch (err) {
        console.error("Invalid session data:", err);
        router.replace("/checkout");
      }
    } else {
      router.replace("/checkout");
    }
  }, [router]);

  const handlePrint = () => window.print();

  if (!invoiceData) {
    return <p className="text-center mt-20">Loading invoice...</p>;
  }

  const { contact, address } = invoiceData;
  const subtotal = order.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
  const date = new Date().toLocaleDateString("en-GB");

  return (
    <main className="max-w-full w-full min-h-screen mx-auto px-6 py-10 print:py-0 print:shadow-none bg-white print:bg-white rounded-lg shadow-md print:rounded-none print:border-none print:mt-0 print:text-black">
      <div className="flex justify-between items-start mb-6 border-b pb-4 print:border-black">
        <div>
          <h1 className="text-2xl font-extrabold text-pink-700 font-serif">
            Shivam<span className="text-black">.Jewel</span>
          </h1>
          <p className="text-sm text-gray-700">www.shivamjewel.com</p>
        </div>
        <div className="text-sm text-gray-600 text-right space-y-1">
          <p>
            <span className="font-semibold">Invoice #:</span> {invoiceNumber}
          </p>
          <p>
            <span className="font-semibold">Date:</span> {date}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-10 mb-8">
        <div>
          <h2 className="font-semibold text-gray-800 mb-1">Billed To</h2>
          <p>{contact.fullName}</p>
          <p>{contact.email}</p>
          <p>{contact.phone}</p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-800 mb-1">Shipping Address</h2>
          <p>{address.street}</p>
          <p>
            {address.city}, {address.state} - {address.pincode}
          </p>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Order Summary</h2>
        <table className="w-full text-sm border border-collapse border-gray-300 print:border-black">
          <thead className="bg-gray-100 text-left print:bg-white">
            <tr>
              <th className="border px-4 py-2 print:border-black">Item</th>
              <th className="border px-4 py-2 print:border-black">Qty</th>
              <th className="border px-4 py-2 print:border-black">Price</th>
            </tr>
          </thead>
          <tbody>
            {order.map((item) => (
              <tr key={item.id}>
                <td className="border px-4 py-2 print:border-black">
                  {item.name}
                </td>
                <td className="border px-4 py-2 print:border-black">
                  {item.quantity}
                </td>
                <td className="border px-4 py-2 print:border-black">
                  ₹{item.price * item.quantity}
                </td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td
                className="border px-4 py-2 text-right print:border-black"
                colSpan={2}
              >
                Total
              </td>
              <td className="border px-4 py-2 print:border-black">
                ₹{subtotal}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <p className="text-center text-xs text-gray-500 mt-4">
        Thank you for shopping with ShivamJewel!
      </p>

      <div className="flex justify-end mt-6 print:hidden">
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
        >
          Print Invoice
        </button>
      </div>
    </main>
  );
}
