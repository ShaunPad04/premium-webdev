import type { Metadata } from "next";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { PageMasthead } from "@/components/PageMasthead";
import { CategoryGrid } from "@/components/CategoryGrid";
import { PieceGrid } from "@/components/PieceGrid";
import { Visit } from "@/components/Visit";
import { CLOTHING_CATEGORY_NAMES, clothingCards, newInFor } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Clothing",
  description:
    "Coats, jackets, trousers, skirts, dresses, denim, shirts and knitwear on the rails at B Boutique, 18 Sea View Street, Cleethorpes. Chosen a piece at a time and sold in the shop.",
  alternates: { canonical: "/clothing" },
};

/* /clothing — what is on the rails.
 *
 * This page exists because the header promised it. CLOTHING and ACCESSORIES
 * both used to land on a section of the home page, which is a link that says
 * one thing and does another; that was the single most-repeated finding in the
 * design critique.
 *
 * ── What it does NOT do ───────────────────────────────────────────────────
 * It is not a shop. There is no basket, no price, no stock count, no size
 * availability and no per-item page, because none of that exists: the boutique
 * sells in person, and inventing any of it would be inventing facts about a
 * real business. What the page can honestly show is the categories, the pieces
 * that are actually in the data, and where the door is — so that is what it
 * shows, and it says so in as many words rather than leaving the reader
 * hunting for an "add to bag" that is never coming. */
export default function ClothingPage() {
  const pieces = newInFor(CLOTHING_CATEGORY_NAMES);

  return (
    <>
      <MotionLayer />
      <Nav />
      <main id="main" className="flex-1">
        <PageMasthead
          eyebrow="The rails"
          title="Clothing"
          lede="Coats, jackets, trousers, skirts, dresses, denim, shirts, tops and knitwear. One room, one rail of each, and every piece picked by hand rather than ordered by the pack."
        />

        <section aria-labelledby="clothing-cats" className="page-section">
          <div className="page-inner">
            <div className="page-head">
              <h2 id="clothing-cats" className="page-h2">
                What hangs where.
              </h2>
              <p className="page-lede">
                Nine categories, in the order the rails run through the shop.
              </p>
            </div>
            <CategoryGrid cards={clothingCards} />
          </div>
        </section>

        <section aria-labelledby="clothing-new" className="page-section is-alt">
          <div className="page-inner">
            <div className="page-head">
              <h2 id="clothing-new" className="page-h2">
                In this week.
              </h2>
              <p className="page-lede">
                The clothing that has landed most recently. Stock changes
                weekly, so this is a snapshot rather than a catalogue — and
                everything here sells in the shop, not online.
              </p>
            </div>
            <PieceGrid pieces={pieces} idPrefix="clothing" />
          </div>
        </section>

        <Visit />
      </main>
      <Footer />
    </>
  );
}
