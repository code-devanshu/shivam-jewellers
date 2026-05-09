"use server";

import { db } from "@/lib/db";

export type InquiryType = "CUSTOM_ORDER" | "AVAILABILITY" | "GENERAL";

export type InquiryFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function submitInquiry(
  _prev: InquiryFormState,
  formData: FormData
): Promise<InquiryFormState> {
  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const type = formData.get("type") as InquiryType;
  const productInterest = (formData.get("productInterest") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!name || !phone || !message) {
    return { status: "error", message: "Please fill in all required fields." };
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    return { status: "error", message: "Enter a valid 10-digit Indian mobile number." };
  }

  const fullMessage = productInterest
    ? `[${type}] ${message}\n\nProduct interest: ${productInterest}`
    : `[${type}] ${message}`;

  await db.inquiry.create({
    data: { name, phone, message: fullMessage },
  });

  return { status: "success" };
}
