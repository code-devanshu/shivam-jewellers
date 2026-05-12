"use server";

import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { BillItemType, BillPaymentMethod, MakingChargeType } from "@prisma/client";

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!verifyAdminSession(session)) throw new Error("Unauthorized");
}

async function nextBillNumber(): Promise<string> {
  const count = await db.bill.count();
  const year = new Date().getFullYear();
  return `SJ-BILL-${year}-${String(count + 1).padStart(3, "0")}`;
}

export type BillItemInput = {
  type: BillItemType;
  productId?: string;
  productName: string;
  variantLabel?: string;
  metalName?: string;
  purity?: string;
  weightGrams?: number;
  metalRate?: number;
  makingCharge?: number;
  makingChargeType?: MakingChargeType;
  hsnCode?: string;
  gstPercent?: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type CreateBillInput = {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: BillItemInput[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  initialPaymentAmount?: number;
  initialPaymentMethod?: BillPaymentMethod;
  initialPaymentNote?: string;
  notes?: string;
};

export async function createBill(
  input: CreateBillInput
): Promise<{ id: string } | { error: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  const billNumber = await nextBillNumber();
  const amountPaid = input.initialPaymentAmount ?? 0;
  const balanceDue = input.totalAmount - amountPaid;
  const status =
    balanceDue <= 0 ? "PAID" : amountPaid > 0 ? "PARTIAL" : "UNPAID";

  // For walk-in customers with a phone or email, find or create a Customer
  // record so they appear in future "Search Existing" lookups.
  // We look up by phone first, then email — each field is unique so we must
  // not include a field in the create payload if it might already belong to
  // a different customer.
  let resolvedCustomerId = input.customerId || null;
  if (!resolvedCustomerId && (input.customerPhone || input.customerEmail)) {
    let existing: { id: string } | null = null;

    if (input.customerPhone) {
      existing = await db.customer.findUnique({
        where: { phone: input.customerPhone },
        select: { id: true },
      });
    }
    if (!existing && input.customerEmail) {
      // findFirst avoids the strict unique-key typing issue with nullable emails
      existing = await db.customer.findFirst({
        where: { email: input.customerEmail },
        select: { id: true },
      });
    }

    if (existing) {
      resolvedCustomerId = existing.id;
      if (input.customerName) {
        await db.customer.update({
          where: { id: existing.id },
          data: { name: input.customerName },
        });
      }
    } else {
      const newCustomer = await db.customer.create({
        data: {
          id: crypto.randomUUID(),
          name: input.customerName ?? null,
          phone: input.customerPhone ?? null,
          email: input.customerEmail ?? null,
        },
        select: { id: true },
      });
      resolvedCustomerId = newCustomer.id;
    }
  }

  const bill = await db.$transaction(async (tx) => {
    const b = await tx.bill.create({
      data: {
        billNumber,
        customerId: resolvedCustomerId,
        customerName: resolvedCustomerId ? null : (input.customerName || null),
        customerPhone: resolvedCustomerId ? null : (input.customerPhone || null),
        customerEmail: resolvedCustomerId ? null : (input.customerEmail || null),
        subtotal: input.subtotal,
        gstAmount: input.gstAmount,
        totalAmount: input.totalAmount,
        amountPaid,
        balanceDue,
        status,
        notes: input.notes || null,
        items: {
          create: input.items.map((item) => ({
            type: item.type,
            productId: item.productId || null,
            productName: item.productName,
            variantLabel: item.variantLabel || null,
            metalName: item.metalName || null,
            purity: item.purity || null,
            weightGrams: item.weightGrams ?? null,
            metalRate: item.metalRate ?? null,
            makingCharge: item.makingCharge ?? null,
            makingChargeType: item.makingChargeType || null,
            hsnCode: item.hsnCode || null,
            gstPercent: item.gstPercent ?? null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
        payments:
          amountPaid > 0 && input.initialPaymentMethod
            ? {
                create: [
                  {
                    amount: amountPaid,
                    method: input.initialPaymentMethod,
                    note: input.initialPaymentNote || null,
                  },
                ],
              }
            : undefined,
      },
    });

    for (const item of input.items) {
      if (item.type !== "CATALOG" || !item.productId) continue;
      const updated = await tx.product.update({
        where: { id: item.productId },
        data: { stockQty: { decrement: item.quantity } },
        select: { stockQty: true },
      });
      if (updated.stockQty <= 0) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: 0, isAvailable: false },
        });
      }
    }

    return b;
  });

  revalidatePath("/admin/billing");
  return { id: bill.id };
}

export async function recordBillPayment(
  billId: string,
  amount: number,
  method: BillPaymentMethod,
  note?: string
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  const bill = await db.bill.findUnique({ where: { id: billId } });
  if (!bill) return { error: "Bill not found" };

  const newAmountPaid = Number(bill.amountPaid) + amount;
  const newBalanceDue = Number(bill.totalAmount) - newAmountPaid;
  const newStatus =
    newBalanceDue <= 0 ? "PAID" : newAmountPaid > 0 ? "PARTIAL" : "UNPAID";

  await db.$transaction([
    db.billPayment.create({
      data: { billId, amount, method, note: note || null },
    }),
    db.bill.update({
      where: { id: billId },
      data: {
        amountPaid: newAmountPaid,
        balanceDue: Math.max(0, newBalanceDue),
        status: newStatus,
      },
    }),
  ]);

  revalidatePath(`/admin/billing/${billId}`);
  revalidatePath("/admin/billing");
  return {};
}

export type StoreSettingsData = {
  storeName: string;
  storeAddress: string;
  gstin: string;
};

export async function getStoreSettings(): Promise<StoreSettingsData | null> {
  const s = await db.storeSettings.findUnique({ where: { id: "singleton" } });
  if (!s) return null;
  return {
    storeName: s.storeName ?? "",
    storeAddress: s.storeAddress ?? "",
    gstin: s.gstin ?? "",
  };
}

export async function saveStoreSettings(
  data: StoreSettingsData
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  await db.storeSettings.upsert({
    where: { id: "singleton" },
    update: {
      storeName: data.storeName || null,
      storeAddress: data.storeAddress || null,
      gstin: data.gstin || null,
    },
    create: {
      id: "singleton",
      storeName: data.storeName || null,
      storeAddress: data.storeAddress || null,
      gstin: data.gstin || null,
    },
  });

  revalidatePath("/admin/billing");
  revalidatePath("/admin/billing/settings");
  return {};
}

export async function deleteBill(billId: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  const bill = await db.bill.findUnique({ where: { id: billId }, select: { id: true } });
  if (!bill) return { error: "Bill not found" };

  await db.bill.delete({ where: { id: billId } });

  revalidatePath("/admin/billing");
  return {};
}

export async function searchCustomers(query: string) {
  try {
    await requireAdmin();
  } catch {
    return [];
  }

  if (!query.trim()) return [];

  return db.customer.findMany({
    where: {
      OR: [
        { phone: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 5,
    select: { id: true, name: true, phone: true, email: true },
  });
}
