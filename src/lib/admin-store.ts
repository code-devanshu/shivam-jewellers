import { db } from "./db";
import type { Product, Category } from "./types";

// ── Products ─────────────────────────────────────────────────────────────────

export async function storeGetAllProducts(): Promise<Product[]> {
  const rows = await db.product.findMany({
    include: { category: true, metal: true, images: true, variants: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapProduct);
}

export async function storeGetProductBySlug(slug: string): Promise<Product | null> {
  const row = await db.product.findUnique({
    where: { slug },
    include: { category: true, metal: true, images: true, variants: true },
  });
  return row ? mapProduct(row) : null;
}

export async function storeAddProduct(product: Product): Promise<void> {
  await db.product.create({
    data: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      categoryId: product.categoryId,
      metalId: product.metalId,
      purity: product.purity,
      purityPercent: product.purityPercent,
      weightGrams: product.weightGrams,
      grossWeightGrams: product.grossWeightGrams,
      makingChargeType: product.makingChargeType,
      makingCharge: product.makingCharge,
      gstPercent: product.gstPercent,
      isAvailable: product.isAvailable,
      isFeatured: product.isFeatured,
      stockQty: product.stockQty,
      images: product.images.length
        ? {
            create: product.images.map((img) => ({
              id: img.id,
              url: img.url,
              publicId: img.publicId,
              isPrimary: img.isPrimary,
              order: img.order,
            })),
          }
        : undefined,
    },
  });
}

export async function storeUpdateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const { images, variants, category, metal, ...scalar } = updates;
  await db.product.update({
    where: { id },
    data: {
      ...scalar,
      ...(images && {
        images: {
          deleteMany: {},
          create: images.map((img) => ({
            id: img.id,
            url: img.url,
            publicId: img.publicId,
            isPrimary: img.isPrimary,
            order: img.order,
          })),
        },
      }),
    },
  });
}

export async function storeDeleteProduct(id: string): Promise<void> {
  await db.product.delete({ where: { id } });
}

// ── Categories ───────────────────────────────────────────────────────────────

export async function storeGetAllCategories(): Promise<Category[]> {
  const rows = await db.category.findMany({ orderBy: { order: "asc" } });
  return rows.map(mapCategory);
}

export async function storeAddCategory(category: Category): Promise<void> {
  await db.category.create({
    data: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      order: category.order,
      showInNav: category.showInNav,
    },
  });
}

export async function storeUpdateCategory(id: string, updates: Partial<Category>): Promise<void> {
  await db.category.update({ where: { id }, data: updates });
}

export async function storeDeleteCategory(id: string): Promise<void> {
  await db.category.delete({ where: { id } });
}

// ── Rate Overrides (still in-memory — DB rates via MetalRate table later) ────

const _rateOverrides = new Map<string, { ratePerGram: number; setAt: string }>();

export function storeSetRateOverride(metalId: string, ratePerGram: number): void {
  _rateOverrides.set(metalId, { ratePerGram, setAt: new Date().toISOString() });
}

export function storeGetRateOverride(metalId: string) {
  return _rateOverrides.get(metalId);
}

export function storeClearRateOverride(metalId: string): void {
  _rateOverrides.delete(metalId);
}

// ── Mappers ───────────────────────────────────────────────────────────────────

type DbProduct = Awaited<ReturnType<typeof db.product.findMany>>[number];
type DbCategory = Awaited<ReturnType<typeof db.category.findMany>>[number];

function mapProduct(row: DbProduct & { category: DbCategory; metal: { id: string; name: string; symbol: string }; images: { id: string; productId: string; url: string; publicId: string; isPrimary: boolean; order: number }[]; variants: { id: string; productId: string; size: string | null; gemstone: string | null; additionalPrice: unknown; stockQty: number; sku: string | null }[] }): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    categoryId: row.categoryId,
    category: mapCategory(row.category),
    metalId: row.metalId,
    metal: { id: row.metal.id, name: row.metal.name, symbol: row.metal.symbol },
    purity: row.purity,
    purityPercent: Number(row.purityPercent),
    weightGrams: Number(row.weightGrams),
    grossWeightGrams: Number(row.grossWeightGrams),
    makingChargeType: row.makingChargeType as "PERCENT" | "FIXED",
    makingCharge: Number(row.makingCharge),
    gstPercent: Number(row.gstPercent),
    isAvailable: row.isAvailable,
    isFeatured: row.isFeatured,
    stockQty: row.stockQty,
    images: row.images.map((img) => ({
      id: img.id,
      productId: img.productId,
      url: img.url,
      publicId: img.publicId,
      isPrimary: img.isPrimary,
      order: img.order,
    })),
    variants: row.variants.map((v) => ({
      id: v.id,
      productId: v.productId,
      size: v.size,
      gemstone: v.gemstone,
      additionalPrice: Number(v.additionalPrice),
      stockQty: v.stockQty,
      sku: v.sku,
    })),
  };
}

function mapCategory(row: DbCategory): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.imageUrl,
    order: row.order,
    showInNav: row.showInNav,
  };
}
