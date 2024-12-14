import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.shivamjewellers.co.in/",
      lastModified: new Date("2024-12-09T16:26:20+00:00"),
      priority: 1.0,
    },
  ];
}
