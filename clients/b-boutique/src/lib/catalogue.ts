import { moreStock, newIn } from "./shop";

/** The shop's catalogue.
 *
 *  ─────────────────────────────────────────────────────────────────────────
 *  ⚠ EVERY PRICE AND EVERY SIZE IN THIS FILE IS INVENTED ⚠
 *
 *  Nobody has supplied a price list, a size run or a stock count for B
 *  Boutique. The numbers below were written to make a working shop
 *  demonstrable, at the client's explicit request, and they are fiction.
 *
 *  This is the most dangerous file in the project, and more dangerous than
 *  the invented testimonials, because a price is not merely a false statement
 *  — under the Consumer Protection from Unfair Trading Regulations a
 *  displayed price is what the customer is entitled to pay. Published live,
 *  these would be real offers to real people at numbers nobody has agreed to.
 *
 *  Three things stand between them and being sold at, and none may be removed
 *  casually:
 *
 *    1. `demo: true` on every product. `catalogueIsDemo` reads it and the
 *       shop renders a visible notice for as long as any remains.
 *    2. The site is noindex until ALLOW_INDEXING is set.
 *    3. Checkout has no payment provider configured, so nothing can actually
 *       be charged. See app/api/checkout.
 *
 *  Replace every price with the client's own before any of those three
 *  changes. THIS SHOP IS NOT FIT TO TAKE MONEY until they do.
 *  ─────────────────────────────────────────────────────────────────────────
 *
 *  ── Why pence ────────────────────────────────────────────────────────────
 *  Prices are integers in pence, never pounds as a float. 0.1 + 0.2 is not
 *  0.3 in binary floating point, and a basket that adds up to £74.99999999 is
 *  a rounding bug waiting to be charged to somebody. Money is integer
 *  arithmetic from the catalogue to the payment provider, and it is formatted
 *  for display exactly once, at the edge.
 */
export type Product = {
  slug: string;
  name: string;
  category: string;
  /** In PENCE. Integer. Never a float, never pounds. */
  priceP: number;
  /** The size run offered. "One size" for pieces that have no run. */
  sizes: readonly string[];
  /** ImageSlot key — the same photograph the rest of the site uses. */
  slot: string;
  tone: string;
  /** True while the price and sizes are invented. */
  demo: true;
};

const CLOTHING_SIZES = ["8", "10", "12", "14", "16", "18"] as const;
const ONE_SIZE = ["One size"] as const;

/** Invented price and size run per piece, keyed by the slug already in
 *  shop.ts. Deliberately keyed rather than duplicated: the name, category,
 *  tone and photograph all still come from `newIn`, so the shop cannot end up
 *  describing a different piece from the one the home page rail shows. */
const demoPricing: Record<string, { priceP: number; sizes: readonly string[] }> = {
  "wool-trouser":      { priceP: 14500, sizes: CLOTHING_SIZES },
  "camel-blazer":      { priceP: 24500, sizes: CLOTHING_SIZES },
  "lambswool-crew":    { priceP: 9800,  sizes: CLOTHING_SIZES },
  "cotton-tee":        { priceP: 4500,  sizes: CLOTHING_SIZES },
  "slip-dress":        { priceP: 16500, sizes: CLOTHING_SIZES },
  "boucle-overshirt":  { priceP: 18500, sizes: CLOTHING_SIZES },
  "leather-crossbody": { priceP: 12500, sizes: ONE_SIZE },
  "silk-scarf":        { priceP: 6500,  sizes: ONE_SIZE },
  "gold-hoops":        { priceP: 4200,  sizes: ONE_SIZE },
  "leather-belt":      { priceP: 5500,  sizes: ONE_SIZE },
  "lambswool-scarf":   { priceP: 5800,  sizes: ONE_SIZE },
  "leather-tote":      { priceP: 19500, sizes: ONE_SIZE },
  "stoneware-carafe":  { priceP: 4800,  sizes: ONE_SIZE },

  /* The rest of the rails, added 2026-09-06 so that every category has stock
     in it rather than a name and an empty shelf. Same rule: invented. */
  "charcoal-overcoat": { priceP: 32500, sizes: CLOTHING_SIZES },
  "camel-wrap-coat":   { priceP: 28500, sizes: CLOTHING_SIZES },
  "poplin-shirt":      { priceP: 8900,  sizes: CLOTHING_SIZES },
  "silk-blouse":       { priceP: 13500, sizes: CLOTHING_SIZES },
  "satin-skirt":       { priceP: 11500, sizes: CLOTHING_SIZES },
  "pleated-skirt":     { priceP: 12500, sizes: CLOTHING_SIZES },
  "straight-jeans":    { priceP: 9500,  sizes: CLOTHING_SIZES },
  "wide-jeans":        { priceP: 9800,  sizes: CLOTHING_SIZES },
  "merino-rollneck":   { priceP: 11500, sizes: CLOTHING_SIZES },
  "burgundy-dress":    { priceP: 19500, sizes: CLOTHING_SIZES },
  "wool-blazer":       { priceP: 22500, sizes: CLOTHING_SIZES },
  "striped-top":       { priceP: 5500,  sizes: CLOTHING_SIZES },
};

/** Everything the shop sells: the New In rail plus the rest of the rails.
 *  One list, built from the two in shop.ts, so a product cannot exist in the
 *  shop under a different name from the one the rest of the site shows. */
export const products: Product[] = [...newIn, ...moreStock]
  .filter((p) => demoPricing[p.slug])
  .map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
    priceP: demoPricing[p.slug].priceP,
    sizes: demoPricing[p.slug].sizes,
    slot: `new-${p.slug}`,
    tone: p.tone,
    demo: true as const,
  }));

export function productBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/** True while any price is invented. The shop renders one notice for as long
 *  as this is true, and it is the single thing to check before taking money. */
export const catalogueIsDemo = products.some((p) => p.demo);

/** Pence to a readable price, in one place.
 *
 *  Intl rather than a hand-rolled `(p / 100).toFixed(2)`: it puts the symbol
 *  where en-GB expects it and never produces "£4.5". The division happens
 *  here and nowhere else — everything upstream is integers. */
const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export function formatPrice(priceP: number): string {
  return gbp.format(priceP / 100);
}

/** Delivery. Invented like everything else here, and flagged in the UI.
 *  A single flat rate rather than a table: weight bands, zones and free
 *  thresholds are commercial decisions nobody has made. */
export const DELIVERY_P = 495;
export const DELIVERY_IS_DEMO = true;

/** The products in one category, by the category's display name.
 *  Used by the category pages and by the shop's own filtering; there is one
 *  definition of "what is in Coats" and it is this. */
export function productsIn(category: string): Product[] {
  return products.filter((p) => p.category === category);
}
