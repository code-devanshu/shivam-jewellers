"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean).slice(1); // Skip "admin"

  const paths = segments.map(
    (_, i, arr) => "/admin/" + arr.slice(0, i + 1).join("/")
  );

  if (pathname === "/admin") return <></>;

  return (
    <nav className="text-sm text-gray-500 flex items-center space-x-1">
      <Link href="/admin" className="hover:text-pink-600 font-medium">
        Dashboard
      </Link>

      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4" />
          <Link
            href={paths[i]}
            className={`capitalize hover:text-pink-600 ${
              i === segments.length - 1 ? "text-gray-800 font-semibold" : ""
            }`}
          >
            {decodeURIComponent(seg.replace(/-/g, " "))}
          </Link>
        </span>
      ))}
    </nav>
  );
}
