"use client";

import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import CheckoutStepper from "./CheckoutStepper";
import { CHECKOUT_STEPS } from "../steps";
import AddressDetails, { AddressFormValues } from "../steps/AddressDetails";
import ContactDetails, { ContactFormValues } from "../steps/ContactDetails";
import OrderDetails from "../steps/OrderDetails";
import PaymentDetails, { PaymentFormValues } from "../steps/PaymentDetails";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

const SESSION_KEY = "checkoutState";

type CheckoutState = {
  currentStep: number;
  contact: ContactFormValues;
  address: AddressFormValues;
  payment: PaymentFormValues;
};

export default function CheckoutForm() {
  const router = useRouter();
  const { items } = useCart();

  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    currentStep: 0,
    contact: {
      fullName: "",
      email: "",
      phone: "",
    },
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
    payment: {
      paymentMethod: "card",
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
      upiId: "",
      sameAsShipping: false,
      invoiceOrder: false,
    },
  });

  const [isFormValid, setIsFormValid] = useState(false);
  type StepFormInstance =
    | UseFormReturn<ContactFormValues>
    | UseFormReturn<AddressFormValues>
    | UseFormReturn<PaymentFormValues>;

  const [formInstance, setFormInstance] = useState<StepFormInstance | null>(
    null
  );

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCheckoutState(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(checkoutState));
  }, [checkoutState]);

  const handleBackClick = () => {
    setCheckoutState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  };

  const handleNextClick = () => {
    if (!formInstance) return;

    formInstance.handleSubmit((data) => {
      if (checkoutState.currentStep === 0) {
        setCheckoutState((prev) => ({
          ...prev,
          contact: data as ContactFormValues,
          currentStep: 1,
        }));
      } else if (checkoutState.currentStep === 1) {
        setCheckoutState((prev) => ({
          ...prev,
          address: data as AddressFormValues,
          currentStep: 2,
        }));
      } else if (checkoutState.currentStep === 3) {
        const paymentData = data as PaymentFormValues;
        setCheckoutState((prev) => ({
          ...prev,
          payment: paymentData,
        }));

        if (paymentData.invoiceOrder) {
          router.push("/invoice");
        }
      } else {
        setCheckoutState((prev) => ({
          ...prev,
          currentStep: prev.currentStep + 1,
        }));
      }
    })();
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <CheckoutStepper currentStep={checkoutState.currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-lg">
              <h2 className="text-2xl font-serif text-gray-800 mb-6 border-b-2 border-pink-500 w-fit pb-1">
                {CHECKOUT_STEPS[checkoutState.currentStep].label}
              </h2>

              {checkoutState.currentStep === 0 && (
                <ContactDetails
                  defaultValues={checkoutState.contact}
                  onFormInstanceReady={setFormInstance}
                  onValidChange={setIsFormValid}
                  onSubmit={() => {}}
                />
              )}

              {checkoutState.currentStep === 1 && (
                <AddressDetails
                  defaultValues={checkoutState.address}
                  onFormInstanceReady={setFormInstance}
                  onValidChange={setIsFormValid}
                  onSubmit={() => {}}
                />
              )}

              {checkoutState.currentStep === 2 && (
                <OrderDetails items={items} />
              )}

              {checkoutState.currentStep === 3 && (
                <PaymentDetails
                  defaultValues={checkoutState.payment}
                  onFormInstanceReady={setFormInstance}
                  onValidChange={setIsFormValid}
                  onSubmit={() => {}}
                />
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleBackClick}
                disabled={checkoutState.currentStep === 0}
                className="px-5 py-2 bg-gray-100 text-gray-500 rounded-full font-medium hover:bg-gray-200 disabled:opacity-50"
              >
                Back
              </button>

              <button
                onClick={handleNextClick}
                disabled={!isFormValid}
                className={`px-6 py-2 rounded-full font-semibold transition
                  ${
                    !isFormValid
                      ? "bg-gray-300 text-white cursor-not-allowed"
                      : "bg-pink-600 text-white hover:bg-pink-700"
                  }`}
              >
                {checkoutState.currentStep === 3 ? "Place Order" : "Next"}
              </button>
            </div>
          </div>

          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-6 sticky top-28">
              <h3 className="text-lg font-serif font-semibold text-gray-800 mb-4 border-b pb-2 border-pink-200">
                Order Summary
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </li>
                <li className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </li>
                <li className="flex justify-between font-semibold text-gray-800 border-t pt-2">
                  <span>Total</span>
                  <span>₹{subtotal}</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
