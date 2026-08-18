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
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
