import ProductsSection from "@/components/core/ProductsSection";
import { prisma } from "@/lib/prisma";
import { Product } from "@/model/base.model";
import { Metadata } from "next";

export const revalidate = 60; // Revalidate every 60 seconds

// Metadata function for the Products page
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Products - Shivam Jewellers",
    description:
      "Explore our exquisite collection of handcrafted gold and silver jewelry. Discover the perfect piece to complement your style.",
    openGraph: {
      title: "Products - Shivam Jewellers",
      description:
        "Explore our exquisite collection of handcrafted gold and silver jewelry. Discover the perfect piece to complement your style.",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/products`,
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/images/jewelry-og-image.jpg`,
          alt: "Shivam Jewellers Jewelry Collection",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Products - Shivam Jewellers",
      description:
        "Explore our exquisite collection of handcrafted gold and silver jewelry. Discover the perfect piece to complement your style.",
      images: [
        `${process.env.NEXT_PUBLIC_BASE_URL}/images/jewelry-og-image.jpg`,
      ],
    },
  };
}

const Products = async () => {
  const products = (await prisma.product.findMany({
    orderBy: { createdAt: "desc" }, // Sort by creation date
  })) as Product[];

  return <ProductsSection products={products} />;
};

export default Products;
