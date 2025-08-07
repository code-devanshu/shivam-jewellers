"use client";

import { useCart } from "@/app/context/CartContext";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  // { href: "/contact", label: "Contact" },
  // { href: "/login", label: "Login" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { items, setOpen } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const pathname = usePathname();

  // Sparkle icon as SVG
  const Sparkle = (
    <svg
      className="inline w-5 h-5 ml-1 text-pink-400 animate-pulse"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2L14 8h6l-5 4 2 8-6-4-6 4 2-8-5-4h6z" />
    </svg>
  );

  // Render nav links, highlighting current page
  const renderLinks = (onClick?: () => void) =>
    navLinks.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        onClick={onClick}
        className={`relative px-3 py-1 rounded transition font-medium outline-none focus:ring-2 focus:ring-pink-400
          ${
            pathname === link.href
              ? "text-pink-600 bg-pink-50"
              : "hover:text-pink-600 hover:bg-pink-50"
          }
        `}
        aria-current={pathname === link.href ? "page" : undefined}
      >
        {link.label}
        {pathname === link.href && (
          <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-pink-500 rounded-full" />
        )}
      </Link>
    ));

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo with Sparkle */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-serif font-extrabold text-pink-600 tracking-tight drop-shadow cursor-pointer select-none">
              Shivam<span className="text-gray-900">Jewellers</span>
              {Sparkle}
            </span>
          </Link>
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {renderLinks()}
            {/* Cart always visible */}
            <button
              onClick={() => setOpen(true)}
              className="relative ml-3 p-2 rounded-full hover:bg-pink-100 focus:ring-2 focus:ring-pink-400 transition"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-6 h-6 text-pink-600" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                  {itemCount}
                </span>
              )}
            </button>
          </nav>
          {/* Mobile: Cart and Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="relative p-2 min-w-12 min-h-12 rounded-full hover:bg-pink-100 focus:ring-2 focus:ring-pink-400 transition"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-6 h-6 text-pink-600" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                  {itemCount}
                </span>
              )}
            </button>
            {/* Hamburger */}
            <button
              className="p-2 min-w-12 min-h-12 rounded hover:bg-pink-100 focus:ring-2 focus:ring-pink-400 transition"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Open menu</span>
              <svg
                className="w-6 h-6 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        {/* Optional: Gentle gradient bar below header */}
        <div className="h-1 bg-gradient-to-r from-pink-400/30 via-pink-100/0 to-pink-400/30" />
        {/* Mobile menu: Glassmorphism, animated */}
        <div
          id="mobile-menu"
          className={`md:hidden transition-all duration-300
            bg-white/80 backdrop-blur-lg shadow-lg border-t border-gray-200 overflow-hidden
            ${menuOpen ? "max-h-96 py-2" : "max-h-0 py-0"}
          `}
          style={{ transitionProperty: "max-height, padding" }}
        >
          <ul className="flex flex-col space-y-2 px-6 py-2 font-semibold text-gray-700">
            {renderLinks(() => setMenuOpen(false))}
          </ul>
        </div>
      </header>
    </>
  );
}
