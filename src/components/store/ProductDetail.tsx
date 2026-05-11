"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Heart,
  Shield,
  ShoppingBag,
  Zap,
} from "lucide-react";
import ProductImageGallery from "@/components/store/ProductImageGallery";
import type { Product, ProductVariant } from "@/lib/types";
import { calculatePrice, formatPrice } from "@/lib/price";
import { toast } from "sonner";
import { addToCart } from "@/app/(store)/cart/actions";
import { toggleWishlist } from "@/app/(store)/wishlist/actions";
import { isRedirectError } from "next/dist/client/components/redirect-error";

type Props = {
  product: Product;
  ratePerGram: number;
  customerId: string | null;
  isWishlisted: boolean;
};

export default function ProductDetail({
  product,
  ratePerGram,
  customerId,
  isWishlisted: initialWishlisted,
}: Props) {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants[0] ?? null
  );
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [cartState, setCartState] = useState<"idle" | "adding" | "added">("idle");
  const [buyState, setBuyState] = useState<"idle" | "pending">("idle");
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [, startCartTransition] = useTransition();
  const [, startBuyTransition] = useTransition();
  const [, startWishlistTransition] = useTransition();

  const additionalPrice = selectedVariant?.additionalPrice ?? 0;
  const breakdown = calculatePrice(product, ratePerGram, additionalPrice);

  const sizes = [
    ...new Set(
      product.variants.map((v) => v.size).filter((s): s is string => !!s)
    ),
  ];
  const gemstones = [
    ...new Set(
      product.variants.map((v) => v.gemstone).filter((g): g is string => !!g)
    ),
  ];

  const handleAddToCart = () => {
    if (!customerId) {
      router.push(`/auth?next=/products/${product.slug}`);
      return;
    }
    setCartState("adding");
    startCartTransition(async () => {
      try {
        await addToCart(product.id, selectedVariant?.id ?? null);
        setCartState("added");
        setTimeout(() => setCartState("idle"), 2200);
      } catch (e) {
        if (isRedirectError(e)) throw e;
        setCartState("idle");
      }
    });
  };

  const handleBuyNow = () => {
    if (!customerId) {
      router.push(`/auth?next=/products/${product.slug}`);
      return;
    }
    setBuyState("pending");
    startBuyTransition(async () => {
      try {
        await addToCart(product.id, selectedVariant?.id ?? null);
        router.push("/cart");
      } catch (e) {
        if (isRedirectError(e)) throw e;
        setBuyState("idle");
      }
    });
  };

  const handleToggleWishlist = () => {
    if (!customerId) {
      router.push(`/auth?next=/products/${product.slug}`);
      return;
    }
    const next = !wishlisted;
    setWishlisted(next);
    startWishlistTransition(async () => {
      try {
        const confirmed = await toggleWishlist(product.id);
        setWishlisted(confirmed);
        toast.success(confirmed ? "Added to wishlist" : "Removed from wishlist");
      } catch (e) {
        if (isRedirectError(e)) throw e;
        setWishlisted(!next);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-brown/50 mb-8 flex-wrap">
        <Link href="/" className="hover:text-rose-gold transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href="/products"
          className="hover:text-rose-gold transition-colors"
        >
          Products
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-rose-gold transition-colors"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-brown-dark truncate max-w-50">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* ── Image Gallery ─────────────────────────────────────────── */}
        <div>
          <ProductImageGallery
            images={product.images}
            productName={product.name}
          />
        </div>

        {/* ── Info ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          {/* Category + Metal badges */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs bg-blush text-rose-gold-dark px-3 py-1 rounded-full font-medium">
              {product.category.name}
            </span>
            <span className="text-xs bg-blush text-rose-gold-dark px-3 py-1 rounded-full font-medium">
              {product.metal.name} · {product.purity}
            </span>
            {product.isFeatured && (
              <span className="text-xs bg-rose-gold text-white px-3 py-1 rounded-full font-medium">
                Featured
              </span>
            )}
          </div>

          {/* Name + weight */}
          <div>
            <h1 className="text-3xl font-serif font-bold text-brown-dark leading-snug mb-3">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 text-sm text-brown/60">
              <span>Net weight: <strong className="text-brown-dark">{product.weightGrams}g</strong></span>
              <span>·</span>
              <span>Gross weight: <strong className="text-brown-dark">{product.grossWeightGrams}g</strong></span>
            </div>
          </div>

          {/* Price card */}
          <div className="bg-cream border border-blush rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-rose-gold-dark">
                {formatPrice(breakdown.totalPrice)}
              </span>
              <button
                onClick={() => setShowBreakdown((v) => !v)}
                className="flex items-center gap-1 text-xs text-rose-gold hover:text-rose-gold-dark font-medium transition-colors"
              >
                Price breakdown{" "}
                {showBreakdown ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
            <p className="text-xs text-brown/50 mt-1">
              Inclusive of GST · Calculated at today's {product.metal.name.toLowerCase()} rate (
              {formatPrice(ratePerGram)}/g)
            </p>

            {showBreakdown && (
              <div className="border-t border-blush mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-brown/70">
                  <span>
                    Metal value ({product.metal.symbol} @ {formatPrice(ratePerGram)}/g
                    × {product.weightGrams}g × {product.purity})
                  </span>
                  <span className="font-medium shrink-0 pl-4">
                    {formatPrice(breakdown.metalValue)}
                  </span>
                </div>
                <div className="flex justify-between text-brown/70">
                  <span>
                    Making charge (
                    {product.makingChargeType === "PERCENT"
                      ? `${product.makingCharge}%`
                      : "Fixed"}
                    )
                  </span>
                  <span className="font-medium shrink-0 pl-4">
                    {formatPrice(breakdown.makingAmount)}
                  </span>
                </div>
                {additionalPrice > 0 && (
                  <div className="flex justify-between text-brown/70">
                    <span>Variant premium</span>
                    <span className="font-medium shrink-0 pl-4">
                      {formatPrice(additionalPrice)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-brown/70">
                  <span>GST ({product.gstPercent}%)</span>
                  <span className="font-medium shrink-0 pl-4">
                    {formatPrice(breakdown.gstAmount)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-brown-dark border-t border-blush pt-2">
                  <span>Total</span>
                  <span>{formatPrice(breakdown.totalPrice)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Size selector */}
          {sizes.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-brown-dark mb-2.5">
                Size{selectedVariant?.size ? `: ${selectedVariant.size}` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const v = product.variants.find((vv) => vv.size === size);
                  const active = selectedVariant?.size === size;
                  return (
                    <button
                      key={size}
                      onClick={() => v && setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        active
                          ? "bg-rose-gold text-white border-rose-gold shadow-sm"
                          : "border-blush text-brown/70 hover:border-rose-gold hover:text-rose-gold"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Gemstone selector */}
          {gemstones.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-brown-dark mb-2.5">Gemstone</p>
              <div className="flex flex-wrap gap-2">
                {gemstones.map((gem) => {
                  const active = selectedVariant?.gemstone === gem;
                  return (
                    <button
                      key={gem}
                      onClick={() => {
                        const v = product.variants.find(
                          (vv) => vv.gemstone === gem
                        );
                        if (v) setSelectedVariant(v);
                      }}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        active
                          ? "bg-rose-gold text-white border-rose-gold shadow-sm"
                          : "border-blush text-brown/70 hover:border-rose-gold hover:text-rose-gold"
                      }`}
                    >
                      {gem}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex flex-col gap-3">
            {/* Buy Now — primary */}
            <button
              onClick={handleBuyNow}
              disabled={buyState === "pending"}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold bg-brown-dark hover:bg-brown text-white disabled:opacity-60 transition-all"
            >
              <Zap size={17} />
              {buyState === "pending" ? "Please wait…" : "Buy Now"}
            </button>

            {/* Add to Cart + Wishlist */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={cartState === "adding"}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold border-2 transition-all ${
                  cartState === "added"
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-rose-gold text-rose-gold hover:bg-rose-gold hover:text-white disabled:opacity-60"
                }`}
              >
                <ShoppingBag size={17} />
                {cartState === "adding"
                  ? "Adding…"
                  : cartState === "added"
                  ? "Added to Cart!"
                  : "Add to Cart"}
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`p-3.5 rounded-full border-2 transition-all ${
                  wishlisted
                    ? "bg-rose-gold border-rose-gold text-white"
                    : "border-blush text-rose-gold hover:bg-blush"
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="border-t border-blush pt-5">
              <p className="text-sm font-semibold text-brown-dark mb-2">
                About this piece
              </p>
              <p className="text-sm text-brown/70 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Trust badge */}
          <div className="flex items-start gap-3 bg-blush/30 border border-blush rounded-xl p-4">
            <Shield size={18} className="text-rose-gold mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-brown-dark">
                BIS Hallmark Certified
              </p>
              <p className="text-xs text-brown/60 mt-0.5">
                Purity as marked · Certificate available in-store and on request
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
