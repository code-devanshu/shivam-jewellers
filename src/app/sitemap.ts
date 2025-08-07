import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.shivamjewellers.co.in/",
      lastModified: new Date("2024-12-31T17:33:21+00:00"),
      priority: 1.0,
    },
  ];
}
