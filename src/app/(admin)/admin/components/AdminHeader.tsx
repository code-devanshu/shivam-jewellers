"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

const navLinks = [
  { label: "Dashboard", href: "/admin" },
  { label: "Inventory", href: "/admin/inventory" },
  { label: "Add Product", href: "/admin/add-product" },
];

export default function AdminHeader({
  email,
  role,
}: {
  email?: string | null;
  role?: string | null;
}) {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-full mx-auto px-6 py-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <h1 className="text-xl font-bold text-pink-600 tracking-tight">
                Admin Panel
              </h1>
            </Link>

            <nav className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium text-sm px-3 py-1.5 rounded-lg transition-all ${
                    pathname === link.href
                      ? "bg-pink-100 text-pink-700"
                      : "text-gray-600 hover:text-pink-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {email && (
              <span className="text-sm text-gray-500 hidden md:inline">
                {email}{" "}
                {role && <span className="text-gray-400">({role})</span>}
              </span>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-100 transition font-medium"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
