import Image from "next/image";
import type { Metadata } from "next";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { PageMasthead } from "@/components/PageMasthead";
import { PieceGrid } from "@/components/PieceGrid";
import { Visit } from "@/components/Visit";
import { ImageSlot } from "@/components/ImageSlot";
import { accessoriesCard, newInFor } from "@/lib/pages";
import { categories } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Accessories",
  description:
    "Bags, scarves and small gold things at B Boutique, 18 Sea View Street, Cleethorpes. Chosen a piece at a time and sold in the shop.",
  alternates: { canonical: "/accessories" },
};

/* /accessories.
 *
 * Two pieces are in the data — a leather crossbody and a silk twill scarf —
 * and that is genuinely all this project holds. So the page is built as an
 * editorial page rather than as a grid pretending to be a department: one
 * large photograph, the category's own line, and the two pieces shown as what
 * they are.
 *
 * The alternative was to pad it, and padding here means inventing stock for a
 * real shop. Two honest pieces and a photograph reads as considered; six
 * invented ones read as a catalogue right up until somebody comes in and asks
 * for one. */
export default function AccessoriesPage() {
  const pieces = newInFor(["Accessories"]);

  return (
    <>
      <MotionLayer />
      <Nav />
      <main id="main" className="flex-1">
        <PageMasthead
          eyebrow="Small things"
          title="Accessories"
          lede={accessoriesCard.note}
        />

        <section aria-labelledby="acc-lead" className="page-section">
          <div className="page-inner acc-lead">
            <div className="acc-lead-media">
              {accessoriesCard.image ? (
                <Image
                  src={accessoriesCard.image}
                  alt={accessoriesCard.alt ?? ""}
                  fill
                  /* Measured: the media column is 52% of a 1440 page less the
                     editorial gutter, which is 45.8vw; one column below 1024. */
                  sizes="(min-width: 1024px) 47vw, 92vw"
                  className="cat-img"
                />
              ) : null}
            </div>
            <div className="acc-lead-copy">
              <h2 id="acc-lead" className="page-h2">
                The last ten per cent.
              </h2>
              <p className="page-body">
                A bag, a scarf, something gold and small enough to lose. The
                pieces that decide whether an outfit reads as finished or as
                thrown on — and the easiest things in the shop to get wrong
                from a photograph, which is most of why they are worth handling
                in person.
              </p>
              <p className="page-body">
                Accessories turn over faster than the rails do. What is here is
                what has landed most recently rather than a standing range.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="acc-pieces" className="page-section is-alt">
          <div className="page-inner">
            <div className="page-head">
              <h2 id="acc-pieces" className="page-h2">
                In this week.
              </h2>
              {/* No holding, reserving or posting promised here. Whether the
                  shop puts things aside is in the FAQ and is still marked
                  temporary — an unconfirmed policy stated as fact on a
                  category page is the same error, in a place nobody would
                  think to check. */}
              <p className="page-lede">
                Sold in the shop, not online. The phone number is at the bottom
                of the page if you want to ask about something before you come
                down.
              </p>
            </div>
            <PieceGrid pieces={pieces} idPrefix="accessories" />
          </div>
        </section>

        {/* The page has two pieces in it, because two is what the project
            actually holds. Rather than pad the grid with invented stock — the
            one thing that must never happen on a real shop's site — the page
            ends by sending the reader somewhere real. Both destinations exist,
            both carry their own photograph, and both notes are the shop's own
            words out of shop.ts. */}
        <section aria-labelledby="acc-also" className="page-section">
          <div className="page-inner">
            <div className="page-head">
              <h2 id="acc-also" className="page-h2">
                Also in the shop.
              </h2>
              <p className="page-lede">
                Accessories are the smallest part of one room. The rest of it
                is through here.
              </p>
            </div>

            <ul className="cross">
              {[
                {
                  href: "/clothing",
                  label: "Clothing",
                  note: "Jackets, trousers, dresses, tops and knitwear.",
                  slot: "panel-knitwear",
                },
                {
                  href: "/#homeware",
                  label: "Homeware",
                  note: categories.find((c) => c.slug === "homeware")!.note,
                  slot: "panel-homeware",
                },
              ].map((item, i) => (
                <li key={item.href} className="cross-item" style={{ "--i": i } as React.CSSProperties}>
                  {/* The whole card is one link, so the target is the card and
                      not a five-word phrase — and there is exactly one link per
                      destination, so a screen reader is not read the same href
                      three times. The arrow is decorative. */}
                  <a href={item.href} className="cross-link">
                    <span className="cross-media">
                      <ImageSlot
                        tone="marble"
                        seed={61 + i}
                        slot={item.slot}
                        /* Decorative. The label beside it names the
                           destination, so alt text here would be read twice
                           and would say less than the link already does. */
                        alt=""
                        sizes="(min-width: 900px) 46vw, 88vw"
                        className="absolute inset-0 h-full w-full"
                      />
                    </span>
                    <span className="cross-body">
                      <span className="cross-label">
                        {item.label}
                        <span className="cross-arrow" aria-hidden="true">&rarr;</span>
                      </span>
                      <span className="cross-note">{item.note}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Visit />
      </main>
      <Footer />
    </>
  );
}
