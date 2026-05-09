"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-auth";
import { toggleWishlistItem, removeWishlistItem } from "@/lib/customer-store";

export async function toggleWishlist(productId: string): Promise<boolean> {
  const customerId = await getCustomerSession();
  if (!customerId) redirect("/auth");
  const newState = await toggleWishlistItem(customerId, productId);
  revalidatePath("/wishlist");
  return newState;
}

export async function removeFromWishlist(productId: string): Promise<void> {
  const customerId = await getCustomerSession();
  if (!customerId) return;
  await removeWishlistItem(customerId, productId);
  revalidatePath("/wishlist");
}
