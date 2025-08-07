"use client";

import { z } from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const PaymentSchema = z.object({
  paymentMethod: z.enum(["card", "upi", "cod", "netbanking"]),
  cardName: z.string().optional(),
  cardNumber: z.string().optional(),
  expiry: z.string().optional(),
  cvv: z.string().optional(),
  upiId: z.string().optional(),
  sameAsShipping: z.boolean().optional(),
  invoiceOrder: z.boolean().optional(),
});

export type PaymentFormValues = z.infer<typeof PaymentSchema>;

type Props = {
  defaultValues: PaymentFormValues;
  onValidChange: (valid: boolean) => void;
  onFormInstanceReady: (
    methods: ReturnType<typeof useForm<PaymentFormValues>>
  ) => void;
  onSubmit: () => void;
};

export default function PaymentDetails({
  defaultValues,
  onFormInstanceReady,
  onValidChange,
  onSubmit,
}: Props) {
  const methods = useForm<PaymentFormValues>({
    resolver: zodResolver(PaymentSchema),
    defaultValues,
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = methods;

  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    onValidChange(isValid);
  }, [isValid]);

  useEffect(() => {
    onFormInstanceReady(methods);
  }, []);

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const formatExpiry = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
    if (digitsOnly.length < 3) return digitsOnly;
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
  };

  const formatCVV = (value: string) => value.replace(/\D/g, "").slice(0, 3);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Payment Method Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold mb-1">
          Select Payment Method
        </label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input type="radio" value="card" {...register("paymentMethod")} />{" "}
            Credit/Debit Card
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="upi" {...register("paymentMethod")} />{" "}
            UPI
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="cod" {...register("paymentMethod")} />{" "}
            Cash on Delivery
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="netbanking"
              {...register("paymentMethod")}
            />{" "}
            Net Banking
          </label>
        </div>
      </div>

      {/* Card Payment Fields */}
      {paymentMethod === "card" && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">
              Cardholder Name
            </label>
            <input
              {...register("cardName")}
              className="w-full border rounded px-3 py-2"
            />
            {errors.cardName && (
              <p className="text-sm text-red-500">{errors.cardName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Card Number
            </label>
            <input
              {...register("cardNumber")}
              inputMode="numeric"
              maxLength={19}
              value={watch("cardNumber") || ""}
              onChange={(e) =>
                setValue("cardNumber", formatCardNumber(e.target.value))
              }
              className="w-full border rounded px-3 py-2"
            />
            {errors.cardNumber && (
              <p className="text-sm text-red-500">
                {errors.cardNumber.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Expiry (MM/YY)
              </label>
              <input
                {...register("expiry")}
                maxLength={5}
                value={watch("expiry") || ""}
                onChange={(e) =>
                  setValue("expiry", formatExpiry(e.target.value))
                }
                placeholder="MM/YY"
                className="w-full border rounded px-3 py-2"
              />
              {errors.expiry && (
                <p className="text-sm text-red-500">{errors.expiry.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">CVV</label>
              <input
                {...register("cvv")}
                inputMode="numeric"
                maxLength={3}
                type="password"
                value={watch("cvv") || ""}
                onChange={(e) => setValue("cvv", formatCVV(e.target.value))}
                className="w-full border rounded px-3 py-2"
              />
              {errors.cvv && (
                <p className="text-sm text-red-500">{errors.cvv.message}</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* UPI Fields */}
      {paymentMethod === "upi" && (
        <div>
          <label className="block text-sm font-medium mb-1">UPI ID</label>
          <input
            {...register("upiId")}
            className="w-full border rounded px-3 py-2"
          />
          {errors.upiId && (
            <p className="text-sm text-red-500">{errors.upiId.message}</p>
          )}
        </div>
      )}

      {/* Same as Shipping (only for card & cod) */}
      {(paymentMethod === "card" || paymentMethod === "cod") && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register("sameAsShipping")}
            className="w-4 h-4"
          />
          <label className="text-sm">Billing address is same as shipping</label>
        </div>
      )}

      {/* Invoice Option */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          {...register("invoiceOrder")}
          className="w-4 h-4"
        />
        <label className="text-sm">Generate Invoice for this order</label>
      </div>
    </form>
  );
}
