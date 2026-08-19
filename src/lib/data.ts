import { cache } from "react";
import { unstable_cache } from "next/cache";
import { mockMetals } from "./mock/data";
import type { Category, Metal, MetalRate, Product } from "./types";
import { getLiveRates } from "./live-rates";
import {
  storeGetAllProducts,
  storeGetAllCategories,
  storeGetProductBySlug,
  storeGetFeaturedProducts,
  storeGetProductsPage,
} from "./admin-store";

// ── Cross-request persistent caches ─────────────────────────────────────────
// Revalidated by tag whenever admin saves/deletes, so the store never serves stale data.

const _cachedCategories = unstable_cache(
  storeGetAllCategories,
  ["categories"],
  {
    tags: ["categories"],
  },
);

const _cachedProducts = unstable_cache(storeGetAllProducts, ["products"], {
  tags: ["products"],
});

// ── Per-request deduplication ────────────────────────────────────────────────
// React.cache() ensures that even if layout + page both call getCategories(),
// the underlying cache is only consulted once per request.

export const getCategories = cache(_cachedCategories);
export const getAllProducts = cache(_cachedProducts);
const _cachedProductBySlug = unstable_cache(
  storeGetProductBySlug,
  ["product-by-slug"],
  {
    tags: ["products"],
  },
);
export const getProductBySlug = cache(_cachedProductBySlug);

const _cachedFeaturedProducts = unstable_cache(
  storeGetFeaturedProducts,
  ["featured-products"],
  {
    tags: ["products"],
  },
);
export const getFeaturedProducts = cache(_cachedFeaturedProducts);

// Rate overrides/live rates hit the DB (up to 4 round-trips) on every call.
// Cache cross-request for 60s; admin rate changes call revalidateTag("rates").
const _cachedRates = unstable_cache(getLiveRates, ["current-rates"], {
  tags: ["rates"],
  revalidate: 60,
});
export const getCurrentRates = cache(_cachedRates);

export async function getMetals(): Promise<Metal[]> {
  return mockMetals;
}

type ProductFilters = {
  categorySlug?: string;
  metalId?: string;
  featured?: boolean;
  query?: string;
};

export const PRODUCTS_PAGE_SIZE = 6;

export async function getProductsPage(
  filters: ProductFilters | undefined,
  pagination: { skip: number; take: number },
): Promise<{ products: Product[]; hasMore: boolean }> {
  const categories = await getCategories();
  const category = filters?.categorySlug
    ? categories.find((c) => c.slug === filters.categorySlug)
    : undefined;

  return storeGetProductsPage(
    {
      categoryId: category?.id,
      metalId: filters?.metalId,
      featured: filters?.featured,
      query: filters?.query,
    },
    pagination,
  );
}
