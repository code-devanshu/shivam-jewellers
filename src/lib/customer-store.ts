import { db } from "./db";

// ── Cart ──────────────────────────────────────────────────────────────────────

export async function getCartItems(customerId: string) {
  const cart = await db.cart.findUnique({
    where: { customerId },
    include: {
      items: {
        include: { variant: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return cart?.items ?? [];
}

export async function getCartItemCount(customerId: string): Promise<number> {
  const cart = await db.cart.findUnique({
    where: { customerId },
    include: { items: { select: { quantity: true } } },
  });
  return cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
}

export async function upsertCartItem(
  customerId: string,
  productId: string,
  variantId: string | null,
  delta = 1
): Promise<void> {
  let cart = await db.cart.findUnique({ where: { customerId } });
  if (!cart) cart = await db.cart.create({ data: { customerId } });

  const existing = await db.cartItem.findFirst({
    where: { cartId: cart.id, productId, variantId },
  });

  if (existing) {
    const newQty = existing.quantity + delta;
    if (newQty <= 0) {
      await db.cartItem.delete({ where: { id: existing.id } });
    } else {
      await db.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty } });
    }
  } else if (delta > 0) {
    await db.cartItem.create({
      data: { cartId: cart.id, productId, variantId, quantity: delta },
    });
  }
}

export async function setCartItemQty(
  customerId: string,
  itemId: string,
  qty: number
): Promise<void> {
  const cart = await db.cart.findUnique({ where: { customerId } });
  if (!cart) return;
  if (qty <= 0) {
    await db.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
  } else {
    await db.cartItem.updateMany({ where: { id: itemId, cartId: cart.id }, data: { quantity: qty } });
  }
}

export async function deleteCartItem(customerId: string, itemId: string): Promise<void> {
  const cart = await db.cart.findUnique({ where: { customerId } });
  if (!cart) return;
  await db.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
}

// ── Wishlist ──────────────────────────────────────────────────────────────────

export async function getWishlistItemCount(customerId: string): Promise<number> {
  const wishlist = await db.wishlist.findUnique({
    where: { customerId },
    include: { items: { select: { id: true } } },
  });
  return wishlist?.items.length ?? 0;
}

export async function getWishlistedProductIds(customerId: string): Promise<string[]> {
  const wishlist = await db.wishlist.findUnique({
    where: { customerId },
    include: { items: { select: { productId: true } } },
  });
  return wishlist?.items.map((i) => i.productId) ?? [];
}

export async function getWishlistItems(customerId: string) {
  const wishlist = await db.wishlist.findUnique({
    where: { customerId },
    include: {
      items: {
        select: { id: true, productId: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return wishlist?.items ?? [];
}

export async function toggleWishlistItem(
  customerId: string,
  productId: string
): Promise<boolean> {
  let wishlist = await db.wishlist.findUnique({ where: { customerId } });
  if (!wishlist) wishlist = await db.wishlist.create({ data: { customerId } });

  const existing = await db.wishlistItem.findUnique({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
  });

  if (existing) {
    await db.wishlistItem.delete({ where: { id: existing.id } });
    return false;
  } else {
    await db.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } });
    return true;
  }
}

export async function removeWishlistItem(customerId: string, productId: string): Promise<void> {
  const wishlist = await db.wishlist.findUnique({ where: { customerId } });
  if (!wishlist) return;
  await db.wishlistItem.deleteMany({
    where: { wishlistId: wishlist.id, productId },
  });
}
