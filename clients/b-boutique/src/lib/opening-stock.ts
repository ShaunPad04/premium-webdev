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
 * Applying it never overwrites: only variants with NO count yet are set, so
 * pressing the button after sales have been recorded changes nothing that
 * a person has already counted. */
import data from "@/data/opening-stock.json";
import { products } from "@/lib/catalogue";
import { variantId } from "@/lib/variants";

export type OpeningCount = { id: string; qty: number };

export function openingPlan(): { plan: OpeningCount[]; skipped: string[] } {
  const opening = data.opening as Record<string, Record<string, number>>;
  const split = data.statedSplit as Record<string, number>;
  const bySize = data.statedSizes as Record<string, Record<string, number>>;
  const plan: OpeningCount[] = [];
  const skipped: string[] = [];

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
      }
    }
  }
  return { plan, skipped };
}
