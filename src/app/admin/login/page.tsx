import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign In | Admin", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return <LoginForm />;
}
