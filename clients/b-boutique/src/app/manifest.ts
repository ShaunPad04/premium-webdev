import type { MetadataRoute } from "next";
import { siteDescription } from "@/lib/site";

/* The web app manifest: the name, colours and icons a phone uses when the
   site is added to a home screen. Icons are the B mark (icon.svg) rendered
   at the two sizes browsers ask for. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "B Boutique Cleethorpes",
    short_name: "B Boutique",
    description: siteDescription,
    start_url: "/",
    display: "browser",
    background_color: "#FFFFFF",
    theme_color: "#0E0B0C",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
