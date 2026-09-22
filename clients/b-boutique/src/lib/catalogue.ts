import { stocklist, type StockPiece } from "./stocklist";

/** The shop's catalogue.
 *
 *  ─────────────────────────────────────────────────────────────────────────
 *  THE PRICES ARE HERS NOW. MOST OF THEM.
 *
 *  This file used to open with a warning that every price in it was invented.
 *  That is no longer true and the warning has gone with the fiction: the 26
 *  demo products, their made-up prices and their made-up size runs were
 *  deleted on 2026-09-22 and replaced by what is actually on her rail —
 *  32 pieces and 54 colourways, read from lib/stocklist.ts, which was
 *  transcribed from the stock dashboard she supplied.
 *
 *  THIRTEEN COLOURWAYS STILL HAVE A PLACEHOLDER PRICE. The dashboard says so
 *  and stocklist.ts carries it through as `priceConfirmed: false`. Those are
 *  the only things left standing between this shop and being able to take
 *  money, and they are handled rather than hoped about:
 *
 *    - A piece whose price is not confirmed carries `demo: true`, exactly as
 *      all 26 used to, so `catalogueIsDemo` stays true and the shop keeps
 *      rendering its notice.
 *    - `isBuyable` is false for it, and the product page, the grid and the
 *      checkout each ask rather than assume.
 *    - NEXT_PUBLIC_SITE_URL stays unset, so /api/checkout still answers 503
 *      and nothing can be charged at any price, confirmed or not.
 *
 *  Eight of the 32 pieces are affected. When her prices for those land, the
 *  flags flip in stocklist.ts and nothing here has to change.
 *  ─────────────────────────────────────────────────────────────────────────
 *
 *  ── Why pence ────────────────────────────────────────────────────────────
 *  Prices are integers in pence, never pounds as a float. 0.1 + 0.2 is not
 *  0.3 in binary floating point, and a basket that adds up to £74.99999999 is
 *  a rounding bug waiting to be charged to somebody. Money is integer
 *  arithmetic from the catalogue to the payment provider, and it is formatted
 *  for display exactly once, at the edge. The dashboard quotes pounds, some
 *  of them with pence (£24.50), and the conversion happens once in
 *  stocklist.ts where it was checked to be exact.
 *
 *  ── The shape is deliberately unchanged ──────────────────────────────────
 *  Nineteen files import from here. `Product` keeps every field it had —
 *  slug, name, category, priceP, sizes, slot, tone, demo — so none of them
 *  needed touching to get her real stock on the page. The new fields are
 *  additions, and the consumers that want them (the product page) read them
 *  while the ones that do not (the bag, the checkout, the search) carry on.
 */
export type Product = {
  slug: string;
  name: string;
  category: string;
  /** In PENCE. Integer. Never a float, never pounds.
   *  The FIRST colourway's price. Every colourway of a piece is the same
   *  price in the dashboard, and `pricesAgree` below asserts it rather than
   *  trusting it — a piece whose colours cost different amounts would need a
   *  price per colourway on the card and this would be quietly wrong. */
  priceP: number;
  /** The size run she actually buys: "S-M"/"M-L", "S"/"M"/"L"/"XL", or a
   *  single "One size". No longer a fabricated 8-18. */
  sizes: readonly string[];
  /** ImageSlot key. Kept for the designed fallback underneath the photograph;
   *  see `photo` for the real one. */
  slot: string;
  tone: string;
  /** True while THIS piece has any colourway whose price is a placeholder. */
  demo: boolean;

  /* ── Everything below is new, and all of it is hers ─────────────────── */

  /** Basename of the primary photograph in /img/product, no extension. */
  photo: string;
  short: string;
  full: string;
  features: readonly string[];
  /** A fibre composition ONLY when `fabricPublished`. Otherwise a description
   *  of how the cloth looks and handles, which must never be printed under a
   *  heading that reads as a composition label. */
  fabric: string;
  fabricPublished: boolean;
  care: string;
  /** "fits up to 14", "2 of each" — the qualifier on the run, kept separate
   *  so it can be shown as a note rather than mistaken for a size. */
  sizeNote: string;
  supplier: string;
  colourways: StockPiece["colourways"];
};

/** The designed fallback that sits under a photograph if it fails to load.
 *  One per category rather than per piece: it is a texture, not a picture of
 *  the garment, and pretending otherwise is how a fallback starts making
 *  claims. */
const TONE: Record<string, string> = {
  Knitwear: "bone",
  Tops: "bone",
  Trousers: "marble",
  "Coats & Jackets": "onyx",
  "Co-ords": "marble",
  Dresses: "onyx",
  Homeware: "gold",
};

/** Asserted, not assumed. If a piece ever arrives with two prices across its
 *  colours, the card's single price would be wrong for at least one of them
 *  and this throws at import rather than shipping the cheaper number. */
function priceFor(piece: StockPiece): number {
  const prices = new Set(piece.colourways.map((c) => c.priceP));
  if (prices.size !== 1) {
    throw new Error(
      `${piece.slug}: colourways disagree on price (${[...prices].join(", ")}) — ` +
        `the card and the product page both show one price per piece`,
    );
  }
  return piece.colourways[0].priceP;
}

/** Everything the shop sells. Built from the stock list, so a product cannot
 *  exist here under a different name, price or colour from the one on the
 *  rail. */
export const products: Product[] = stocklist.map((piece) => ({
  slug: piece.slug,
  name: piece.name,
  category: piece.category,
  priceP: priceFor(piece),
  sizes: piece.sizes,
  slot: `prod-${piece.slug}`,
  tone: TONE[piece.category] ?? "bone",
  demo: piece.colourways.some((c) => !c.priceConfirmed),
  photo: piece.colourways[0].image,
  short: piece.short,
  full: piece.full,
  features: piece.features,
  fabric: piece.fabric,
  fabricPublished: piece.fabricPublished,
  care: piece.care,
  sizeNote: piece.sizeNote,
  supplier: piece.supplier,
  colourways: piece.colourways,
}));

/** Whether this piece may be put in a bag and paid for.
 *
 *  A placeholder price is not a price. Displaying one is a statement about
 *  what something costs, and under the Consumer Protection from Unfair
 *  Trading Regulations a displayed price is what the customer is entitled to
 *  pay — so a piece whose price nobody has confirmed is shown, described and
 *  photographed, and cannot be bought, rather than hidden. Hiding it would
 *  also be a lie: it IS in the shop. */
export function isBuyable(p: Product): boolean {
  return !p.demo;
}

/** The notice the shop shows while any price is still a placeholder.
 *
 *  ── Why the wording lives here and not on five pages ────────────────────
 *  It used to be typed out separately on /shop, /clothing, a category page,
 *  the product page and the bag, and all five said the same thing: "every
 *  price on this page is invented for this build". On 2026-09-22 that became
 *  FALSE — 41 of the 54 colourways now carry the client's own price — and
 *  five copies is five places to miss when a sentence stops being true. A
 *  notice that overstates the problem is not the safe direction of wrong: it
 *  tells a customer to disbelieve prices that are correct, and it trains the
 *  people building the site to ignore the banner.
 *
 *  So there is one sentence, it counts rather than asserts, and it goes away
 *  by itself when the last placeholder is replaced. */
export function pendingPriceNotice(): string | null {
  const n = unconfirmedPriceCount();
  if (n === 0) return null;
  const pieces = products.filter((p) => p.demo).length;
  return (
    `[${n} of ${products.reduce((t, p) => t + p.colourways.length, 0)} colourways ` +
    `are still waiting on a price from the shop. ${pieces === 1 ? "That piece is" : `Those ${pieces} pieces are`} ` +
    `marked and cannot be bought. Nothing can be charged on this build.]`
  );
}

/** How many colourways still have no confirmed price. Read by launch-check. */
export function unconfirmedPriceCount(): number {
  return products.reduce(
    (n, p) => n + p.colourways.filter((c) => !c.priceConfirmed).length,
    0,
  );
}

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

/** The same money, without a trailing `.00`.
 *
 *  For prose rather than for a basket line. "Free UK delivery on orders over
 *  £120" is how a shop writes it; "over £120.00" is how a spreadsheet does,
 *  and the two pence that are never there read as a price that might change.
 *  A non-round amount keeps its pence — £4.35 stays £4.35 — so this can
 *  never quietly round a real figure away. */
export function formatPriceShort(priceP: number): string {
  return priceP % 100 === 0
    ? gbp.format(priceP / 100).replace(/\.00$/, "")
    : gbp.format(priceP / 100);
}

/** Delivery. CONFIRMED BY THE CLIENT 2026-09-20.
 *
 *  £4.35 on any order, free at £120 and above. Her figures, in her words, and
 *  no longer invented — which is why DELIVERY_IS_DEMO is false and the bag's
 *  "these figures are made up" notice no longer fires for delivery.
 *
 *  Pence, as integers, like every other money value here. £4.35 is 435 and
 *  £120 is 12000; neither is ever a float. See locked decision 12.
 *
 *  The threshold is compared against the SUBTOTAL — the pieces — not against
 *  the total. Comparing against a total that already includes delivery is the
 *  classic off-by-one in a free-delivery rule: an order of £115.65 plus £4.35
 *  reaches £120 and qualifies for free delivery, which then drops it back to
 *  £115.65, which no longer qualifies. Subtotal has no such loop. */
export const DELIVERY_P = 435;
export const FREE_DELIVERY_OVER_P = 12000;
export const DELIVERY_IS_DEMO = false;

/** What delivery costs on a given basket. One definition, used by the bag and
 *  by the checkout, so the price quoted and the price charged cannot drift. */
export function deliveryFor(subtotalP: number): number {
  if (subtotalP <= 0) return 0;
  return subtotalP >= FREE_DELIVERY_OVER_P ? 0 : DELIVERY_P;
}

/** The products in one category, by the category's display name.
 *  Used by the category pages and by the shop's own filtering; there is one
 *  definition of "what is in Coats" and it is this. */
export function productsIn(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

/** What to show under a product as "You may also like".
 *
 *  ── The rule: nearest first, and never padded with nonsense ────────────
 *  Same category first, because on a clothing site that is what "like this"
 *  means to a customer — somebody looking at a longline coat wants the other
 *  coats, not a vase. Then the same supplier, which is the next most useful
 *  neighbour: pieces bought from one wholesaler share a cut and a sizing, so
 *  if this one fits, those probably do. Only then the rest of the shop.
 *
 *  ── Why buyable pieces come first ───────────────────────────────────────
 *  Thirteen colourways still carry a placeholder price and cannot be bought.
 *  Putting one of those at the top of an upsell is showing somebody a thing
 *  and then telling them they cannot have it, which is worse than showing
 *  them nothing. They are not EXCLUDED — they are real stock and a customer
 *  may well want to come in for one — they simply sort last.
 *
 *  Deterministic: no randomness anywhere. A rail that reshuffles on every
 *  build makes visual regression meaningless and makes a shop feel unstable.
 */
export function relatedTo(product: Product, limit = 4): Product[] {
  /* Four tiers, and the third exists because of a real weakness found by
     looking at the output rather than by reading the code.

     Dresses contains exactly one piece. With only category and supplier to
     go on, its "You may also like" fell straight through to catalogue order
     and offered a jumper, a sleeveless jumper, some jeans and a coat — which
     is not a recommendation, it is the first four rows of the table. Several
     pieces also carry no supplier at all, so that tier is blank for them too.

     Price band is the tier that fixes it: within 40% either way is a
     reasonable proxy for "something else you might have been looking at" in a
     shop whose range runs £24.50 to £85. It is a weak signal and it is
     ranked as one — below category and supplier, above nothing at all. */
  const band = (p: Product) =>
    p.priceP >= product.priceP * 0.6 && p.priceP <= product.priceP * 1.4;

  const rank = (p: Product) => {
    if (p.category === product.category) return 0;
    if (p.supplier && p.supplier === product.supplier) return 1;
    if (band(p)) return 2;
    return 3;
  };
  return products
    .filter((p) => p.slug !== product.slug)
    .map((p, i) => ({ p, i }))
    .sort(
      (a, b) =>
        rank(a.p) - rank(b.p) ||
        Number(isBuyable(b.p)) - Number(isBuyable(a.p)) ||
        a.i - b.i,
    )
    .slice(0, limit)
    .map((x) => x.p);
}

/** How much more a basket needs for free UK delivery, in pence.
 *  0 once it qualifies. Compared against the SUBTOTAL, never the total —
 *  see `deliveryFor` for why comparing against a total that already includes
 *  delivery creates a loop where £115.65 qualifies and then stops. */
export function awayFromFreeDelivery(subtotalP: number): number {
  return Math.max(0, FREE_DELIVERY_OVER_P - subtotalP);
}
