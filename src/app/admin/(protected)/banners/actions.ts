"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/admin-auth";
import {
  storeAddBanner,
  storeUpdateBanner,
  storeDeleteBanner,
} from "@/lib/admin-store";

export type BannerFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  return verifyAdminSession(session);
}

function revalidateAll() {
  revalidateTag("banners", "max");
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function createBanner(
  _prev: BannerFormState,
  formData: FormData
): Promise<BannerFormState> {
  if (!(await requireAdmin())) return { status: "error", message: "Unauthorized" };

  const imageUrl = (formData.get("imageUrl") as string)?.trim();
  const title = (formData.get("title") as string)?.trim() || null;
  const linkUrl = (formData.get("linkUrl") as string)?.trim() || null;
  const order = parseInt(formData.get("order") as string) || 0;
  const isActive = formData.get("isActive") === "on";

  if (!imageUrl) return { status: "error", message: "An image is required." };

  await storeAddBanner({ id: `banner-${Date.now()}`, imageUrl, title, linkUrl, order, isActive });
  revalidateAll();

  return { status: "success", message: "Banner added." };
}

export async function updateBanner(
  id: string,
  _prev: BannerFormState,
  formData: FormData
): Promise<BannerFormState> {
  if (!(await requireAdmin())) return { status: "error", message: "Unauthorized" };

  const imageUrl = (formData.get("imageUrl") as string)?.trim();
  const title = (formData.get("title") as string)?.trim() || null;
  const linkUrl = (formData.get("linkUrl") as string)?.trim() || null;
  const order = parseInt(formData.get("order") as string) || 0;
  const isActive = formData.get("isActive") === "on";

  if (!imageUrl) return { status: "error", message: "An image is required." };

  await storeUpdateBanner(id, { imageUrl, title, linkUrl, order, isActive });
  revalidateAll();

  return { status: "success", message: "Banner updated." };
}

export async function deleteBanner(formData: FormData): Promise<void> {
  if (!(await requireAdmin())) return;
  const id = formData.get("id") as string;
  if (!id) return;
  await storeDeleteBanner(id);
  revalidateAll();
}

export async function toggleBannerActive(id: string, isActive: boolean): Promise<void> {
  if (!(await requireAdmin())) return;
  await storeUpdateBanner(id, { isActive });
  revalidateAll();
}
