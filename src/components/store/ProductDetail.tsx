"use client";

import Link from "next/link";
import { Suspense, use, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Heart,
  Shield,
  ShoppingCart,
  Zap,
} from "lucide-react";
import ProductImageGallery from "@/components/store/ProductImageGallery";
import DeliveryEstimate from "@/components/store/DeliveryEstimate";
import AlsoPurchasedCarousel from "@/components/store/AlsoPurchasedCarousel";
import type { Product, ProductVariant } from "@/lib/types";
import { calculatePrice, formatPrice } from "@/lib/price";
import { toast } from "sonner";
import { addToCart } from "@/app/(store)/cart/actions";
import { toggleWishlist } from "@/app/(store)/wishlist/actions";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useAuthModal } from "@/components/store/AuthModalProvider";
import { useCart } from "@/components/store/CartProvider";
import { errorToastStyle } from "@/lib/toast-styles";

type Props = {
  product: Product;
  ratePromise: Promise<number>;
  customerId: string | null;
  wishlistPromise: Promise<boolean>;
  alsoPurchasedPromise: Promise<Product[]>;
  alsoPurchasedRatePromise: Promise<Record<string, number>>;
  alsoPurchasedWishlistedIdsPromise: Promise<string[]>;
};

function AlsoPurchasedSkeleton() {
  return (
    <div className="mt-14">
      <div className="h-6 w-64 bg-blush/40 rounded-lg animate-pulse mb-5" />
      <div className="flex gap-4 overflow-x-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex-none w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] xl:w-[calc(20%-13px)]"
          >
            <div className="aspect-square bg-blush/40 rounded-2xl animate-pulse" />
            <div className="h-3 w-2/3 bg-blush/40 rounded mt-3 animate-pulse" />
            <div className="h-3 w-1/3 bg-blush/40 rounded mt-2 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AlsoPurchasedSection({
  alsoPurchasedPromise,
  alsoPurchasedRatePromise,
  alsoPurchasedWishlistedIdsPromise,
}: {
  alsoPurchasedPromise: Promise<Product[]>;
  alsoPurchasedRatePromise: Promise<Record<string, number>>;
  alsoPurchasedWishlistedIdsPromise: Promise<string[]>;
}) {
  const products = use(alsoPurchasedPromise);
  if (products.length === 0) return null;
  return (
    <div className="mt-14">
      <h2 className="text-xl font-serif font-bold text-brown-dark mb-5">
        Customers also purchased
      </h2>
      <AlsoPurchasedCarousel
        products={products}
        ratePromise={alsoPurchasedRatePromise}
        wishlistedIdsPromise={alsoPurchasedWishlistedIdsPromise}
      />
    </div>
  );
}

function PriceCardSkeleton() {
  return (
    <div className="bg-cream border border-blush rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-9 w-36 rounded-lg bg-blush/70 animate-pulse" />
        <div className="h-4 w-28 rounded-lg bg-blush/70 animate-pulse" />
      </div>
      <div className="h-3 w-64 rounded-lg bg-blush/70 animate-pulse" />
    </div>
  );
}

function PriceCard({
  product,
  ratePromise,
  additionalPrice,
}: {
  product: Product;
  ratePromise: Promise<number>;
  additionalPrice: number;
}) {
  const ratePerGram = use(ratePromise);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const breakdown = calculatePrice(product, ratePerGram, additionalPrice);

  return (
    <div className="bg-cream border border-blush rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="text-2xl sm:text-3xl font-bold text-rose-gold-dark">
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
        Inclusive of GST · Calculated at today&apos;s{" "}
        {product.metal.name.toLowerCase()} rate ({formatPrice(ratePerGram)}/g)
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
  );
}

function WishlistButtonSkeleton() {
  return (
    <div
      aria-hidden
      className="p-2.5 rounded-full border-2 border-blush text-rose-gold/30 animate-pulse shrink-0"
    >
      <Heart size={18} />
    </div>
  );
}

function WishlistButton({
  product,
  customerId,
  wishlistPromise,
}: {
  product: Product;
  customerId: string | null;
  wishlistPromise: Promise<boolean>;
}) {
  const initialWishlisted = use(wishlistPromise);
  const { openAuthModal } = useAuthModal();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [, startWishlistTransition] = useTransition();

  const handleToggleWishlist = () => {
    if (!customerId) {
      openAuthModal(`/products/${product.slug}`);
      return;
    }
    const next = !wishlisted;
    setWishlisted(next);
    startWishlistTransition(async () => {
      try {
        const confirmed = await toggleWishlist(product.id);
        setWishlisted(confirmed);
        toast.success(
          confirmed ? "Added to wishlist" : "Removed from wishlist",
        );
      } catch (e) {
        if (isRedirectError(e)) throw e;
        setWishlisted(!next);
      }
    });
  };

  return (
    <button
      onClick={handleToggleWishlist}
      className={`p-2.5 rounded-full border-2 transition-all shrink-0 ${
        wishlisted
          ? "bg-rose-gold border-rose-gold text-white"
          : "border-blush text-rose-gold hover:bg-blush"
      }`}
      aria-label="Toggle wishlist"
    >
      <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
    </button>
  );
}

export default function ProductDetail({
  product,
  ratePromise,
  customerId,
  wishlistPromise,
  alsoPurchasedPromise,
  alsoPurchasedRatePromise,
  alsoPurchasedWishlistedIdsPromise,
}: Props) {
  const router = useRouter();
  const { openAuthModal } = useAuthModal();
  const { increment, showFlyout } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants[0] ?? null,
  );
  const [variantChosen, setVariantChosen] = useState(
    product.variants.length <= 1,
  );
  const [cartState, setCartState] = useState<"idle" | "adding" | "added">(
    "idle",
  );
  const [buyState, setBuyState] = useState<"idle" | "pending">("idle");
  const [, startCartTransition] = useTransition();

  const additionalPrice = selectedVariant?.additionalPrice ?? 0;
  const primaryImage =
    product.images.find((i) => i.isPrimary) ?? product.images[0];
  const outOfStock = !product.isAvailable;
  const needsVariantSelection = !variantChosen;
  const purchaseDisabled = outOfStock || needsVariantSelection;

  const sizes = [
    ...new Set(
      product.variants.map((v) => v.size).filter((s): s is string => !!s),
    ),
  ];
  const gemstones = [
    ...new Set(
      product.variants.map((v) => v.gemstone).filter((g): g is string => !!g),
    ),
  ];

  const handleAddToCart = () => {
    if (!customerId) {
      openAuthModal(`/products/${product.slug}`);
      return;
    }
    if (purchaseDisabled) return;
    setCartState("adding");
    startCartTransition(async () => {
      try {
        await addToCart(product.id, selectedVariant?.id ?? null);
        setCartState("added");
        setTimeout(() => setCartState("idle"), 2200);
        increment(1);
        const ratePerGram = await ratePromise;
        const breakdown = calculatePrice(product, ratePerGram, additionalPrice);
        showFlyout({
          productId: product.id,
          name: product.name,
          imageUrl: primaryImage?.url ?? null,
          price: breakdown.totalPrice,
          quantity: 1,
        });
      } catch (e) {
        if (isRedirectError(e)) throw e;
        setCartState("idle");
        toast.error("Couldn't add to cart", {
          description: "Please try again.",
          style: errorToastStyle,
        });
      }
    });
  };

  const handleBuyNow = () => {
    if (!customerId) {
      openAuthModal(`/products/${product.slug}`);
      return;
    }
    if (purchaseDisabled) return;
    setBuyState("pending");
    const qs = new URLSearchParams({ buyNow: product.id });
    if (selectedVariant?.id) qs.set("variant", selectedVariant.id);
    router.push(`/checkout?${qs.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 sm:pb-8">
      {/* Breadcrumb — compact back link on mobile, full chain on desktop */}
      <Link
        href={`/products?category=${product.category.slug}`}
        className="sm:hidden inline-flex items-center gap-0.5 text-sm font-medium text-brown/60 hover:text-rose-gold transition-colors mb-4"
      >
        <ChevronLeft size={16} strokeWidth={2} />
        {product.category.name}
      </Link>
      <nav className="hidden sm:flex items-center gap-2 text-sm text-brown/50 mb-8 flex-wrap">
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
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brown-dark leading-snug">
                {product.name}
              </h1>
              <Suspense fallback={<WishlistButtonSkeleton />}>
                <WishlistButton
                  product={product}
                  customerId={customerId}
                  wishlistPromise={wishlistPromise}
                />
              </Suspense>
            </div>
            <div className="flex items-center gap-3 text-sm text-brown/60">
              <span>
                Net weight:{" "}
                <strong className="text-brown-dark">
                  {product.weightGrams}g
                </strong>
              </span>
              <span>·</span>
              <span>
                Gross weight:{" "}
                <strong className="text-brown-dark">
                  {product.grossWeightGrams}g
                </strong>
              </span>
            </div>
          </div>

          {/* Delivery estimate */}
          <DeliveryEstimate />

          {/* Price card — streams in once the live rate resolves */}
          <Suspense fallback={<PriceCardSkeleton />}>
            <PriceCard
              product={product}
              ratePromise={ratePromise}
              additionalPrice={additionalPrice}
            />
          </Suspense>

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
                      onClick={() => {
                        if (v) setSelectedVariant(v);
                        setVariantChosen(true);
                      }}
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
              <p className="text-sm font-semibold text-brown-dark mb-2.5">
                Gemstone
              </p>
              <div className="flex flex-wrap gap-2">
                {gemstones.map((gem) => {
                  const active = selectedVariant?.gemstone === gem;
                  return (
                    <button
                      key={gem}
                      onClick={() => {
                        const v = product.variants.find(
                          (vv) => vv.gemstone === gem,
                        );
                        if (v) setSelectedVariant(v);
                        setVariantChosen(true);
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
            {needsVariantSelection && (
              <p className="text-xs font-medium text-rose-gold-dark">
                Please select a size to continue
              </p>
            )}
            {outOfStock && (
              <p className="text-xs font-medium text-red-600">
                This piece is currently out of stock
              </p>
            )}

            {/* Buy Now + Add to Cart — inline row on desktop, sticky bottom bar on mobile */}
            <div className="hidden sm:flex gap-3">
              <button
                onClick={handleBuyNow}
                disabled={buyState === "pending" || purchaseDisabled}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold bg-brown-dark hover:bg-brown text-white disabled:opacity-60 transition-all"
              >
                <Zap size={17} />
                {buyState === "pending"
                  ? "Please wait…"
                  : outOfStock
                    ? "Out of Stock"
                    : "Buy Now"}
              </button>

              <button
                onClick={handleAddToCart}
                disabled={cartState === "adding" || purchaseDisabled}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold border-2 transition-all ${
                  cartState === "added"
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-rose-gold text-rose-gold hover:bg-rose-gold hover:text-white disabled:opacity-60"
                }`}
              >
                <ShoppingCart size={17} />
                {outOfStock
                  ? "Out of Stock"
                  : cartState === "adding"
                    ? "Adding…"
                    : cartState === "added"
                      ? "Added to Cart!"
                      : "Add to Cart"}
              </button>
            </div>
          </div>

          {/* Mobile sticky CTA bar */}
          <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-blush px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex gap-3">
            <button
              onClick={handleBuyNow}
              disabled={buyState === "pending" || purchaseDisabled}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold bg-brown-dark hover:bg-brown text-white disabled:opacity-60 transition-all"
            >
              <Zap size={17} />
              {buyState === "pending"
                ? "Please wait…"
                : outOfStock
                  ? "Out of Stock"
                  : "Buy Now"}
            </button>

            <button
              onClick={handleAddToCart}
              disabled={cartState === "adding" || purchaseDisabled}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold border-2 transition-all ${
                cartState === "added"
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-rose-gold text-rose-gold hover:bg-rose-gold hover:text-white disabled:opacity-60"
              }`}
            >
              <ShoppingCart size={17} />
              {outOfStock
                ? "Out of Stock"
                : cartState === "adding"
                  ? "Adding…"
                  : cartState === "added"
                    ? "Added to Cart!"
                    : "Add to Cart"}
            </button>
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

      {/* Customers also purchased */}
      <Suspense fallback={<AlsoPurchasedSkeleton />}>
        <AlsoPurchasedSection
          alsoPurchasedPromise={alsoPurchasedPromise}
          alsoPurchasedRatePromise={alsoPurchasedRatePromise}
          alsoPurchasedWishlistedIdsPromise={alsoPurchasedWishlistedIdsPromise}
        />
      </Suspense>
    </div>
  );
}
