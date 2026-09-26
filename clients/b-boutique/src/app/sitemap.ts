import type { MetadataRoute } from "next";
import { products } from "@/lib/catalogue";
import { clothingCards } from "@/lib/pages";
import { absolute } from "@/lib/site";

/* Every page a customer can land on from Google. Left out on purpose: /bag,
 * /checkout and /stock (noindex, and nothing a search should open on), and
 * /api. Product and category lists come from the same arrays the routes are
 * generated from, so a new piece is in the sitemap the moment it is on sale. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "/", "/clothing", "/homeware", "/about", "/contact",
    "/faq", "/delivery", "/returns", "/privacy", "/terms",
  ];
  return [
    ...pages.map((p) => ({ url: absolute(p), priority: p === "/" ? 1 : 0.6 })),
    ...clothingCards.map((c) => ({ url: absolute(`/clothing/${c.slug}`), priority: 0.7 })),
    ...products.map((p) => ({ url: absolute(`/shop/${p.slug}`), priority: 0.8 })),
  ];
}
