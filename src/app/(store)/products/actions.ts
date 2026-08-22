"use server";

import { getProductsPage, PRODUCTS_PAGE_SIZE, getAlsoPurchased, getCurrentRates } from "@/lib/data";
import type { Product } from "@/lib/types";

type Filters = {
  categorySlug?: string;
  metalId?: string;
  featured?: boolean;
  query?: string;
};

export async function loadMoreProducts(filters: Filters, page: number) {
  return getProductsPage(filters, {
    skip: page * PRODUCTS_PAGE_SIZE,
    take: PRODUCTS_PAGE_SIZE,
  });
}

export async function getFlyoutAlsoPurchased(
  productId: string
): Promise<{ products: Product[]; rateMap: Record<string, number> }> {
  const [products, rates] = await Promise.all([
    getAlsoPurchased(productId, 8),
    getCurrentRates(),
  ]);
  const rateMap = Object.fromEntries(rates.map((r) => [r.metalId, r.ratePerGram]));
  return { products, rateMap };
}
