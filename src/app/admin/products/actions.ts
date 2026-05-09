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
  const imageUrl = (formData.get("imageUrl") as string)?.trim();
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

  await storeAddProduct({
    id: `product-${Date.now()}`,
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
    images: imageUrl
      ? [{ id: `img-${Date.now()}`, productId: "", url: imageUrl, publicId: "", isPrimary: true, order: 0 }]
      : [],
    variants: [],
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
  const imageUrl = (formData.get("imageUrl") as string)?.trim();
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

  await storeUpdateProduct(id, {
    name, slug, description, categoryId, category, metalId, metal, purity, purityPercent,
    weightGrams, grossWeightGrams: grossWeightGrams || weightGrams, makingChargeType,
    makingCharge, gstPercent, isAvailable, isFeatured, stockQty,
    ...(imageUrl && {
      images: [{ id: `img-${Date.now()}`, productId: id, url: imageUrl, publicId: "", isPrimary: true, order: 0 }],
    }),
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
