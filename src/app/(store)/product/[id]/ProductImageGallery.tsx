"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Search } from "lucide-react";

export default function ProductImageGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images?.length) return null;

  const showPrev = () =>
    setSelected((s) => (s === 0 ? images.length - 1 : s - 1));
  const showNext = () =>
    setSelected((s) => (s === images.length - 1 ? 0 : s + 1));

  return (
    <div>
      {/* Main Image with arrows and zoom */}
      <div className="relative w-full h-80 sm:h-96 md:h-[32rem] rounded-xl overflow-hidden bg-pink-50 group">
        <Image
          src={images[selected] || "/placeholder.png"}
          alt={`${name} image ${selected + 1}`}
          fill
          className="object-cover cursor-zoom-in transition group-hover:brightness-90"
          sizes="(max-width: 768px) 100vw, 50vw"
          onClick={() => setLightbox(true)}
        />

        {/* Left/Right arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrev}
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/70 hover:bg-pink-100 text-pink-600 rounded-full shadow p-2"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/70 hover:bg-pink-100 text-pink-600 rounded-full shadow p-2"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Zoom icon */}
        <button
          type="button"
          className="absolute bottom-2 right-2 bg-white/80 hover:bg-pink-100 text-pink-600 rounded-full shadow p-2"
          aria-label="Zoom"
          onClick={() => setLightbox(true)}
        >
          <Search size={20} />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 mt-3 overflow-x-auto">
        {images.map((img, idx) => (
          <button
            type="button"
            key={img + idx}
            onClick={() => setSelected(idx)}
            className={`w-16 h-16 relative rounded border-2 transition shrink-0 ${
              selected === idx ? "border-pink-600" : "border-gray-200"
            }`}
            aria-label={`Show image ${idx + 1}`}
          >
            <Image
              src={img}
              alt={`${name} thumbnail ${idx + 1}`}
              fill
              className="object-cover rounded"
              sizes="64px"
            />
          </button>
        ))}
      </div>

      {/* Lightbox modal */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-5 right-5 bg-white/80 text-pink-600 rounded-full p-2 hover:bg-pink-100 z-50"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(false);
            }}
            aria-label="Close"
          >
            <X size={28} />
          </button>
          <div className="relative w-full max-w-3xl h-[60vw] max-h-[80vh] rounded-xl overflow-hidden bg-pink-50 flex items-center justify-center">
            <Image
              src={images[selected]}
              alt={`${name} large image`}
              fill
              className="object-contain"
              sizes="(max-width: 1200px) 80vw, 800px"
            />
            {/* Modal arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showPrev();
                  }}
                  className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/70 hover:bg-pink-100 text-pink-600 rounded-full shadow p-2"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={30} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showNext();
                  }}
                  className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/70 hover:bg-pink-100 text-pink-600 rounded-full shadow p-2"
                  aria-label="Next image"
                >
                  <ChevronRight size={30} />
                </button>
              </>
            )}
          </div>
          {/* Caption */}
          <p className="mt-4 text-white text-lg font-semibold">{name}</p>
        </div>
      )}
    </div>
  );
}
