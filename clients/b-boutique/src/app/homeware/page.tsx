import type { Metadata } from "next";
import Link from "next/link";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SocialStrip } from "@/components/SocialStrip";
import { ShortFaq } from "@/components/ShortFaq";
import { MotionLayer } from "@/components/MotionLayer";
import { ProductPhoto } from "@/components/ProductPhoto";
import { Price } from "@/components/Price";
import { Visit } from "@/components/Visit";
import { isBuyable, productsIn } from "@/lib/catalogue";
import { categories, shop } from "@/lib/shop";

const homeware = categories.find((c) => c.slug === "homeware")!;

export const metadata: Metadata = {
  title: "Homeware",
  description:
    "Homeware at B Boutique, 18 Sea View Street, Cleethorpes — available online or in the shop.",
  alternates: { canonical: "/homeware" },
};

/* /homeware — the category's own page, built 2026-09-22.
 *
 * Until today "Homeware" in the corner menu, the header's Shop menu, the
 * footer and the Accessories page all pointed at /#homeware: a section on the
 * home page carrying stock photography of shelves, not one of the three
 * pieces she actually sells. The client clicked it, landed on the home page,
 * and asked where the homeware was. Clothing had real category pages; this
 * one had been left as an anchor.
 *
 * It lists what the catalogue holds in Homeware — the Tomato Vase, the Banana
 * Jar and the Bell Vase today — through the same ProductGrid the clothing
 * rails use, so prices, quick-add and the "Price to confirm" state all come
 * from the one place. It is not under /clothing because a clothing page
 * listing ceramic vases is not a clothing page (see lib/pages.ts).
 *
 * The lede is the shop's own category line from shop.ts, not new copy. */
export default function HomewarePage() {
  const items = productsIn("Homeware");

  return (
    <>
      <MotionLayer />
      {/* No PageMasthead (2026-09-26, Brad): the photograph band above the
          rails is gone and the header is solid, as on the bag. The page's one
          h1 is the category name, over the pieces. */}
      <Nav solid />
      <main id="main" className="flex-1">

        {/* Homeware as object features (2026-09-27, Brad picked B of three
            21st-ui-explore directions; A the Clothing grid, C a row of
            cards). Three sculptural pieces read better one at a time than
            as a grid built for forty: each gets a row, alternating sides,
            with her own one-line description and a way to the piece. */}
        <section aria-labelledby="home-items" className="page-section cat-page hwf">
          <div className="page-inner">
            <h1 id="home-items" className="hwf-title">{homeware.name}</h1>
            <p className="hwf-note">{homeware.note}</p>

            {items.length ? (
              items.map((p, i) => (
                <article key={p.slug} className="hwf-row" data-flip={i % 2 ? "" : undefined} aria-labelledby={`hwf-${p.slug}`}>
                  {/* The photograph repeats the button's link for a pointer;
                      one tab stop per piece, so it is hidden from the
                      keyboard and screen readers. */}
                  <Link href={`/shop/${p.slug}`} className="hwf-media" tabIndex={-1} aria-hidden="true">
                    <ProductPhoto photo={p.photo} square alt="" sizes="(min-width: 900px) 45vw, 100vw" className="hwf-img" />
                  </Link>
                  <div className="hwf-text">
                    <p className="hwf-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</p>
                    <h2 id={`hwf-${p.slug}`} className="hwf-name">{p.name}</h2>
                    <p className="hwf-short">{p.short}</p>
                    {isBuyable(p) ? (
                      <p className="hwf-price"><Price priceP={p.priceP} slug={p.slug} /></p>
                    ) : (
                      <p className="hwf-price prod-price--pending">Price to confirm</p>
                    )}
                    <Link href={`/shop/${p.slug}`} className="hwf-btn">
                      View the piece <span className="sr-only">: {p.name}</span> <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                </article>
              ))
            ) : (
            <p className="page-body">
              No homeware online at the moment. Email{" "}
              <a href={`mailto:${shop.email}`} className="cf-fail-link">
                {shop.email}
              </a>{" "}
              and ask what has just come in, or{" "}
              <Link href="/clothing" className="cf-fail-link">
                see everything in the shop
              </Link>
              .
            </p>
            )}
          </div>
        </section>

        <Visit />
      </main>
      <SocialStrip />
      <ShortFaq />
      <Footer />
    </>
  );
}
