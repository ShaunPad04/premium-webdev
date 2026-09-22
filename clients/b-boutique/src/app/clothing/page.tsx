import type { Metadata } from "next";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { PageMasthead } from "@/components/PageMasthead";
import { CategoryBar } from "@/components/CategoryBar";
import { ProductGrid } from "@/components/ProductGrid";
import { Visit } from "@/components/Visit";
import { pendingPriceNotice } from "@/lib/catalogue";
import { clothingProducts } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Clothing",
  description:
    "Coats, jackets, trousers, skirts, dresses, denim, shirts and knitwear at B Boutique, 18 Sea View Street, Cleethorpes. Chosen a piece at a time, and available online or on the rail.",
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
      <Nav />
      <main id="main" className="flex-1">
        <PageMasthead
          eyebrow="The rails"
          title="Clothing"
          lede="Coats, jackets, trousers, skirts, dresses, denim, shirts, tops and knitwear. One room, one rail of each, and every piece picked by hand rather than ordered by the pack."
          aside={
            <p className="pm-phone">
              <span className="pm-phone-label">On the rails</span>
              <span className="pm-phone-number">
                {items.length} {items.length === 1 ? "piece" : "pieces"}
              </span>
            </p>
          }
        />

        <section aria-labelledby="clothing-all" className="page-section">
          <div className="page-inner">
            <div className="page-head">
              <h2 id="clothing-all" className="page-h2">
                Everything on the rails.
              </h2>
              <p className="page-lede">
                Stock changes weekly, so this is what is in now rather than a
                standing range. Everything here can be bought online or seen on
                the rail. Narrow it by category above.
              </p>
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
      <Footer />
    </>
  );
}
