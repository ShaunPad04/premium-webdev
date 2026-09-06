import type { Metadata } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";
import { directionsHref } from "@/lib/nav";
import { shop, hours } from "@/lib/shop";
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
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  /* Normal only. The italic axis was requested and preloaded — 25 KB on the
     critical path, competing with the hero image for a throttled connection —
     and nothing on the site uses it: every italic face reported `unloaded`
     and a sweep of the rendered page found zero elements computing
     font-style: italic. Add it back the day something is set in italic. */

  /* `preload: false` was tried here and rejected on measurement, and the case
   * against it got stronger on 2026-09-05.
   *
   * The reasoning was sound on paper at the time: the LCP element was then the
   * hero philosophy line, which is Inter, and Bodoni's latin subset is 25.8 KB
   * of competing high-priority bytes on the same throttled connection. Taking
   * it off the preload should hand that bandwidth to Inter and the hero
   * photograph.
   *
   * That premise is now gone. The hero philosophy line was removed at the
   * client's request, and LCP moved to the header wordmark — read from the
   * trace, `header.fixed > div.relative > a.display`, which is Bodoni. The
   * font this preload fetches is now the font the largest paint waits on, so
   * dropping it would delay LCP directly rather than merely risk a flash.
   *
   * Five Lighthouse runs each way, same build, same quiet machine:
   * preloaded  median 88 (87-92), unpreloaded median 89 (87-90). The spread
   * swallows the difference — there is no gain here, only a different set of
   * dice. And it is not free: Bodoni sets the wordmark in the header, which
   * is above the fold, so dropping the preload puts a fallback-serif flash on
   * the brand mark on every cold load. Paying for that with nothing is a bad
   * trade twice over. Do not re-run this one. */
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "An independent boutique on Sea View Street, Cleethorpes. Womenswear, accessories and homeware, chosen one piece at a time. Open Tuesday to Sunday, 10 till 4.";

/* Indexing is OFF until someone deliberately turns it on.
 *
 * This site is a concept build on a public production URL. It carries
 * placeholder testimonials, six FAQ answers still reading CLIENT TO CONFIRM,
 * and LocalBusiness structured data naming the real shop at its real address.
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

export const metadata: Metadata = {
  metadataBase: new URL("https://bboutique.co.uk"),
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
      className={`${bodoni.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bone text-onyx">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema()) }}
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
