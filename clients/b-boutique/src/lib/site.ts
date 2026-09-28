import { openingPhrase } from "./shop";

/** The site description: the home page, the layout default and the store
 *  JSON-LD. The hours are derived, never typed. */
export const siteDescription =
  `An independent boutique at 18 Sea View Street, Cleethorpes. Womenswear ` +
  `and homeware, chosen one piece at a time. Open ${openingPhrase()}.`;

/** The origin every absolute URL on this site is built from.
 *
 *  It lived in `app/layout.tsx` until the product structured data needed it
 *  too, and two copies of an origin is two places for a canonical tag and a
 *  schema image to disagree about what this website is called. One export,
 *  both readers.
 *
 *  `NEXT_PUBLIC_SITE_URL` wins where it is set, so a preview deployment can
 *  describe itself. The fallback is the domain the client actually owns,
 *  registered 2026-09-20 — never a guessed one. */
export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bboutiqueclee.com";

/** An absolute URL for a path that is already rooted, e.g. `/img/x.jpg`.
 *  Structured data needs absolute URLs; a relative one is silently dropped. */
export const absolute = (path: string) => new URL(path, SITE_ORIGIN).toString();

/** JSON-LD, safe to drop into a `<script>` via dangerouslySetInnerHTML.
 *
 *  `JSON.stringify` escapes quotes and backslashes and stops there — it does
 *  NOT escape `<`, so a value containing the literal text `</script>` closes
 *  the tag and everything after it is parsed as markup. The values here are
 *  the client's own product and colour names rather than anything a visitor
 *  types, so this is defence rather than a live hole; it costs one replace
 *  and removes the whole class. `<` is valid JSON and parses back to
 *  `<`, so the data a crawler reads is unchanged. */
export const jsonLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

/** The share image every page uses unless it has its own: her shopfront,
 *  the whole fascia in frame (1.91:1, the size link previews expect). */
export const SHARE_IMAGE = {
  url: "/img/og-shopfront.jpg",
  width: 1024,
  height: 536,
  alt: "The B Boutique shopfront on Sea View Street, Cleethorpes",
};

/** Page metadata with its own share card. Next merges `openGraph` shallowly,
 *  so a page that sets none inherits the layout's title for every link it is
 *  shared on; this gives each page its own title, description, URL and image. */
export function pageMeta({
  path,
  title,
  description,
  image = SHARE_IMAGE,
}: {
  path: string;
  title?: string | { absolute: string };
  description: string;
  image?: { url: string; width?: number; height?: number; alt: string };
}) {
  const name = typeof title === "object" ? title.absolute : title;
  const shareTitle = name ? (typeof title === "object" ? name : `${name} | B Boutique Cleethorpes`) : "B Boutique | Womenswear & Homeware in Cleethorpes";
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      title: shareTitle,
      description,
      url: path,
      type: "website" as const,
      locale: "en_GB",
      siteName: "B Boutique",
      images: [image],
    },
    twitter: { card: "summary_large_image" as const, title: shareTitle, description, images: [image.url] },
  };
}
