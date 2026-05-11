"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  storeAddProduct,
  storeUpdateProduct,
  storeDeleteProduct,
  storeGetAllCategories,
} from "@/lib/admin-store";
import { mockMetals } from "@/lib/mock/data";
import type { MakingChargeType } from "@/lib/types";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/, "");
}

export type ProductFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim() || slugify(name);
  const categoryId = formData.get("categoryId") as string;
  const metalId = formData.get("metalId") as string;
  const purity = (formData.get("purity") as string)?.trim();
  const purityPercent = parseFloat(formData.get("purityPercent") as string) / 100;
  const weightGrams = parseFloat(formData.get("weightGrams") as string);
  const grossWeightGrams = parseFloat(formData.get("grossWeightGrams") as string);
  const makingChargeType = (formData.get("makingChargeType") as MakingChargeType) ?? "PERCENT";
  const makingCharge = parseFloat(formData.get("makingCharge") as string);
  const gstPercent = parseFloat(formData.get("gstPercent") as string) || 3;
  const description = (formData.get("description") as string)?.trim() || null;
  const imageUrls = (formData.getAll("images[]") as string[]).filter(Boolean);
  const sizeValues = (formData.getAll("sizes[]") as string[]).filter(Boolean);
  const stockQty = parseInt(formData.get("stockQty") as string) || 0;
  const isAvailable = formData.get("isAvailable") === "on";
  const isFeatured = formData.get("isFeatured") === "on";

  if (!name || !categoryId || !metalId || !purity || isNaN(purityPercent) || isNaN(weightGrams) || isNaN(makingCharge)) {
    return { status: "error", message: "Please fill in all required fields." };
  }

  const categories = await storeGetAllCategories();
  const category = categories.find((c) => c.id === categoryId);
  const metal = mockMetals.find((m) => m.id === metalId);

  if (!category || !metal) {
    return { status: "error", message: "Invalid category or metal." };
  }

  const ts = Date.now();
  await storeAddProduct({
    id: `product-${ts}`,
    name,
    slug,
    description,
    categoryId,
    category,
    metalId,
    metal,
    purity,
    purityPercent,
    weightGrams,
    grossWeightGrams: grossWeightGrams || weightGrams,
    makingChargeType,
    makingCharge,
    gstPercent,
    isAvailable,
    isFeatured,
    stockQty,
    images: imageUrls.map((url, i) => ({
      id: `img-${ts}-${i}`,
      productId: "",
      url,
      publicId: "",
      isPrimary: i === 0,
      order: i,
    })),
    variants: sizeValues.map((size, i) => ({
      id: `var-${ts}-${i}`,
      productId: "",
      size,
      gemstone: null,
      additionalPrice: 0,
      stockQty: 1,
      sku: null,
    })),
  });

  revalidateTag("products", "max");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");

  return { status: "success", message: `"${name}" added successfully.` };
}

export async function updateProduct(
  id: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim() || slugify(name);
  const categoryId = formData.get("categoryId") as string;
  const metalId = formData.get("metalId") as string;
  const purity = (formData.get("purity") as string)?.trim();
  const purityPercent = parseFloat(formData.get("purityPercent") as string) / 100;
  const weightGrams = parseFloat(formData.get("weightGrams") as string);
  const grossWeightGrams = parseFloat(formData.get("grossWeightGrams") as string);
  const makingChargeType = (formData.get("makingChargeType") as MakingChargeType) ?? "PERCENT";
  const makingCharge = parseFloat(formData.get("makingCharge") as string);
  const gstPercent = parseFloat(formData.get("gstPercent") as string) || 3;
  const description = (formData.get("description") as string)?.trim() || null;
  const imageUrls = (formData.getAll("images[]") as string[]).filter(Boolean);
  const sizeValues = (formData.getAll("sizes[]") as string[]).filter(Boolean);
  const stockQty = parseInt(formData.get("stockQty") as string) || 0;
  const isAvailable = formData.get("isAvailable") === "on";
  const isFeatured = formData.get("isFeatured") === "on";

  if (!name || !categoryId || !metalId || !purity || isNaN(purityPercent) || isNaN(weightGrams) || isNaN(makingCharge)) {
    return { status: "error", message: "Please fill in all required fields." };
  }

  const categories = await storeGetAllCategories();
  const category = categories.find((c) => c.id === categoryId);
  const metal = mockMetals.find((m) => m.id === metalId);

  if (!category || !metal) {
    return { status: "error", message: "Invalid category or metal." };
  }

  const ts = Date.now();
  await storeUpdateProduct(id, {
    name, slug, description, categoryId, category, metalId, metal, purity, purityPercent,
    weightGrams, grossWeightGrams: grossWeightGrams || weightGrams, makingChargeType,
    makingCharge, gstPercent, isAvailable, isFeatured, stockQty,
    images: imageUrls.map((url, i) => ({
      id: `img-${ts}-${i}`,
      productId: id,
      url,
      publicId: "",
      isPrimary: i === 0,
      order: i,
    })),
    variants: sizeValues.map((size, i) => ({
      id: `var-${ts}-${i}`,
      productId: id,
      size,
      gemstone: null,
      additionalPrice: 0,
      stockQty: 1,
      sku: null,
    })),
  });

  revalidateTag("products", "max");
  revalidatePath("/admin/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/products");

  return { status: "success", message: `"${name}" updated successfully.` };
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;
  await storeDeleteProduct(id);
  revalidateTag("products", "max");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}
