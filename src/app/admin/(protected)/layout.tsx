import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import Sidebar from "@/components/admin/Sidebar";
import { Toaster } from "sonner";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const isAuthenticated = verifyAdminSession(session);

  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  return (
    <div className={`flex h-screen bg-gray-50 ${geistMono.variable}`}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
