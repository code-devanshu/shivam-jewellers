"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type LoginFormState =
  | { status: "idle" }
  | { status: "error"; message: string };

export async function adminLogin(
  _prev: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const password = (formData.get("password") as string) ?? "";

  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!adminPassword || !sessionSecret) {
    return { status: "error", message: "Admin credentials are not configured on the server." };
  }

  if (password !== adminPassword) {
    return { status: "error", message: "Incorrect password." };
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_session", sessionSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}
