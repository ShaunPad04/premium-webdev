import Link from "next/link";

import type { Product } from "@/lib/catalogue";
import { formatPriceShort, isBuyable } from "@/lib/catalogue";
import { ProductPhoto } from "./ProductPhoto";

/* The shop's product grid.
 *
 * Unlike CategoryGrid, these ARE links — there is a page under each one now,
 * which is the whole difference between a catalogue and a lookbook. The whole
 * card is the link so the target is the card rather than a two-word name, and
 * there is one link per product rather than three pointing at the same href.
 *
 * The price is rendered here from pence. It is the only place on the listing
 * that touches money and it never does arithmetic — formatPrice divides once,
 * at the edge. */
/* `idPrefix` is gone. It existed only to disambiguate the SVG filter id that
   ImageSlot generates for its designed fallback, and a <picture> of a real
   photograph has no filter and no id to collide. */
export function ProductGrid({ items }: { items: Product[] }) {
  return (
    <ul className="prod-grid">
      {items.map((p, i) => (
        <li key={p.slug} className="prod" style={{ "--i": i } as React.CSSProperties}>
          <Link href={`/shop/${p.slug}`} className="prod-link">
            <span className="prod-media">
              <ProductPhoto
                photo={p.photo}
                square={p.category === "Homeware"}
                /* Decorative: the name is in real text directly beneath, so
                   alt text here would be announced twice and the data holds
                   nothing more useful to say without inventing it. */
                alt=""
                sizes="(min-width: 1024px) 23vw, (min-width: 640px) 31vw, 44vw"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </span>
            <span className="prod-body">
              <span className="prod-cat">{p.category}</span>
              <span className="prod-name">{p.name}</span>
              {/* A placeholder price is NOT shown as a price.
                  Until 2026-09-22 every price here was invented and the page
                  said so in a banner; now 41 of 54 are the shop's own and 13
                  are not, so a banner can no longer do the work — the card
                  has to tell the truth about ITSELF. Printing £45.00 under a
                  piece whose price nobody has agreed is the one thing this
                  project has been careful about from the start: a displayed
                  price is what a customer is entitled to pay. */}
              {isBuyable(p) ? (
                <span className="prod-price">{formatPriceShort(p.priceP)}</span>
              ) : (
                <span className="prod-price prod-price--pending">
                  Price to confirm
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
