/* The shop's OPENING stock counts, as a plan the site can apply itself.
 *
 * Why this lives in the app (2026-09-23): the counts had a command-line
 * importer (scripts/import-stock.mjs) that needs DATABASE_URL, and on Vercel
 * that value is a "sensitive" secret nobody can read back — correctly. So
 * the import runs inside the deployed site, where the database is already
 * connected, from a button on /stock behind her passcode.
 *
 * The rules are unchanged from the script, and are the reason most counts
 * CANNOT be imported: the list counts the COLOURWAY, not the size. "Black =
 * 5" across S/M/L/XL says nothing about how many 12s there are, and an
 * invented split would let the site sell an XL that does not exist. So a
 * count is imported only where it is exact:
 *   - a one-size run (the colourway total IS the variant count);
 *   - a run whose per-size split the list states.
 * Everything else stays uncounted and is counted by a person on /stock.
 *
 * Applied automatically (lib/stock.ts, once per server instance) since
 * 2026-09-23: nobody has to press anything. It never overwrites: a variant
 * is only written if it has no row at all, so a count a person has made, or
 * a sale already recorded, is never touched.
 *
 * The colourways it cannot split are returned too, so /stock can show the
 * list's own total beside the sizes that still need counting. */
import data from "@/data/opening-stock.json";
import { products } from "@/lib/catalogue";
import { variantId } from "@/lib/variants";

export type OpeningCount = { id: string; qty: number };

export type Unsplit = { slug: string; colour: string; total: number; sizes: number };

export function openingPlan(): { plan: OpeningCount[]; skipped: string[]; unsplit: Unsplit[] } {
  const opening = data.opening as Record<string, Record<string, number>>;
  const split = data.statedSplit as Record<string, number>;
  const bySize = data.statedSizes as Record<string, Record<string, number>>;
  const plan: OpeningCount[] = [];
  const skipped: string[] = [];
  const unsplit: Unsplit[] = [];

  for (const [slug, byColour] of Object.entries(opening)) {
    const product = products.find((p) => p.slug === slug);
    if (!product) {
      skipped.push(`${slug}: not in the catalogue`);
      continue;
    }
    const run = product.sizes;
    for (const [colour, total] of Object.entries(byColour)) {
      if (run.length === 1) {
        plan.push({ id: variantId(slug, run[0], colour), qty: total });
      } else if (bySize[slug]) {
        for (const size of run) {
          const n = bySize[slug][size];
          if (n === undefined) skipped.push(`${slug} / ${size}: no stated count`);
          else plan.push({ id: variantId(slug, size, colour), qty: n });
        }
      } else if (split[slug] !== undefined) {
        for (const size of run) plan.push({ id: variantId(slug, size, colour), qty: split[slug] });
      } else {
        skipped.push(`${slug} / ${colour}: ${total} across ${run.length} sizes`);
        unsplit.push({ slug, colour, total, sizes: run.length });
      }
    }
  }
  return { plan, skipped, unsplit };
}

/** The master list's total for one colourway, across every size — or null
 *  when the list has none. For a size nobody has counted yet this is the
 *  honest upper bound: no single size can hold more than the colour does.
 *  Used to cap quantities until /stock has a real count for the size. */
export function listedTotal(slug: string, colour: string, size?: string): number | null {
  /* Where the list states the per-size split, that is the tighter, exact cap. */
  if (size !== undefined) {
    const bySize = (data.statedSizes as Record<string, Record<string, number>>)[slug]?.[size];
    if (typeof bySize === "number") return bySize;
    const each = (data.statedSplit as Record<string, number>)[slug];
    if (typeof each === "number") return each;
  }
  const n = (data.opening as Record<string, Record<string, number>>)[slug]?.[colour];
  return typeof n === "number" ? n : null;
}
