import type { MetadataRoute } from "next";
import { absolute } from "@/lib/site";

/* Crawl everything but the API. Pages that must stay out of Google (/stock,
 * /bag, checkout success, and the whole site until ALLOW_INDEXING is set) say
 * so with a noindex tag, and a crawler has to be allowed to fetch a page to
 * read that tag — see the note on `robots` in app/layout.tsx. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: absolute("/sitemap.xml"),
  };
}
