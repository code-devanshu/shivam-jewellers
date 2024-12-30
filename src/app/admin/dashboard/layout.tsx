import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { Header } from "./components/header";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch the session (user info) on the server
  const session = await getServerSession(authOptions);

  // If no session exists, redirect to login
  if (!session) {
    return (
      <div>
        <p>Redirecting to login...</p>
      </div>
    );
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header user={session.user} />
        <div className="px-4 py-2">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
