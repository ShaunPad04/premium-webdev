import Link from "next/link";

import type { Product } from "@/lib/catalogue";
import { formatPrice } from "@/lib/catalogue";
import { ImageSlot, type Tone } from "./ImageSlot";

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
export function ProductGrid({
  items,
  idPrefix,
}: {
  items: Product[];
  idPrefix: string;
}) {
  return (
    <ul className="prod-grid">
      {items.map((p, i) => (
        <li key={p.slug} className="prod" style={{ "--i": i } as React.CSSProperties}>
          <Link href={`/shop/${p.slug}`} className="prod-link">
            <span className="prod-media">
              <ImageSlot
                tone={p.tone as Tone}
                seed={i + 11}
                uid={`${idPrefix}-${i}`}
                slot={p.slot}
                /* Decorative: the name is in real text directly beneath, so
                   alt text here would be announced twice and the data holds
                   nothing more useful to say without inventing it. */
                alt=""
                sizes="(min-width: 1024px) 23vw, (min-width: 640px) 31vw, 44vw"
                className="absolute inset-0 h-full w-full"
              />
            </span>
            <span className="prod-body">
              <span className="prod-cat">{p.category}</span>
              <span className="prod-name">{p.name}</span>
              <span className="prod-price">{formatPrice(p.priceP)}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
