export type Metal = {
  id: string;
  name: string;
  symbol: string;
};

export type MetalRate = {
  id: string;
  metalId: string;
  metal: Metal;
  ratePerGram: number;
  source: "AUTO" | "MANUAL";
  effectiveAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  order: number;
  showInNav: boolean;
};

export type ProductImage = {
  id: string;
  productId: string;
  url: string;
  publicId: string;
  isPrimary: boolean;
  order: number;
};

export type ProductVariant = {
  id: string;
  productId: string;
  size: string | null;
  gemstone: string | null;
  additionalPrice: number;
  stockQty: number;
  sku: string | null;
};

export type MakingChargeType = "PERCENT" | "FIXED";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string;
  category: Category;
  metalId: string;
  metal: Metal;
  purity: string;
  purityPercent: number;
  weightGrams: number;
  grossWeightGrams: number;
  makingChargeType: MakingChargeType;
  makingCharge: number;
  gstPercent: number;
  isAvailable: boolean;
  isFeatured: boolean;
  stockQty: number;
  images: ProductImage[];
  variants: ProductVariant[];
};

export type PriceBreakdown = {
  metalValue: number;
  makingAmount: number;
  basePrice: number;
  gstAmount: number;
  totalPrice: number;
};
