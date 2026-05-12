import { cache } from "react";
import { unstable_cache } from "next/cache";
import { mockMetals } from "./mock/data";
import type { Category, Metal, MetalRate, Product } from "./types";
import { getLiveRates } from "./live-rates";
import { storeGetAllProducts, storeGetAllCategories, storeGetProductBySlug, storeGetFeaturedProducts } from "./admin-store";

// ── Cross-request persistent caches ─────────────────────────────────────────
// Revalidated by tag whenever admin saves/deletes, so the store never serves stale data.

const _cachedCategories = unstable_cache(storeGetAllCategories, ["categories"], {
  tags: ["categories"],
});

const _cachedProducts = unstable_cache(storeGetAllProducts, ["products"], {
  tags: ["products"],
});

// ── Per-request deduplication ────────────────────────────────────────────────
// React.cache() ensures that even if layout + page both call getCategories(),
// the underlying cache is only consulted once per request.

export const getCategories = cache(_cachedCategories);
export const getAllProducts = cache(_cachedProducts);
const _cachedProductBySlug = unstable_cache(storeGetProductBySlug, ["product-by-slug"], {
  tags: ["products"],
});
export const getProductBySlug = cache(_cachedProductBySlug);

const _cachedFeaturedProducts = unstable_cache(storeGetFeaturedProducts, ["featured-products"], {
  tags: ["products"],
});
export const getFeaturedProducts = cache(_cachedFeaturedProducts);

// getLiveRates uses fetch() with next: { revalidate: 3600 } internally,
// so cross-request caching is already handled. We just deduplicate per-request.
export const getCurrentRates = cache(getLiveRates);

export async function getMetals(): Promise<Metal[]> {
  return mockMetals;
}

type ProductFilters = {
  categorySlug?: string;
  metalId?: string;
  featured?: boolean;
  query?: string;
};

export const getProducts = cache(async (filters?: ProductFilters): Promise<Product[]> => {
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);
  let list = products.filter((p) => p.isAvailable);

  if (filters?.categorySlug) {
    const cat = categories.find((c) => c.slug === filters.categorySlug);
    if (cat) list = list.filter((p) => p.categoryId === cat.id);
  }
  if (filters?.metalId) {
    list = list.filter((p) => p.metalId === filters.metalId);
  }
  if (filters?.featured) {
    list = list.filter((p) => p.isFeatured);
  }
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.name.toLowerCase().includes(q) ||
        p.metal.name.toLowerCase().includes(q)
    );
  }
  return list;
});
