import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shivam Jewellers",
    short_name: "Shivam Jewellers",
    description:
      "BIS Hallmark certified gold and silver jewellery from Deoria, UP",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf8f4",
    theme_color: "#b76e79",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
