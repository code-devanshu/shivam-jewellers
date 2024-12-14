import Image from "next/image";

const images = [
  {
    src: "/images/shop1.webp",
    alt: "Jewelry shop interior",
  },
  { src: "/images/shop2.webp", alt: "Jewelry display case" },
  {
    src: "/images/shop3.webp",
    alt: "Jeweler working on a piece",
  },
  {
    src: "/images/shop4.webp",
    alt: "Elegant necklace display",
  },
];

export default function Gallery() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <h2 className="text-3xl font-semibold text-yellow-400 mb-8 text-center">
        Our Offline Boutique
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative h-72 cursor-pointer overflow-hidden rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105"
          >
            <Image
              src={image.src}
              alt={image.alt}
              layout="fill"
              objectFit="cover"
              className="transition-opacity duration-300 ease-in-out hover:opacity-80"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
