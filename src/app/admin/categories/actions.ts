"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  storeAddCategory,
  storeUpdateCategory,
  storeDeleteCategory,
  storeGetAllCategories,
} from "@/lib/admin-store";

export type CategoryFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/, "");
}

function revalidateAll() {
  revalidateTag("categories", "max");
  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function createCategory(
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;
  const order = parseInt(formData.get("order") as string) || 0;
  const showInNav = formData.get("showInNav") === "on";

  if (!name) return { status: "error", message: "Name is required." };

  const slug = slugify(name);
  const categories = await storeGetAllCategories();
  const existing = categories.find((c) => c.slug === slug);
  if (existing) return { status: "error", message: "A category with this name already exists." };

  await storeAddCategory({ id: `cat-${Date.now()}`, name, slug, description, imageUrl, order, showInNav });
  revalidateAll();

  return { status: "success", message: `Category "${name}" added.` };
}

export async function updateCategory(
  id: string,
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;
  const order = parseInt(formData.get("order") as string) || 0;
  const slug = (formData.get("slug") as string)?.trim() || slugify(name);
  const showInNav = formData.get("showInNav") === "on";

  if (!name) return { status: "error", message: "Name is required." };

  await storeUpdateCategory(id, { name, slug, description, imageUrl, order, showInNav });
  revalidateAll();

  return { status: "success", message: `Category "${name}" updated.` };
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;
  await storeDeleteCategory(id);
  revalidateAll();
}
