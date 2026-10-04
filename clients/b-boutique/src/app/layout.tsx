import type { Metadata } from "next";
import { MagneticButtons } from "@/components/MagneticButtons";
import { PageTransition } from "@/components/PageTransition";
import { AddedToast } from "@/components/AddedToast";
import { Hanken_Grotesk } from "next/font/google";
import { ScrollReset } from "@/components/ScrollReset";
import { directionsHref, socials } from "@/lib/nav";
import { hours, shop } from "@/lib/shop";
import { formatPriceShort, isBuyable, products } from "@/lib/catalogue";
import { SHARE_IMAGE, SITE_ORIGIN, absolute, jsonLd, siteDescription } from "@/lib/site";
import "./globals.css";
import "./type.css";

/* Two faces, and only two.
 *
 * Bodoni Moda carries the whole editorial voice — the wordmark, the
 * manifesto, section headings, category names, the address, the giant footer
 * wordmark. It is the approved face and it does not change. Weight stays at
 * 400: a faked bold Bodoni loses the thick/thin stress that is the entire
 * reason for choosing it.
 *
 * Inter takes every piece of UI: navigation, labels, buttons, prices, FAQ,
 * numbers, microcopy. It replaces the three faces that used to split that
 * job between them — Jost for body, Archivo for the corner menu, JetBrains
 * Mono for labels and numbers. Three UI faces was one more idea than the
 * page needed, and it cost three font downloads to say the same thing.
 *
 * The old comment here argued against Playfair + Inter as the default pairing
 * on every boutique site. That still holds, and this is not it: the display
 * face is Bodoni, which is a far sharper, higher-contrast letter than
 * Playfair. Inter is doing the quiet half of the job, not the loud one. */
/* One pair everywhere (2026-09-24, Brad: "too many fonts... two, max
 * three; feminine but modern, not generic"; of three rendered options he
 * chose C). Display: Bodoni Moda, the fashion-magazine Didone, for large
 * headings and product names ONLY, in sentence case, never in capitals.
 * Everything else (navigation, labels, body, buttons, prices, marquee):
 * Hanken Grotesk, a clean contemporary grotesk that replaces DM Sans.
 * Self-hosted by next/font at build time; nothing is requested from Google
 * on load (/privacy says so).
 *
 * Since 2026-09-26 (Brad, option C) headings are Hanken capitals and the
 * serif is kept for sub-headings and product names: see type.css.
 * Since 2026-09-27 (Brad) Hanken is the only typeface and Bodoni is no
 * longer loaded; --font-display points at Hanken in type.css. */

/* The hero's "B Boutique" is Bodoni Moda (Brad, 2026-09-27), drawn as
   outlines in HeroName.tsx since 2026-09-28 rather than loaded as a font:
   one line did not justify a font file and a late swap on the LCP. */

const body = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/* The hours are DERIVED, not typed. This string said "Open Tuesday to Sunday"
   for a day after the client confirmed she opens seven days — sitting
   directly beside JSON-LD that correctly listed all seven. Every shared link
   and every search result carried the wrong one. */
const description = siteDescription;

/* Indexing is OFF until someone deliberately turns it on.
 *
 * Production sets ALLOW_INDEXING=true; previews do not, so a preview URL is
 * never indexed beside the real domain. Google cannot tell a draft from a
 * shopfront, and a wrong answer attached to a real business is worse than
 * no answer.
 *
 * Default-deny rather than default-allow, because the failure modes are not
 * symmetric. Forgetting to switch this ON costs a redeploy. Forgetting to
 * switch it OFF puts unapproved claims about a real address into search
 * results, where they persist long after the page is fixed.
 *
 * To go live: set ALLOW_INDEXING=true in the Vercel project's environment
 * variables and redeploy. Read at build time, so it is a deploy-time
 * decision — which is right, since going live IS a deploy.
 *
 * Deliberately NOT paired with a robots.txt Disallow. A disallow blocks the
 * crawl, and a crawler that never fetches the page never reads the noindex
 * below — Google can then list a bare URL it was never allowed to look at.
 * Letting it crawl and telling it not to index is the combination that
 * actually keeps the page out. */
const indexable = process.env.ALLOW_INDEXING === "true";

const robots: Metadata["robots"] = indexable
  ? { index: true, follow: true }
  : {
      index: false,
      follow: false,
      nocache: true,
      /* Google honours the generic directive, but its own bot takes extra
         ones — noimageindex keeps the photography out of Images, where a
         picture outlives the page it came from. */
      googleBot: { index: false, follow: false, noimageindex: true },
    };

/* The site's own origin, which every canonical URL and every Open Graph image
 * URL on the site is resolved against.
 *
 * This was hardcoded to https://bboutique.co.uk — a domain nobody ever bought.
 * The real one, registered 2026-09-20, is bboutiqueclee.com. A metadataBase
 * pointing at a domain the business does not own is not a cosmetic error: it
 * puts a canonical tag on every page naming somebody else's address, and hands
 * every social preview an image URL that does not resolve.
 *
 * NEXT_PUBLIC_SITE_URL wins where it is set, so a preview deployment can
 * describe itself rather than claiming to be production. It is read at build
 * time and must be absolute, so a malformed value is caught by the build
 * rather than by a customer.
 *
 * Moved to `lib/site.ts` on 2026-09-22 so the product structured data reads
 * the same value. Two copies of an origin is two places for a canonical tag
 * and a schema image URL to disagree about what this website is called. */

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  /* iOS Safari turns anything that looks like an address, phone number or
     email into a link of its own and draws a dotted underline under it. It
     did exactly that to the "18 Sea View Street, Cleethorpes." slide title
     (client screenshot, 2026-09-23). Every real address and email on the
     site is already a deliberate link where one is wanted. */
  formatDetection: { address: false, telephone: false, email: false, date: false },
  title: {
    default: "B Boutique | Womenswear & Homeware in Cleethorpes",
    template: "%s | B Boutique Cleethorpes",
  },
  description,
  /* Google's HTML-tag ownership checks. The first is Merchant Center's
     (Hayley's account 5868121065, 2026-10-04); it is public in the page by
     design, and removing it un-verifies the shop. A Search Console token
     pasted into Vercel as GOOGLE_SITE_VERIFICATION is emitted beside it. */
  verification: {
    google: [
      "DN0ExUFsUf5dV7Rugg4tapPN3f3Lczfu5ji8Q1uxZmM",
      ...(process.env.GOOGLE_SITE_VERIFICATION ? [process.env.GOOGLE_SITE_VERIFICATION] : []),
    ],
  },
  keywords: [
    "boutique Cleethorpes",
    "women's clothing Cleethorpes",
    "Sea View Street shops",
    "independent boutique North East Lincolnshire",
    "homeware Cleethorpes",
  ],
  openGraph: {
    title: "B Boutique | Womenswear & Homeware in Cleethorpes",
    description,
    url: "/",
    type: "website",
    locale: "en_GB",
    siteName: "B Boutique",
    images: [SHARE_IMAGE],
  },
  twitter: { card: "summary_large_image", images: [SHARE_IMAGE.url] },
  robots,
};

function priceRange() {
  const p = products.filter(isBuyable).map((x) => x.priceP);
  return `${formatPriceShort(Math.min(...p))}–${formatPriceShort(Math.max(...p))}`;
}

/* Schema.org. For a shop people have to physically find, this is not
   decoration — it is what puts the hours and the pin in Google. */
function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "@id": absolute("/#store"),
    name: shop.name,
    alternateName: "B Boutique Cleethorpes",
    url: absolute("/"),
    description,
    image: [absolute(SHARE_IMAGE.url)],
    logo: absolute("/apple-icon.png"),
    email: shop.email || undefined,
    sameAs: socials.map((s) => s.href),
    /* Derived from the catalogue, so it follows the stock. */
    priceRange: priceRange(),
    address: {
      "@type": "PostalAddress",
      streetAddress: shop.street,
      addressLocality: shop.town,
      addressRegion: shop.county,
      postalCode: shop.postcode,
      addressCountry: shop.country,
    },
    /* A point, not just a string. Search engines geocode the address anyway,
       but geocoding a UK street address is a guess and this is the shop's
       actual position — worth having for a business whose whole call to
       action is "come to this door". */
    geo: {
      "@type": "GeoCoordinates",
      latitude: shop.lat,
      longitude: shop.lng,
    },
    hasMap: directionsHref,
    openingHoursSpecification: hours
      .filter((d) => d.hours !== null)
      .map((d) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${d.day}`,
        opens: `${String(d.hours!.open).padStart(2, "0")}:00`,
        closes: `${String(d.hours!.close).padStart(2, "0")}:00`,
      })),
    currenciesAccepted: "GBP",
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-GB"
      className={`${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bone text-onyx">
        {/* Every forward navigation lands at the top of the new page; back
            and forward still restore the reader's place. Here rather than in
            MotionLayer, which is deferred until the browser goes idle — a
            click can easily beat that — and here rather than per-page,
            because twelve copies is twelve chances to miss one. Renders
            nothing. See ScrollReset.tsx. */}
        <ScrollReset />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(localBusinessSchema()) }}
        />
        {/* No skip link (2026-09-27, Brad asked for it gone). Keyboard and
            screen-reader users still reach the content through the page's
            landmarks: <header>, <nav>, <main id="main"> and <footer>. */}
        {/* No cart provider. The bag is an external store read through
            useSyncExternalStore, so every component that needs it subscribes
            directly and there is nothing to thread through the tree. See the
            note at the top of lib/useCart. */}
        <MagneticButtons />
        <PageTransition>{children}</PageTransition>
        <AddedToast />
      </body>
    </html>
  );
}
