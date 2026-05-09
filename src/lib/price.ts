import type { Product, PriceBreakdown } from "./types";

type PriceInput = Pick<
  Product,
  "purityPercent" | "weightGrams" | "makingChargeType" | "makingCharge" | "gstPercent"
>;

export function calculatePrice(
  product: PriceInput,
  ratePerGram: number,
  additionalPrice = 0
): PriceBreakdown {
  const metalValue = ratePerGram * product.weightGrams * product.purityPercent;
  const makingAmount =
    product.makingChargeType === "PERCENT"
      ? metalValue * (product.makingCharge / 100)
      : product.makingCharge;
  const basePrice = metalValue + makingAmount + additionalPrice;
  const gstAmount = basePrice * (product.gstPercent / 100);
  const totalPrice = basePrice + gstAmount;

  return {
    metalValue: Math.round(metalValue),
    makingAmount: Math.round(makingAmount),
    basePrice: Math.round(basePrice),
    gstAmount: Math.round(gstAmount),
    totalPrice: Math.round(totalPrice),
  };
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
