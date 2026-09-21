import { openingSummary, shop } from "./shop";

/** The band under the hero.
 *
 *  ── What used to be here ─────────────────────────────────────────────────
 *  Eight brand logos — Mos Mosh, Rino & Pelle, Part Two, b.young, Ichi,
 *  Nümph, Saint Tropez, Selected Femme — under a heading reading "Brands in
 *  store". `lib/brands.ts` carried the words TEMPORARY — CLIENT CONCEPT
 *  ONLY. NOT CONFIRMED STOCKISTS from the day it was written, and the client
 *  confirmed on 2026-09-20 that she names no wholesalers at all. On
 *  2026-09-21 she confirmed the shop does not stock big labels.
 *
 *  So the homepage of a real trading business was showing eight other
 *  companies' registered trademarks and telling visitors they were in the
 *  shop. That is not a placeholder to be swapped out at leisure; it is a
 *  false statement about the business and about eight third parties, and it
 *  was removed rather than parked.
 *
 *  ── The rule this file exists to enforce ─────────────────────────────────
 *  Every line below is either derived from confirmed data or is the shop
 *  describing itself in its own register. Nothing here is a claim a customer
 *  could act on and find untrue: no price, no promise, no stockist, no
 *  delivery term, no walking time.
 *
 *  The adjective "affordable" is deliberately NOT here. The client used it
 *  when describing the shop, and as an adjective it is puffery rather than a
 *  price claim, so it would be lawful. Two reasons it is still left out:
 *  PRODUCT.md's voice section says the site does not use adjectives to
 *  manufacture a position, and every price in catalogue.ts is currently
 *  invented — an "affordable" over a shelf of made-up numbers is the one
 *  place the word could actually mislead. If she wants it, it is one line.
 *
 *  ── When the products arrive ─────────────────────────────────────────────
 *  This band is meant to be temporary in the sense that something better can
 *  replace it, not in the sense that it is a placeholder: it is true today
 *  and would still be true next year. When the real stock lands, swapping
 *  this for a product rail is one import in page.tsx. Nothing else on the
 *  page depends on it.
 */
export const statements: readonly string[] = [
  // Sole trader, confirmed 2026-09-20. The shop's actual differentiator, and
  // the reason the logo band was wrong: she is not supplied by the names that
  // were on it.
  "Independent",
  "Not a chain",

  // The three categories the site is built around — PRODUCT.md, and the
  // catalogue's own shape.
  "Womenswear, accessories & homeware",

  // Derived. Never typed: the street and town live in shop.ts and every
  // surface reads them, so this cannot drift from Visit, the footer, the
  // corner menu or the JSON-LD.
  `${shop.street}, ${shop.town}`,

  // Derived from the hours table by the same function the FAQ, the footer and
  // the corner menu use. The trailing full stop that openingSummary() returns
  // is stripped: this is a marquee item, not a sentence in a paragraph.
  openingSummary().replace(/\.$/, ""),

  // A description of what the shop is, not a promise about what is in it.
  // "Chosen one piece at a time" would be a claim about buying practice
  // nobody has confirmed; this is just the shop's own category and place.
  "A boutique on the Cleethorpes seafront",
];
