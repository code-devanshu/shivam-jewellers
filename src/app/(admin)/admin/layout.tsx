import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminHeader from "./components/AdminHeader";
import Breadcrumbs from "./components/Breadcrumbs";
import { authOptions } from "@/lib/authOptions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-200">
      <AdminHeader email={session.user.email} role={session.user.role} />
      <div className="max-w-full mx-auto py-4 px-6">
        <Breadcrumbs />
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
