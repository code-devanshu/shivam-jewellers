"use server";

import { getProductsPage, PRODUCTS_PAGE_SIZE } from "@/lib/data";

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
