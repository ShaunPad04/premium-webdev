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

/** Every variant the catalogue currently implies.
 *
 *  One colour per piece for now, because that is all the data model holds.
 *  When the client confirms that a piece comes in two colours, it gains two
 *  entries here and the database gains two rows; nothing else changes. */
export function variantsFor(product: Product): Variant[] {
  const colour = colourFor(product.slug);
  return product.sizes.map((size) => ({
    id: variantId(product.slug, size, colour),
    slug: product.slug,
    size,
    colour,
  }));
}

export function allVariants(): Variant[] {
  return products.flatMap(variantsFor);
}

/** Colour per slug.
 *
 *  ⚠ EMPTY ON PURPOSE. Not one colour in this shop has been confirmed.
 *
 *  The client is being asked for a colour for every piece, in her own words —
 *  camel, not beige, if camel is what she calls it. Each answer adds a line
 *  here. Until a piece has one, the site shows no colour for it: `pnpm
 *  launch-check` counts what is missing and blocks on it.
 *
 *  Do not fill this in from the photographs. The artwork behind a product
 *  card is a generated stand-in and says nothing about the garment on the
 *  rail — that mistake has already been made once on this project, where a
 *  "satin skirt" turned out to be a matte brown pencil skirt. */
const colours: Record<string, string> = {};

export function colourFor(slug: string): string {
  return colours[slug] ?? UNKNOWN_COLOUR;
}

/** How many pieces still have no confirmed colour. Read by launch-check. */
export function piecesWithoutColour(): string[] {
  return products.filter((p) => !colours[p.slug]).map((p) => p.slug);
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
