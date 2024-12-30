"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductImageViewer({ images }: { images: string[] }) {
  const [mainImage, setMainImage] = useState<string>(images[0]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const handleMouseEnter = (image: string, index: number) => {
    setMainImage(image);
    setCurrentIndex(index);
  };

  const handlePrevImage = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    setMainImage(images[prevIndex]);
    setCurrentIndex(prevIndex);
  };

  const handleNextImage = () => {
    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    setMainImage(images[nextIndex]);
    setCurrentIndex(nextIndex);
  };

  return (
    <div className="flex lg:flex-row flex-col gap-6 items-start">
      {/* Thumbnail Carousel */}
      <div className="flex flex-row lg:flex-col gap-4 max-h-96 overflow-y-auto">
        {images.map((src, idx) => (
          <div
            key={idx}
            className={`w-24 h-20 border-1 rounded-md cursor-pointer p-1 ${
              idx === currentIndex ? "border-gray-900" : "border-gray-300"
            }`}
            onMouseEnter={() => handleMouseEnter(src, idx)}
          >
            <Image
              src={src}
              alt={`Thumbnail ${idx}`}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>

      {/* Main Image with Navigation */}
      <div className="relative bg-gray-100 border border-gray-300 rounded-lg">
        {/* Main Image */}
        <Image
          src={mainImage}
          alt="Main Product Image"
          width="500"
          height="500"
        />
        {/* Left Arrow */}
        <button
          onClick={handlePrevImage}
          className="absolute right-12 bottom-2 transform -translate-y-1/2 bg-white border border-gray-300 p-2 rounded-full shadow hover:bg-gray-200"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>
        {/* Right Arrow */}
        <button
          onClick={handleNextImage}
          className="absolute right-2 bottom-2 transform -translate-y-1/2 bg-white border border-gray-300 p-2 rounded-full shadow hover:bg-gray-200"
        >
          <ChevronRight className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
}
