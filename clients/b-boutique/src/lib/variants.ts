import { stocklist } from "./stocklist";
import { products, type Product } from "./catalogue";

/** The thing a customer can actually buy.
 *
 *  ── Why this exists ──────────────────────────────────────────────────────
 *  Until now a product carried a list of size LABELS and no count against any
 *  of them, which is enough to render a dropdown and not enough to sell
 *  anything. "12 and 14" and "one of each" are different facts, and the shop
 *  has to know the difference before it takes money.
 *
 *  A variant is one row per buyable thing: this piece, in this size, in this
 *  colour. The camel coat in a 12 is a different object from the camel coat
 *  in a 14, and from the black one in a 12. Stock is counted per variant and
 *  nowhere else.
 *
 *  ── Where colour comes from ──────────────────────────────────────────────
 *  Nowhere, yet. The catalogue has never carried a colour, which is why the
 *  search deliberately has no colour terms — returning a coat for "black"
 *  would be the site telling a customer the coat is black, which nobody has
 *  confirmed. The client is being asked for a colour per piece; until each
 *  one arrives its variants carry `colour: UNKNOWN_COLOUR` and the site says
 *  nothing about colour for that piece rather than guessing one.
 *
 *  ── The counts are NOT in here ───────────────────────────────────────────
 *  On purpose. A count changes every time something sells and belongs in the
 *  database; this file only says which variants EXIST. `lib/stock.ts` joins
 *  the two.
 */

/** Written into a variant whose colour the client has not supplied.
 *  Rendered as nothing at all, never as a guess. */
export const UNKNOWN_COLOUR = "";

/** A piece with no confirmed colour still has variants — one per size, with
 *  the colour left blank. This is the list used in that case. */
const NO_COLOURS: readonly string[] = [UNKNOWN_COLOUR];

export type Variant = {
  /** Stable, and the primary key in the database. See `variantId`. */
  id: string;
  slug: Product["slug"];
  /** "12", or "One size" for a piece with no run. */
  size: string;
  /** "" while the client has not said. Never invented. */
  colour: string;
};

/** slug · size · colour, lowercased, spaces to hyphens.
 *
 *  Built from the three things that define the variant rather than assigned,
 *  so the same garment always resolves to the same row — a renumbering or a
 *  reordered catalogue cannot silently re-point a stock count at a different
 *  piece. The separator is a middle dot because a hyphen already appears
 *  inside slugs and sizes like "one-size", and an ambiguous key is a bug that
 *  only shows up once there is money attached to it. */
export function variantId(slug: string, size: string, colour: string): string {
  const part = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  return [part(slug), part(size), part(colour) || "nocolour"].join("·");
}

/** Every variant the catalogue currently implies: sizes MULTIPLIED BY colours.
 *
 *  The first version of this took one colour per piece, which cannot express
 *  the ordinary case of a boutique buying the same coat in camel and in
 *  black. Those are two different things to own, count and sell — a customer
 *  wanting the black 12 is not served by the camel 12 being in stock — so
 *  they are two variants, and a piece in three sizes and two colours is six
 *  rows rather than three.
 *
 *  A piece with no confirmed colour still gets one variant per size, with the
 *  colour blank. Nothing is invented and nothing disappears while the client
 *  has not answered. */
export function variantsFor(product: Product): Variant[] {
  const colours = coloursFor(product.slug);
  return product.sizes.flatMap((size) =>
    colours.map((colour) => ({
      id: variantId(product.slug, size, colour),
      slug: product.slug,
      size,
      colour,
    })),
  );
}

export function allVariants(): Variant[] {
  return products.flatMap(variantsFor);
}

/** Colour per slug, DERIVED from the stock list.
 *
 *  ── This was an empty object for three weeks, and it cost more than it
 *     looked like ───────────────────────────────────────────────────────
 *  It used to read "⚠ EMPTY ON PURPOSE. Not one colour in this shop has been
 *  confirmed", and that was correct until 2026-09-22. AddToBag has carried a
 *  full colour-selection UI the whole time — choose a colour, choose a size,
 *  the pair goes in the bag — and it was rendering nothing, because
 *  `coloursFor` handed it one blank string for every piece.
 *
 *  The visible symptom was mild: no colour control on the product page. The
 *  INVISIBLE one was not. Every variant id resolved to `slug·size·nocolour`,
 *  so a customer buying the longline coat bought "the coat, one size, no
 *  colour" and the shop had no way to know whether to post the burgundy, the
 *  brown or the camel. Stock counted the same way: three colourways
 *  collapsing into one row.
 *
 *  ── Where these come from, and why it does not break the rule above ────
 *  The rule this file has always carried is "never read a colour off a
 *  photograph", written after a "satin skirt" on this project turned out to
 *  be a matte brown pencil skirt. It is intact. These are not read off the
 *  pictures: they are the SUPPLIER'S OWN COLOUR NAMES, carried on the
 *  supplier's own reference codes — Babez London 10074-BEI is Beige, and
 *  stocklist.ts holds both halves of that so the claim can be checked.
 *
 *  Derived rather than typed, so a colour cannot exist here and not in the
 *  stock list, and the shop cannot offer one she does not have. */
const colours: Record<string, readonly string[]> = Object.fromEntries(
  stocklist.map((p) => [p.slug, p.colourways.map((c) => c.colour)]),
);

/** The colours a piece comes in. Empty answer means "not confirmed", which
 *  renders as nothing rather than as a guess. */
export function coloursFor(slug: string): readonly string[] {
  const c = colours[slug];
  return c && c.length > 0 ? c : NO_COLOURS;
}

/** True when this piece is sold in more than one colour, and therefore needs
 *  the customer to choose one as well as a size. */
export function hasColourChoice(slug: string): boolean {
  return coloursFor(slug).length > 1;
}

/** True when the client has confirmed any colour at all for this piece. */
export function colourIsKnown(slug: string): boolean {
  return coloursFor(slug)[0] !== UNKNOWN_COLOUR;
}

/** How many pieces still have no confirmed colour. Read by launch-check. */
export function piecesWithoutColour(): string[] {
  return products.filter((p) => !colourIsKnown(p.slug)).map((p) => p.slug);
}

/* ── Reading what the client writes down ────────────────────────────────── */

/** Parse "12x1, 14x2" or "one size x3" into counts per size.
 *
 *  The shop-visit form asks for sizes and counts in exactly this shape,
 *  because on a phone in a shop it is the fastest thing to type that still
 *  carries both facts. This turns it into data.
 *
 *  Deliberately forgiving about the separator (x, ×, @, space) and the order,
 *  because it is written by hand, standing up, in a hurry. Deliberately NOT
 *  forgiving about a missing count: "12, 14" returns an error rather than
 *  assuming one of each. Assuming is how a shop oversells. */
export type SizeCount = { size: string; qty: number };

export function parseSizeCounts(
  input: string,
): { ok: true; counts: SizeCount[] } | { ok: false; reason: string } {
  const text = input.trim();
  if (!text) return { ok: false, reason: "nothing written down" };

  const counts: SizeCount[] = [];
  for (const raw of text.split(/[,;\n]+/)) {
    const piece = raw.trim();
    if (!piece) continue;

    const m = piece.match(/^(.+?)\s*(?:[x×@]|\s)\s*(\d+)$/i);
    if (!m) {
      return {
        ok: false,
        reason: `"${piece}" has no count — write it as "12x1", not "12"`,
      };
    }

    const size = m[1].trim();
    const qty = Number.parseInt(m[2], 10);
    if (!size) return { ok: false, reason: `"${piece}" has no size` };
    if (!Number.isFinite(qty) || qty < 0) {
      return { ok: false, reason: `"${piece}" has a count that is not a number` };
    }
    counts.push({ size, qty });
  }

  if (counts.length === 0) return { ok: false, reason: "nothing readable" };
  return { ok: true, counts };
}
