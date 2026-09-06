import Image from "next/image";
import Link from "next/link";

import type { CategoryCard } from "@/lib/pages";
import { ImageSlot } from "./ImageSlot";

/* The category index on /clothing and /accessories.
 *
 * A grid of photographs with a name and one line under each, and every card
 * is a link to that category's own page.
 *
 * It did not used to be. For as long as there was no catalogue, no basket and
 * no page under a category, a clickable card would have landed on a 404 or
 * back on the page it started from — the exact failure this site corrected
 * when seven links promised a category and delivered a homepage anchor. The
 * shop changed that: /clothing/coats is a real page listing the real coats,
 * so the card leads there.
 *
 * The whole card is the link, so the target is the card rather than a
 * one-word name, and there is one link per category rather than three
 * pointing at the same href. The count is not shown here — it belongs on the
 * page you land on, not on a card that would then need re-rendering whenever
 * stock moved.
 *
 * Images: `image` is an approved model shot, rendered through next/image with
 * a measured `sizes`. `slot` routes through ImageSlot, which layers the
 * photograph over its own designed marble or cloth and so is never a broken
 * image icon. */
export function CategoryGrid({
  cards,
  /** Measured against the rendered card, not guessed. At 1440 a card in the
   *  three-column grid is 424px wide, which is 29.4vw; at 768 the grid is two
   *  columns and a card is 47vw; below that it is one column, full width less
   *  the gutter. Just above measured in each case, so the browser never picks
   *  a candidate smaller than the slot it fills. */
  sizes = "(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 88vw",
}: {
  cards: CategoryCard[];
  sizes?: string;
}) {
  return (
    <ul className="cat-grid">
      {cards.map((card, i) => (
        /* The slug is the anchor the header's Clothing menu points at, so
           /clothing#knitwear lands on the card rather than at the top of the
           page. scroll-margin-top in globals.css keeps it clear of the fixed
           header. */
        <li
          key={card.slug}
          id={card.slug}
          className="cat-card"
          style={{ "--i": i } as React.CSSProperties}
        >
          <Link href={`/clothing/${card.slug}`} className="cat-link-card">
          <div className="cat-media">
            {card.image ? (
              <Image
                src={card.image}
                alt={card.alt ?? ""}
                fill
                sizes={sizes}
                className="cat-img"
              />
            ) : (
              <ImageSlot
                tone="marble"
                seed={41 + i}
                slot={card.slot}
                alt=""
                sizes={sizes}
                className="absolute inset-0 h-full w-full"
              />
            )}
          </div>
          <h3 className="cat-name">{card.name}</h3>
          <p className="cat-note">{card.note}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
