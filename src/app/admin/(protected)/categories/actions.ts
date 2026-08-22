"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/admin-auth";
import {
  storeAddCategory,
  storeUpdateCategory,
  storeDeleteCategory,
  storeGetAllCategories,
} from "@/lib/admin-store";
import { db } from "@/lib/db";

export type CategoryFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  return verifyAdminSession(session);
}

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
  if (!(await requireAdmin())) return { status: "error", message: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;
  const imageUrls: string[] = JSON.parse((formData.get("imageUrls") as string) || "[]");
  const order = parseInt(formData.get("order") as string) || 0;
  const showInNav = formData.get("showInNav") === "on";

  if (!name) return { status: "error", message: "Name is required." };

  const slug = slugify(name);
  const categories = await storeGetAllCategories();
  const existing = categories.find((c) => c.slug === slug);
  if (existing) return { status: "error", message: "A category with this name already exists." };

  await storeAddCategory({ id: `cat-${Date.now()}`, name, slug, description, imageUrl, imageUrls, order, showInNav });
  revalidateAll();

  return { status: "success", message: `Category "${name}" added.` };
}

export async function updateCategory(
  id: string,
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  if (!(await requireAdmin())) return { status: "error", message: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;
  const imageUrls: string[] = JSON.parse((formData.get("imageUrls") as string) || "[]");
  const order = parseInt(formData.get("order") as string) || 0;
  const slug = (formData.get("slug") as string)?.trim() || slugify(name);
  const showInNav = formData.get("showInNav") === "on";

  if (!name) return { status: "error", message: "Name is required." };

  await storeUpdateCategory(id, { name, slug, description, imageUrl, imageUrls, order, showInNav });
  revalidateAll();

  return { status: "success", message: `Category "${name}" updated.` };
}

export async function deleteCategory(formData: FormData): Promise<void> {
  if (!(await requireAdmin())) return;
  const id = formData.get("id") as string;
  if (!id) return;
  try {
    await storeDeleteCategory(id);
  } catch (err) {
    console.error("[categories] deleteCategory failed (likely still has products):", err);
    return;
  }
  revalidateAll();
}

export async function getCategoryProductImages(
  categoryId: string
): Promise<Array<{ url: string; productName: string }>> {
  if (!(await requireAdmin())) return [];
  const images = await db.productImage.findMany({
    where: { product: { categoryId } },
    include: { product: { select: { name: true } } },
    orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
    take: 60,
  });
  return images.map((img) => ({ url: img.url, productName: img.product.name }));
}
