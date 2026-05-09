import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/admin-auth";
import Sidebar from "@/components/admin/Sidebar";
import { Toaster } from "sonner";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const isAuthenticated = verifyAdminSession(session);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
