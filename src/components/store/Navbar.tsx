"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Heart,
  Menu,
  ShoppingBag,
  User,
  X,
  Gem,
  Sparkles,
  Circle,
  Star,
  Gift,
  Calendar,
  Shield,
  Link2,
} from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { signOutCustomer } from "@/app/(store)/auth/actions";
import SearchBar from "@/components/store/SearchBar";
import { useAuthModal } from "@/components/store/AuthModalProvider";

type Props = {
  categories: Category[];
  trendingProducts: Product[];
  cartCount: number;
  wishlistCount: number;
  isLoggedIn: boolean;
};

const SLUG_ICONS: Record<string, React.ReactNode> = {
  rings: <Circle size={15} strokeWidth={1.5} />,
  necklaces: <Link2 size={15} strokeWidth={1.5} />,
  earrings: <Star size={15} strokeWidth={1.5} />,
  bangles: <Circle size={15} strokeWidth={1.5} />,
  bracelets: <Circle size={15} strokeWidth={1.5} />,
  pendants: <Heart size={15} strokeWidth={1.5} />,
  chains: <Link2 size={15} strokeWidth={1.5} />,
  wedding: <Heart size={15} strokeWidth={1.5} />,
  gifting: <Gift size={15} strokeWidth={1.5} />,
  "daily-wear": <Calendar size={15} strokeWidth={1.5} />,
  gold: <Gem size={15} strokeWidth={1.5} />,
  silver: <Shield size={15} strokeWidth={1.5} />,
};

function CatIcon({ slug }: { slug: string }) {
  return (
    <span className="text-rose-gold shrink-0">
      {SLUG_ICONS[slug] ?? <Gem size={15} strokeWidth={1.5} />}
    </span>
  );
}

export default function Navbar({ categories, trendingProducts, cartCount, wishlistCount, isLoggedIn }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { openAuthModal } = useAuthModal();

  const navCategories = categories
    .filter((c) => c.showInNav)
    .sort((a, b) => a.order - b.order);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">

      {/* ── Row 1: Logo · Icons ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="text-[22px] text-rose-gold leading-none select-none">✦</span>
            <div className="leading-tight">
              <div className="text-[15px] font-serif font-bold text-brown-dark whitespace-nowrap tracking-wide">
                Shivam Jewellers
              </div>
              <div className="hidden sm:block text-[10px] text-rose-gold tracking-[0.2em] uppercase">
                Est. 1995
              </div>
            </div>
          </Link>

          {/* Search — desktop only inline */}
          <div className="hidden sm:flex flex-1 justify-center px-4">
            <div className="w-full max-w-134.5">
              <SearchBar
                categories={categories}
                trendingProducts={trendingProducts}
                variant="navbar"
              />
            </div>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">

            {/* Wishlist — desktop only */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative hidden sm:flex p-2.5 text-gray-500 hover:text-rose-gold transition-colors"
            >
              <Heart size={20} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] bg-rose-gold text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Account — desktop only */}
            {isLoggedIn ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  aria-label="Account"
                  className="p-2.5 text-gray-500 hover:text-rose-gold transition-colors"
                >
                  <User size={20} strokeWidth={1.5} />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-36 z-50">
                    <Link
                      href="/orders"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm text-brown hover:text-rose-gold hover:bg-gray-50 transition-colors"
                    >
                      My Orders
                    </Link>
                    <form action={signOutCustomer}>
                      <button
                        type="submit"
                        className="w-full text-left px-4 py-2 text-sm text-brown hover:text-rose-gold hover:bg-gray-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal()}
                aria-label="Sign In"
                className="hidden sm:flex p-2.5 text-gray-500 hover:text-rose-gold transition-colors"
              >
                <User size={20} strokeWidth={1.5} />
              </button>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative p-2.5 text-gray-500 hover:text-rose-gold transition-colors"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] bg-rose-gold text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Hamburger — mobile only */}
            <button
              className="sm:hidden p-2.5 text-gray-500 hover:text-rose-gold transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile search row ─────────────────────────────────────── */}
      <div className="sm:hidden px-4 py-2.5">
        <SearchBar
          categories={categories}
          trendingProducts={trendingProducts}
          variant="navbar"
        />
      </div>

      {/* ── Row 2: Category strip (desktop only) ──────────────────── */}
      <div className="hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="flex items-center overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <Link
              href="/products"
              className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-rose-gold whitespace-nowrap shrink-0 px-3 py-2.5 transition-colors hover:bg-rose-gold/5 rounded-md"
            >
              <span className="text-rose-gold shrink-0">
                <Sparkles size={15} strokeWidth={1.5} />
              </span>
              All Jewellery
            </Link>

            {navCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-rose-gold whitespace-nowrap shrink-0 px-3 py-2.5 transition-colors hover:bg-rose-gold/5 rounded-md"
              >
                <CatIcon slug={cat.slug} />
                {cat.name}
              </Link>
            ))}

            <Link
              href="/contact"
              className="flex items-center text-[13px] font-medium text-gray-600 hover:text-rose-gold whitespace-nowrap shrink-0 px-3 py-2.5 transition-colors hover:bg-rose-gold/5 rounded-md ml-auto"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile panel ──────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="sm:hidden bg-white">
          {/* Categories */}
          <div className="px-4 py-2">
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between py-3 text-sm font-medium text-brown-dark border-b border-gray-100"
            >
              <span className="flex items-center gap-3">
                <span className="text-rose-gold"><Sparkles size={16} strokeWidth={1.5} /></span>
                All Jewellery
              </span>
              <span className="text-gray-400 text-xs">›</span>
            </Link>
            {navCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between py-3 text-sm font-medium text-brown-dark border-b border-gray-100 last:border-0"
              >
                <span className="flex items-center gap-3">
                  <CatIcon slug={cat.slug} />
                  {cat.name}
                </span>
                <span className="text-gray-400 text-xs">›</span>
              </Link>
            ))}
          </div>

          {/* Account + extras */}
          <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
            <Link
              href="/wishlist"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between py-3 text-sm text-brown border-b border-gray-100"
            >
              <span className="flex items-center gap-3">
                <Heart size={16} strokeWidth={1.5} className="text-rose-gold" />
                Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
              </span>
              <span className="text-gray-400 text-xs">›</span>
            </Link>

            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between py-3 text-sm text-brown border-b border-gray-100"
            >
              <span className="flex items-center gap-3">
                <span className="w-4 h-4 inline-block" />
                Contact
              </span>
              <span className="text-gray-400 text-xs">›</span>
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  href="/orders"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between py-3 text-sm text-brown border-b border-gray-100"
                >
                  <span className="flex items-center gap-3">
                    <User size={16} strokeWidth={1.5} className="text-rose-gold" />
                    My Orders
                  </span>
                  <span className="text-gray-400 text-xs">›</span>
                </Link>
                <form action={signOutCustomer}>
                  <button
                    type="submit"
                    className="flex items-center w-full py-3 text-sm text-brown"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-4 h-4 inline-block" />
                      Sign Out
                    </span>
                  </button>
                </form>
              </>
            ) : (
              <button
                onClick={() => { setMobileOpen(false); openAuthModal(); }}
                className="flex items-center gap-3 py-3 text-sm font-semibold text-rose-gold"
              >
                <User size={16} strokeWidth={1.5} />
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
