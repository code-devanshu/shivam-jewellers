import type { MetadataRoute } from "next";
import { getAllProducts, getCategories } from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories(),
  ]);

  const productUrls: MetadataRoute.Sitemap = products
    .filter((p) => p.isAvailable)
    .map((p) => ({
      url: `${siteUrl}/products/${p.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const categoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${siteUrl}/products?category=${cat.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
    ...productUrls,
    ...categoryUrls,
  ];
}
