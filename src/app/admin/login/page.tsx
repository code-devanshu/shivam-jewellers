import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign In | Admin" };

export default function AdminLoginPage() {
  return <LoginForm />;
}
