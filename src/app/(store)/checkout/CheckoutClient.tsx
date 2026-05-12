"use client";

import { useState } from "react";
import Image from "next/image";
import { Truck, Store, Banknote, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/price";
import { placeOrderCOD, initRazorpayCheckout, verifyAndConfirmPayment } from "./actions";
import type { CheckoutInput } from "./actions";

// ── Razorpay type shim ────────────────────────────────────────────────────────

type RzpResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RzpOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RzpResponse) => void;
  prefill?: { name?: string; contact?: string; email?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay: new (options: RzpOptions) => { open: () => void };
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

type SummaryItem = {
  id: string;
  productName: string;
  variantLabel: string | null;
  metalName: string;
  purity: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type Props = {
  items: SummaryItem[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
};

// ── Input component ───────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-brown/60 uppercase tracking-wide mb-1.5">
        {label}
        {required && <span className="text-rose-gold ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-blush bg-white text-sm text-brown-dark placeholder:text-brown/30 focus:outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/10 transition";

// ── Main component ────────────────────────────────────────────────────────────

export default function CheckoutClient({
  items,
  subtotal,
  gstAmount,
  totalAmount,
  customerName,
  customerPhone,
  customerEmail,
}: Props) {
  const [deliveryType, setDeliveryType] = useState<"HOME_DELIVERY" | "STORE_PICKUP">("STORE_PICKUP");
  const [name, setName] = useState(customerName ?? "");
  const [phone, setPhone] = useState(customerPhone ?? "");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("COD");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  function buildInput(): CheckoutInput {
    return {
      deliveryType,
      address:
        deliveryType === "HOME_DELIVERY"
          ? { name, phone, line1, line2: line2 || undefined, city, state, pincode }
          : undefined,
      notes: notes.trim() || undefined,
    };
  }

  function openRazorpayModal(opts: {
    orderId: string;
    razorpayOrderId: string;
    amount: number;
    keyId: string;
  }) {
    const rzp = new window.Razorpay({
      key: opts.keyId,
      amount: opts.amount,
      currency: "INR",
      name: "Shivam Jewellers",
      description: "Jewellery Purchase",
      order_id: opts.razorpayOrderId,
      prefill: {
        name: customerName ?? undefined,
        contact: customerPhone ?? undefined,
        email: customerEmail ?? undefined,
      },
      theme: { color: "#b76e79" },
      modal: {
        ondismiss: () => {
          setError(null);
        },
      },
      handler: async (response: RzpResponse) => {
        setIsVerifying(true);
        try {
          await verifyAndConfirmPayment({
            orderId: opts.orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
        } catch (err) {
          const msg = String(err);
          if (!msg.includes("NEXT_REDIRECT")) {
            setIsVerifying(false);
            setError(
              `Payment verification failed. Please contact us with payment reference: ${response.razorpay_payment_id}`
            );
          }
        }
      },
    });
    rzp.open();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isProcessing || isVerifying) return;
    setError(null);
    setIsProcessing(true);

    const input = buildInput();

    try {
      if (paymentMethod === "COD") {
        await placeOrderCOD(input);
      } else {
        const result = await initRazorpayCheckout(input);
        setIsProcessing(false);
        openRazorpayModal(result);
      }
    } catch (err) {
      const msg = String(err);
      if (!msg.includes("NEXT_REDIRECT")) {
        setIsProcessing(false);
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    }
  }

  const busy = isProcessing || isVerifying;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-serif font-bold text-brown-dark mb-8">Checkout</h1>

      {/* Verifying overlay */}
      {isVerifying && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl">
            <Loader2 className="animate-spin text-rose-gold" size={36} />
            <p className="text-brown-dark font-semibold">Verifying your payment…</p>
            <p className="text-brown/50 text-sm">Please do not close this window</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: delivery + address ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery type */}
            <div className="bg-white border border-blush rounded-2xl p-6">
              <h2 className="font-semibold text-brown-dark mb-4">Delivery Method</h2>
              <div className="grid grid-cols-2 gap-3">
                {/* Home Delivery */}
                <button
                  type="button"
                  onClick={() => setDeliveryType("HOME_DELIVERY")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition ${
                    deliveryType === "HOME_DELIVERY"
                      ? "border-rose-gold bg-blush/40"
                      : "border-blush bg-white hover:border-rose-gold/50"
                  }`}
                >
                  <Truck size={20} className={deliveryType === "HOME_DELIVERY" ? "text-rose-gold shrink-0" : "text-brown/40 shrink-0"} />
                  <div>
                    <p className="text-sm font-semibold text-brown-dark">Home Delivery</p>
                    <p className="text-xs text-brown/50 mt-0.5">Delivered to your address</p>
                  </div>
                </button>

                {/* Store Pickup */}
                <button
                  type="button"
                  onClick={() => setDeliveryType("STORE_PICKUP")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition ${
                    deliveryType === "STORE_PICKUP"
                      ? "border-rose-gold bg-blush/40"
                      : "border-blush bg-white hover:border-rose-gold/50"
                  }`}
                >
                  <Store size={20} className={deliveryType === "STORE_PICKUP" ? "text-rose-gold shrink-0" : "text-brown/40 shrink-0"} />
                  <div>
                    <p className="text-sm font-semibold text-brown-dark">Store Pickup</p>
                    <p className="text-xs text-brown/50 mt-0.5">Collect from our store</p>
                  </div>
                </button>
              </div>

              {deliveryType === "STORE_PICKUP" && (
                <p className="mt-3 text-xs text-brown/60 bg-cream border border-blush rounded-xl px-4 py-3 leading-relaxed">
                  We&apos;ll notify you when your order is ready. Please bring a valid ID when collecting.
                  <br />
                  <span className="font-semibold text-brown-dark">
                    Jamuna Gali, Malviya Rd, Deoria, UP 274806
                  </span>
                </p>
              )}
            </div>

            {/* Address form */}
            {deliveryType === "HOME_DELIVERY" && (
              <div className="bg-white border border-blush rounded-2xl p-6">
                <h2 className="font-semibold text-brown-dark mb-5">Delivery Address</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Full Name" required>
                      <input
                        className={inputCls}
                        placeholder="Recipient's name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Field>
                    <Field label="Phone Number" required>
                      <input
                        className={inputCls}
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        pattern="[0-9]{10}"
                        title="Enter a 10-digit mobile number"
                        required
                      />
                    </Field>
                  </div>

                  <Field label="Address Line 1" required>
                    <input
                      className={inputCls}
                      placeholder="House / Flat no., Street name"
                      value={line1}
                      onChange={(e) => setLine1(e.target.value)}
                      required
                    />
                  </Field>

                  <Field label="Address Line 2">
                    <input
                      className={inputCls}
                      placeholder="Landmark, Area (optional)"
                      value={line2}
                      onChange={(e) => setLine2(e.target.value)}
                    />
                  </Field>

                  <div className="grid grid-cols-3 gap-4">
                    <Field label="City" required>
                      <input
                        className={inputCls}
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </Field>
                    <Field label="State" required>
                      <input
                        className={inputCls}
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                      />
                    </Field>
                    <Field label="Pincode" required>
                      <input
                        className={inputCls}
                        placeholder="6-digit pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        pattern="[0-9]{6}"
                        title="Enter a 6-digit pincode"
                        required
                      />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-white border border-blush rounded-2xl p-6">
              <h2 className="font-semibold text-brown-dark mb-4">Order Notes</h2>
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Any special instructions? (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Payment method */}
            <div className="bg-white border border-blush rounded-2xl p-6">
              <h2 className="font-semibold text-brown-dark mb-4">Payment Method</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition ${
                    paymentMethod === "COD"
                      ? "border-rose-gold bg-blush/40"
                      : "border-blush bg-white hover:border-rose-gold/50"
                  }`}
                >
                  <Banknote size={20} className={paymentMethod === "COD" ? "text-rose-gold shrink-0" : "text-brown/40 shrink-0"} />
                  <div>
                    <p className="text-sm font-semibold text-brown-dark">Cash on Delivery</p>
                    <p className="text-xs text-brown/50 mt-0.5">Pay when you collect</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("RAZORPAY")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition ${
                    paymentMethod === "RAZORPAY"
                      ? "border-rose-gold bg-blush/40"
                      : "border-blush bg-white hover:border-rose-gold/50"
                  }`}
                >
                  <Banknote size={20} className={paymentMethod === "RAZORPAY" ? "text-rose-gold shrink-0" : "text-brown/40 shrink-0"} />
                  <div>
                    <p className="text-sm font-semibold text-brown-dark">Pay Online</p>
                    <p className="text-xs text-brown/50 mt-0.5">UPI, Card, Net Banking</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* ── Right: order summary + submit ── */}
          <div className="space-y-4">
            <div className="bg-white border border-blush rounded-2xl p-6">
              <h2 className="font-semibold text-brown-dark mb-4">
                Order Summary{" "}
                <span className="font-normal text-sm text-brown/50">
                  ({items.length} {items.length === 1 ? "item" : "items"})
                </span>
              </h2>

              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-blush/40 border border-blush shrink-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          width={56}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-rose-gold-light text-xl">
                          ✦
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-brown-dark line-clamp-1">
                        {item.productName}
                      </p>
                      {item.variantLabel && (
                        <p className="text-[10px] text-brown/50">{item.variantLabel}</p>
                      )}
                      <p className="text-[10px] text-brown/50">
                        {item.metalName} · {item.purity}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] text-brown/40">Qty: {item.quantity}</p>
                        <p className="text-xs font-bold text-rose-gold">
                          {formatPrice(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-blush pt-4 space-y-2">
                <div className="flex justify-between text-sm text-brown/60">
                  <span>Subtotal (excl. GST)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-brown/60">
                  <span>GST</span>
                  <span>{formatPrice(gstAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-brown-dark border-t border-blush pt-2 mt-1">
                  <span>Total</span>
                  <span className="text-rose-gold">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Price note */}
            <p className="text-xs text-brown/40 leading-relaxed px-1">
              Prices calculated at today&apos;s live metal rate. Final amount confirmed at order time.
            </p>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-600 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 bg-rose-gold hover:bg-rose-gold-dark disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-full text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {isVerifying ? "Verifying Payment…" : "Processing…"}
                </>
              ) : paymentMethod === "COD" ? (
                <>
                  Place Order
                  <ChevronRight size={16} />
                </>
              ) : (
                <>
                  Pay {formatPrice(totalAmount)} Online
                  <ChevronRight size={16} />
                </>
              )}
            </button>

            {paymentMethod === "COD" && (
              <p className="text-center text-xs text-brown/40">
                You&apos;ll pay in cash when your order arrives
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
