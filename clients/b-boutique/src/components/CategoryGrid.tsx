import Image from "next/image";

import type { CategoryCard } from "@/lib/pages";
import { ImageSlot } from "./ImageSlot";

/* The category index on /clothing and /accessories.
 *
 * A grid of photographs with a name and one line under each, and no link —
 * which is the whole point and is worth stating plainly, because a grid of
 * unlinked cards looks like an oversight until you know why.
 *
 * There is no page under a category. The shop sells in person: there is no
 * catalogue, no basket, no stock feed and no per-item page anywhere in this
 * codebase. A card that looks clickable and lands on a 404 — or worse, on the
 * same page it started from — is the failure this site has already corrected
 * once, when seven links promised a category and delivered a homepage anchor.
 * So the cards are what they are: pictures of what is on the rails, with the
 * one real call to action at the bottom of the page.
 *
 * Nothing here is focusable, so nothing is added to the tab order. The
 * photographs are described where they carry information a caption does not.
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
        </li>
      ))}
    </ul>
  );
}
