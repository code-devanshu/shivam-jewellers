"use client";

import Image from "next/image";
import { useState, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";

type ImageData = {
  id: string;
  url: string;
  isPrimary: boolean;
};

type Props = {
  images: ImageData[];
  productName: string;
};

export default function ProductImageGallery({ images, productName }: Props) {
  const sorted = images
    .slice()
    .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const prev = useCallback(
    () => setActiveIdx((i) => (i - 1 + sorted.length) % sorted.length),
    [sorted.length]
  );
  const next = useCallback(
    () => setActiveIdx((i) => (i + 1) % sorted.length),
    [sorted.length]
  );

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta < -40) next();
    else if (delta > 40) prev();
    touchStartX.current = null;
  }

  const active = sorted[activeIdx];

  if (sorted.length === 0) {
    return (
      <div className="aspect-square rounded-3xl bg-blush/40 border border-blush flex items-center justify-center text-8xl text-rose-gold-light">
        ✦
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col-reverse lg:flex-row gap-3">
        {/* Thumbnail strip — vertical on desktop */}
        {sorted.length > 1 && (
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:max-h-[520px] pb-1 lg:pb-0 lg:w-18 shrink-0">
            {sorted.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveIdx(idx)}
                className={`relative w-16 h-16 lg:w-18 lg:h-18 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  idx === activeIdx
                    ? "border-rose-gold shadow-md scale-105"
                    : "border-gray-200 hover:border-rose-gold/60 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={`${productName} view ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="72px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="flex-1 relative min-w-0">
          <div
            className="relative aspect-square rounded-3xl overflow-hidden bg-blush/40 border border-blush shadow-sm group cursor-zoom-in"
            onClick={() => setLightboxOpen(true)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              key={active.id}
              src={active.url}
              alt={productName}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />

            {/* Gradient vignette on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Zoom hint */}
            <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ZoomIn size={15} />
            </div>

            {/* Counter badge */}
            {sorted.length > 1 && (
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
                {activeIdx + 1} / {sorted.length}
              </div>
            )}

            {/* Prev / Next arrows */}
            {sorted.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/85 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-md text-brown-dark"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/85 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-md text-brown-dark"
                  aria-label="Next image"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {/* Mobile dot indicators */}
          {sorted.length > 1 && (
            <div className="lg:hidden flex justify-center gap-1.5 mt-3">
              {sorted.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`rounded-full transition-all duration-200 ${
                    idx === activeIdx
                      ? "w-5 h-1.5 bg-rose-gold"
                      : "w-1.5 h-1.5 bg-gray-300"
                  }`}
                  aria-label={`Image ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close */}
          <button
            className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors z-10"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
          >
            <X size={26} />
          </button>

          {/* Counter */}
          {sorted.length > 1 && (
            <span className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {activeIdx + 1} / {sorted.length}
            </span>
          )}

          {/* Arrows */}
          {sorted.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors z-10"
                aria-label="Previous"
              >
                <ChevronLeft size={36} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors z-10"
                aria-label="Next"
              >
                <ChevronRight size={36} />
              </button>
            </>
          )}

          {/* Main lightbox image */}
          <div
            className="relative w-full max-w-3xl mx-16 aspect-square"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              key={`lb-${active.id}`}
              src={active.url}
              alt={productName}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 90vw, 800px"
            />
          </div>

          {/* Thumbnail strip in lightbox */}
          {sorted.length > 1 && (
            <div className="absolute bottom-6 flex gap-2 overflow-x-auto max-w-screen px-4">
              {sorted.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={(e) => { e.stopPropagation(); setActiveIdx(idx); }}
                  className={`relative w-14 h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === activeIdx
                      ? "border-rose-gold scale-110 shadow-lg"
                      : "border-white/20 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
