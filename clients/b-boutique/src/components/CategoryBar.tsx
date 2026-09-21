import Link from "next/link";

import { clothingCounts } from "@/lib/pages";

/* The rail selector, above the products.
 *
 * ── What this replaces on /clothing ───────────────────────────────────────
 * Nine large category photographs, one per rail, filling more than a screen
 * before a single garment appeared. The client's instruction was plain:
 * "it should just show all products not big images, optimise it so its like
 * a premium boutique clothing store product page."
 *
 * He is describing what COS, Arket, Toteme and every other shop of this kind
 * actually do, and the reasoning holds independently: somebody who has
 * clicked CLOTHING has already chosen clothing. Showing them nine more doors
 * is asking them to choose again before they are allowed to see anything.
 * The categories become a filter above the stock rather than a gate in front
 * of it — still one tap away, no longer in the way.
 *
 * ── It is on the category pages too, and that is the other half ───────────
 * /clothing/[category] had its sibling rails in a section at the BOTTOM of
 * the page, under the grid. So moving from Coats to Knitwear meant scrolling
 * past every coat first. With the bar at the top of both, the whole set of
 * rails is reachable from any of them without scrolling — which is the thing
 * that makes a shop feel navigable rather than deep.
 *
 * ── The counts are real ───────────────────────────────────────────────────
 * Each label carries the number of pieces on that rail, counted from the
 * catalogue at render by `clothingCounts()`. A number beside a category is a
 * promise the next page has to keep, so it is never written down — if a rail
 * empties, the count goes to zero here rather than sending somebody to a
 * blank grid.
 *
 * ── Markup ────────────────────────────────────────────────────────────────
 * A <nav> with an accessible name, and a list, because that is what it is.
 * `aria-current="page"` marks the one you are on — the styling is a solid
 * fill, but the state is announced rather than left to colour, which is the
 * rule for anything that signals "where am I". */
export function CategoryBar({
  /** The category slug currently being viewed, or "all" on /clothing. */
  current,
}: {
  current: string;
}) {
  const cards = clothingCounts();
  const total = cards.reduce((n, c) => n + c.count, 0);

  return (
    <nav aria-label="Clothing categories" className="catbar">
      <ul className="catbar-list">
        <li>
          <Link
            href="/clothing"
            aria-current={current === "all" ? "page" : undefined}
            className="catbar-link"
          >
            Everything
            <span className="catbar-n" aria-hidden="true">
              {total}
            </span>
          </Link>
        </li>
        {cards.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/clothing/${c.slug}`}
              aria-current={current === c.slug ? "page" : undefined}
              className="catbar-link"
            >
              {c.name}
              {/* aria-hidden because "Coats 2" read aloud is ambiguous — the
                  count is a visual affordance, and the destination page
                  states it properly in words. */}
              <span className="catbar-n" aria-hidden="true">
                {c.count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
