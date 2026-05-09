import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategories, getMetals, getProducts, getCurrentRates } from "@/lib/data";
import ProductCard from "@/components/store/ProductCard";

type SearchParams = {
  category?: string;
  metal?: string;
  featured?: string;
  q?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({ searchParams }: Props) {
  const params = await searchParams;
  const title = params.category
    ? params.category.charAt(0).toUpperCase() + params.category.slice(1)
    : "All Jewellery";
  return { title };
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;

  const [categories, metals, rates, products] = await Promise.all([
    getCategories(),
    getMetals(),
    getCurrentRates(),
    getProducts({
      categorySlug: params.category,
      metalId: params.metal,
      featured: params.featured === "true",
      query: params.q,
    }),
  ]);

  const rateMap = Object.fromEntries(rates.map((r) => [r.metalId, r.ratePerGram]));
  const activeCategory = categories.find((c) => c.slug === params.category);
  const activeMetal = metals.find((m) => m.id === params.metal);

  const buildUrl = (overrides: Partial<SearchParams>) => {
    const merged = { ...params, ...overrides };
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(merged).filter(([, v]) => v !== undefined && v !== "")
      ) as Record<string, string>
    ).toString();
    return `/products${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-brown/50 mb-4">
        <Link href="/" className="hover:text-rose-gold transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-rose-gold transition-colors">
          Products
        </Link>
        {activeCategory && (
          <>
            <span>/</span>
            <span className="text-brown-dark">{activeCategory.name}</span>
          </>
        )}
      </nav>

      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-brown-dark">
          {params.q
            ? `Results for "${params.q}"`
            : activeCategory?.name ?? "All Jewellery"}
        </h1>
        <p className="text-sm text-brown/50 mt-1">{products.length} products</p>
      </div>

      <div className="flex gap-8">
        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside className="hidden md:block w-52 shrink-0 space-y-7">
          {/* Category filter */}
          <div>
            <h3 className="text-xs font-semibold text-brown-dark uppercase tracking-widest mb-3">
              Category
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href={buildUrl({ category: undefined })}
                  className={`block text-sm px-2 py-1 rounded transition-colors ${
                    !params.category
                      ? "text-rose-gold font-medium bg-blush"
                      : "text-brown/70 hover:text-rose-gold"
                  }`}
                >
                  All
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={buildUrl({ category: cat.slug })}
                    className={`block text-sm px-2 py-1 rounded transition-colors ${
                      params.category === cat.slug
                        ? "text-rose-gold font-medium bg-blush"
                        : "text-brown/70 hover:text-rose-gold"
                    }`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Metal filter */}
          <div>
            <h3 className="text-xs font-semibold text-brown-dark uppercase tracking-widest mb-3">
              Metal
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href={buildUrl({ metal: undefined })}
                  className={`block text-sm px-2 py-1 rounded transition-colors ${
                    !params.metal
                      ? "text-rose-gold font-medium bg-blush"
                      : "text-brown/70 hover:text-rose-gold"
                  }`}
                >
                  All
                </Link>
              </li>
              {metals.map((metal) => (
                <li key={metal.id}>
                  <Link
                    href={buildUrl({ metal: metal.id })}
                    className={`block text-sm px-2 py-1 rounded transition-colors ${
                      params.metal === metal.id
                        ? "text-rose-gold font-medium bg-blush"
                        : "text-brown/70 hover:text-rose-gold"
                    }`}
                  >
                    {metal.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Product grid ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Active filter pills */}
          {(activeCategory || activeMetal || params.q) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {params.q && (
                <Link
                  href={buildUrl({ q: undefined } as Partial<SearchParams>)}
                  className="inline-flex items-center gap-1.5 text-xs bg-blush text-rose-gold-dark px-3 py-1 rounded-full border border-rose-gold-light/40 hover:bg-blush/60 transition-colors"
                >
                  &ldquo;{params.q}&rdquo; ✕
                </Link>
              )}
              {activeCategory && (
                <Link
                  href={buildUrl({ category: undefined })}
                  className="inline-flex items-center gap-1.5 text-xs bg-blush text-rose-gold-dark px-3 py-1 rounded-full border border-rose-gold-light/40 hover:bg-blush/60 transition-colors"
                >
                  {activeCategory.name} ✕
                </Link>
              )}
              {activeMetal && (
                <Link
                  href={buildUrl({ metal: undefined })}
                  className="inline-flex items-center gap-1.5 text-xs bg-blush text-rose-gold-dark px-3 py-1 rounded-full border border-rose-gold-light/40 hover:bg-blush/60 transition-colors"
                >
                  {activeMetal.name} ✕
                </Link>
              )}
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-24 text-brown/40">
              <div className="text-5xl mb-4">✦</div>
              <p className="text-lg font-medium mb-2">No products found</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-rose-gold hover:text-rose-gold-dark text-sm font-medium transition-colors"
              >
                Clear filters <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  ratePerGram={rateMap[product.metalId] ?? 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
