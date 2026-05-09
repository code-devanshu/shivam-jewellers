"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Menu, ShoppingBag, User, X } from "lucide-react";
import type { Category } from "@/lib/types";
import { signOutCustomer } from "@/app/(store)/auth/actions";

type Props = {
  categories: Category[];
  cartCount: number;
  isLoggedIn: boolean;
};

export default function Navbar({ categories, cartCount, isLoggedIn }: Props) {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const navLinks = [
    { href: "/products", label: "All Jewellery" },
    ...categories
      .filter((c) => c.showInNav)
      .sort((a, b) => a.order - b.order)
      .map((c) => ({ href: `/products?category=${c.slug}`, label: c.name })),
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="bg-cream border-b border-blush sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="text-2xl text-rose-gold leading-none">✦</span>
            <div className="leading-tight">
              <div className="text-base font-serif font-bold text-brown-dark">
                Shivam Jewellers
              </div>
              <div className="text-[10px] text-rose-gold tracking-[0.2em] uppercase">
                Est. 1995
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-brown hover:text-rose-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action icons */}
          <div className="flex items-center gap-1">
            <Link
              href="/wishlist"
              className="p-2 text-brown hover:text-rose-gold transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={20} />
            </Link>

            {/* Cart with badge */}
            <Link
              href="/cart"
              className="relative p-2 text-brown hover:text-rose-gold transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-4 h-4 bg-rose-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Account */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="p-2 text-brown hover:text-rose-gold transition-colors"
                  aria-label="Account"
                >
                  <User size={20} />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-blush rounded-xl shadow-lg py-1 min-w-35 z-50">
                    <form action={signOutCustomer}>
                      <button
                        type="submit"
                        className="w-full text-left px-4 py-2 text-sm text-brown hover:text-rose-gold hover:bg-blush/40 transition-colors"
                      >
                        Sign Out
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="hidden md:flex items-center gap-1.5 px-4 py-1.5 border border-rose-gold text-rose-gold hover:bg-blush rounded-full text-sm font-medium transition-colors ml-1"
              >
                Sign In
              </Link>
            )}

            <button
              className="md:hidden p-2 text-brown hover:text-rose-gold transition-colors"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t border-blush bg-cream px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm font-medium text-brown hover:text-rose-gold transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-blush mt-2">
            {isLoggedIn ? (
              <form action={signOutCustomer}>
                <button
                  type="submit"
                  className="block w-full text-left py-2 text-sm font-medium text-brown hover:text-rose-gold transition-colors"
                >
                  Sign Out
                </button>
              </form>
            ) : (
              <Link
                href="/auth"
                className="block py-2 text-sm font-medium text-rose-gold"
                onClick={() => setOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
