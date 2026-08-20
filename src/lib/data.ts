import { cache } from "react";
import { unstable_cache } from "next/cache";
import { mockMetals } from "./mock/data";
import type { Banner, Category, Metal, MetalRate, Product } from "./types";
import { getLiveRates } from "./live-rates";
import {
  storeGetAllProducts,
  storeGetAllCategories,
  storeGetActiveBanners,
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

const _cachedActiveBanners = unstable_cache(
  storeGetActiveBanners,
  ["active-banners"],
  {
    tags: ["banners"],
  },
);

// ── Per-request deduplication ────────────────────────────────────────────────
// React.cache() ensures that even if layout + page both call getCategories(),
// the underlying cache is only consulted once per request.

export const getCategories = cache(_cachedCategories);
export const getAllProducts = cache(_cachedProducts);
export const getActiveBanners = cache(_cachedActiveBanners);
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

const _cachedProductsPage = unstable_cache(storeGetProductsPage, ["products-page"], {
  tags: ["products"],
});

export async function getProductsPage(
  filters: ProductFilters | undefined,
  pagination: { skip: number; take: number },
): Promise<{ products: Product[]; hasMore: boolean }> {
  const categories = await getCategories();
  const category = filters?.categorySlug
    ? categories.find((c) => c.slug === filters.categorySlug)
    : undefined;

  return _cachedProductsPage(
    {
      categoryId: category?.id,
      metalId: filters?.metalId,
      featured: filters?.featured,
      query: filters?.query,
    },
    pagination,
  );
}
