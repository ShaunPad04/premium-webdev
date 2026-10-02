import type { MetadataRoute } from "next";
import { products } from "@/lib/catalogue";
import { clothingCards } from "@/lib/pages";
import { absolute } from "@/lib/site";
import priceDates from "@/data/price-dates.json";

/* Every page a customer can land on from Google. Left out on purpose: /bag,
 * /checkout and /stock (noindex, and nothing a search should open on), and
 * /api. Product and category lists come from the same arrays the routes are
 * generated from, so a new piece is in the sitemap the moment it is on sale.
 *
 * lastModified only where it is known: the day Hayley last changed that
 * piece's price on /stock (scripts/fetch-prices.mjs). A date on every URL
 * that is really the build date teaches Google to ignore them all. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "/", "/clothing", "/homeware", "/about", "/contact",
    "/delivery", "/returns", "/privacy", "/terms",
  ];
  return [
    ...pages.map((p) => ({ url: absolute(p), priority: p === "/" ? 1 : 0.6 })),
    ...clothingCards.map((c) => ({ url: absolute(`/clothing/${c.slug}`), priority: 0.7 })),
    ...products.map((p) => {
      const changed = (priceDates as Record<string, string>)[p.slug];
      return { url: absolute(`/shop/${p.slug}`), priority: 0.8, ...(changed ? { lastModified: changed } : {}) };
    }),
  ];
}
