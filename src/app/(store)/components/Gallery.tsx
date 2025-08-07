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
    <section className="w-full max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-4xl font-serif font-bold text-pink-600 mb-12 text-center tracking-wide drop-shadow-md">
        Our Offline Boutique
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative h-80 rounded-3xl shadow-2xl overflow-hidden cursor-pointer transform transition-transform duration-500 hover:scale-105 hover:shadow-pink-400/50"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center transition-opacity duration-500 hover:opacity-90"
              priority={index === 0} // prioritize first image for SEO/performance
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-70 pointer-events-none rounded-3xl"></div>
          </div>
        ))}
      </div>
    </section>
  );
}
