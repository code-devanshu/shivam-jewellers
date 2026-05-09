import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";

type Props = { category: Category };

export default function CategoryCard({ category }: Props) {
  return (
    <Link href={`/products?category=${category.slug}`} className="group block">
      <div className="relative aspect-square rounded-2xl overflow-hidden border border-rose-gold-light/30 shadow-sm hover:shadow-md transition-all duration-200">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blush to-rose-gold-light/30 flex items-center justify-center text-3xl text-rose-gold">
            ✦
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-sm font-semibold text-white">{category.name}</p>
        </div>
      </div>
    </Link>
  );
}
