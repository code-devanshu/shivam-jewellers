"use client";
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HomeCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    "/images/blog.webp",
    "/images/home-img.webp",
    "/images/blog.webp",
  ];

  // Auto-slide logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000); // Change slide every 3 seconds
    return () => clearInterval(interval);
  }, [slides.length]);

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
            transition: "transform 0.5s ease",
          }}
          className="flex"
        >
          {slides.map((src, index) => (
            <CarouselItem key={index} className="w-full">
              <Image
                src={src}
                className="w-screen h-[60vh]"
                width="1200"
                height="1200"
                alt={`Slide ${index + 1}`}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        className="absolute top-1/2 -translate-y-1/2 left-4 z-10 p-2 bg-white rounded-full shadow-md cursor-pointer"
      >
        <ChevronLeft className="w-6 h-6 text-black" />
      </button>

      {/* Next Button */}
      <button
        onClick={handleNext}
        className="absolute top-1/2 -translate-y-1/2 right-4 z-10 p-2 bg-white rounded-full shadow-md cursor-pointer"
      >
        <ChevronRight className="w-6 h-6 text-black" />
      </button>
    </div>
  );
}
