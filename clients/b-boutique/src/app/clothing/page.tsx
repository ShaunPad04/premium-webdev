import type { Metadata } from "next";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SocialStrip } from "@/components/SocialStrip";
import { ShortFaq } from "@/components/ShortFaq";
import { MotionLayer } from "@/components/MotionLayer";
import { CategoryBar } from "@/components/CategoryBar";
import { ProductGrid } from "@/components/ProductGrid";
import { Visit } from "@/components/Visit";
import { pendingPriceNotice } from "@/lib/catalogue";
import { clothingProducts } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Clothing",
  description:
    "Coats, jackets, knitwear, trousers, tops, skirts, co-ords and dresses at B Boutique, 18 Sea View Street, Cleethorpes. Chosen a piece at a time, and available online or on the rail.",
  alternates: { canonical: "/clothing" },
};

/* /clothing — what is on the rails.
 *
 * This page exists because the header promised it. CLOTHING and ACCESSORIES
 * both used to land on a section of the home page, which is a link that says
 * one thing and does another; that was the single most-repeated finding in the
 * design critique.
 *
 * ── 2026-09-21: it stopped being a lookbook ───────────────────────────────
 * It used to open with nine large category photographs — more than a screen
 * of doors before a single garment appeared — and put the actual pieces in a
 * short "in this week" strip below them. The client asked for the opposite,
 * and was right: somebody who has clicked CLOTHING has already chosen
 * clothing, and showing them nine more choices is a gate rather than a page.
 *
 * It now leads with every clothing product in the catalogue, in the shop's
 * own dense grid, with the categories as a filter bar above it. The comment
 * that used to sit here said there was "no price, no per-item page, the
 * boutique sells in person" — that has been untrue since the shop was built:
 * there is a /shop/[slug] under every card and a real basket. The prices are
 * still invented, which is a different problem and is flagged on the page. */
export default function ClothingPage() {
  const items = clothingProducts();

  return (
    <>
      <MotionLayer />
      {/* No PageMasthead (2026-09-26, Brad): the photograph band above the
          rails is gone and the header is solid, as on the bag. The page's one
          h1 is the category name, over the pieces. */}
      <Nav solid />
      <main id="main" className="flex-1">

        <section aria-labelledby="clothing-all" className="page-section cat-page">
          <div className="page-inner">
            <div className="page-head">
              {/* The visible heading block came off (2026-09-26, Brad): the
                  category bar and the pieces are the page. The h1 stays for
                  screen readers and search engines. */}
              <h1 id="clothing-all" className="sr-only">Clothing</h1>
              {pendingPriceNotice() ? (
                <p className="page-pending">{pendingPriceNotice()}</p>
              ) : null}
            </div>

            {/* The categories, as a filter above the stock rather than nine
                large photographs in front of it. See CategoryBar.tsx. */}
            <CategoryBar current="all" />

            <ProductGrid items={items} />
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
