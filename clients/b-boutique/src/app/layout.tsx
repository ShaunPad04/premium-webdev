import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ScrollReset } from "@/components/ScrollReset";
import { directionsHref } from "@/lib/nav";
import { hours, openingPhrase, shop } from "@/lib/shop";
import { SITE_ORIGIN, jsonLd } from "@/lib/site";
import "./globals.css";

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
/* Display face: Playfair Display, regular weight, since 2026-09-23.
 * Bodoni Moda until that morning; then Gloock, which Brad picked from a sheet
 * of free lookalikes for Olivera (a paid face) and then found "too thick and
 * bold" — it ships one heavy weight. Playfair at 400 keeps Olivera's high
 * contrast with a far lighter stroke, and it has a REAL italic, so the <em>
 * accents are drawn rather than slanted.
 *
 * Self-hosted by next/font at build time: the page still requests nothing
 * from Google on load (/privacy says so). */
const display = Playfair_Display({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/* The hours are DERIVED, not typed. This string said "Open Tuesday to Sunday"
   for a day after the client confirmed she opens seven days — sitting
   directly beside JSON-LD that correctly listed all seven. Every shared link
   and every search result carried the wrong one. */
const description =
  `An independent boutique on Sea View Street, Cleethorpes. Womenswear ` +
  `and homeware, chosen one piece at a time. ` +
  `Open ${openingPhrase()}.`;

/* Indexing is OFF until someone deliberately turns it on.
 *
 * This site is a concept build on a public production URL. It carries
 * twenty-six invented prices, FAQ answers still reading CLIENT TO CONFIRM,
 * and LocalBusiness structured data naming the real shop at its real address.
 * (The placeholder testimonials that used to head this list are gone — the
 * review rail was deleted on 2026-09-21. Nothing else on it has moved.)
 * Google cannot tell a demo from a shopfront: indexed, it would answer
 * "opening hours for B Boutique" with copy nobody has approved, and a wrong
 * answer attached to a real business is worse than no answer.
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
  title: {
    default: "B Boutique — Womenswear & Homeware, Sea View Street, Cleethorpes",
    template: "%s — B Boutique, Cleethorpes",
  },
  description,
  keywords: [
    "boutique Cleethorpes",
    "womens clothing Cleethorpes",
    "Sea View Street shops",
    "independent boutique North East Lincolnshire",
    "homeware Cleethorpes",
  ],
  openGraph: {
    title: "B Boutique — Sea View Street, Cleethorpes",
    description,
    type: "website",
    locale: "en_GB",
    siteName: "B Boutique",
  },
  robots,
};

/* Schema.org. For a shop people have to physically find, this is not
   decoration — it is what puts the hours and the pin in Google. */
function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: shop.name,
    description,
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
      className={`${display.variable} ${inter.variable} h-full antialiased`}
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
        <a
          href="#main"
          /* fixed, not absolute, and above the header rather than under it.
             As an absolutely-positioned z-50 element it had two failures, both
             measured: at the top of the page it rendered BEHIND the z-[60]
             header, so elementFromPoint at its own centre returned the
             wordmark link — a click on the visible skip control hit the wrong
             target; and because it scrolled with the document, focusing it
             after any scrolling put it at y -3584, so keyboard focus simply
             vanished off the top of the screen. Neither is visible until
             someone tabs, which is exactly who this control is for. */
          className="sr-only focus:not-sr-only focus:fixed focus:z-[70] focus:m-4 focus:rounded-full focus:bg-onyx focus:px-5 focus:py-3 focus:text-bone"
        >
          Skip to content
        </a>
        {/* No cart provider. The bag is an external store read through
            useSyncExternalStore, so every component that needs it subscribes
            directly and there is nothing to thread through the tree. See the
            note at the top of lib/useCart. */}
        {children}
      </body>
    </html>
  );
}
