#!/usr/bin/env node
/* Load B Boutique's OPENING stock counts into the database.
 *
 * ── The problem this solves, and the one it does not ────────────────────
 * /api/checkout already refuses to sell more of a variant than the shop has
 * — the guard is there, it fails closed if the database errors, and it has
 * been correct since 2026-09-20. It has simply had nothing to check against,
 * because the stock table is empty and an uncounted line is deliberately
 * treated as "the website does not know" rather than as zero.
 *
 * So the oversell risk is not a missing rule. It is missing DATA. This puts
 * the data in.
 *
 * ── Why most of the counts CANNOT be imported ───────────────────────────
 * The client's dashboard carries a count for 35 of the 54 colourways. It
 * counts the COLOURWAY, not the variant.
 *
 * "Straight Leg Wide Trouser, Black = 5" against a run of S-M / M / L / XL /
 * XXL does not say one of each. It might be five of one size. Splitting it
 * evenly would be inventing the split, and an invented split is worse than no
 * count at all: it would let the site confidently sell an XXL that does not
 * exist while refusing an M that does.
 *
 * Three cases are unambiguous:
 *
 *   ONE SIZE    The run is a single size, so the colourway total IS the
 *               variant count. Exact, no inference.
 *   STATED      The list states the split: jean-jogger "(2 of each)", and
 *               an exact count per size for the zebra jeans and denim set.
 *
 * Everything else is left UNCOUNTED on purpose and has to be counted per size
 * by a person on /stock. The script prints what it skipped and why, so the
 * gap is visible rather than silently missing.
 *
 * ── It is idempotent and it is logged ───────────────────────────────────
 * Every write goes through `setCount`, which is the same path /stock uses and
 * which writes stock_log. Re-running it re-states the opening figures rather
 * than adding to them — `setCount`, never `adjust` — so a second run after
 * she has sold things would WIPE her real counts back to the opening ones.
 * Hence --force: without it the script refuses to touch a variant that
 * already has a count.
 *
 *   node scripts/import-stock.mjs          # dry run: prints the plan
 *   Applying it: /stock -> "Load opening counts from the master list"
 */
import { readFileSync } from "node:fs";

const WRITE = process.argv.includes("--write");

/* The counts and the stated splits live in ONE place, src/data/
   opening-stock.json, which the site's own importer also reads
   (src/lib/opening-stock.ts, the "Load opening counts" button on /stock). */
const DATA = JSON.parse(readFileSync("src/data/opening-stock.json", "utf8"));
const OPENING = DATA.opening;
const STATED_SPLIT = DATA.statedSplit;
const STATED_SIZES = DATA.statedSizes;

function variantId(slug, size, colour) {
  const part = (s) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  return [part(slug), part(size), part(colour) || "nocolour"].join("·");
}

/** Read the catalogue's sizes straight out of the TypeScript source rather
 *  than duplicating them here — two lists of sizes is two lists to get out of
 *  step, and the whole point of this script is not inventing anything. */
function sizesBySlug() {
  const src = readFileSync("src/lib/stocklist.ts", "utf8");
  const out = {};
  const re = /slug:\s*"([^"]+)"[\s\S]*?sizes:\s*\[([^\]]*)\]/g;
  let m;
  while ((m = re.exec(src))) {
    out[m[1]] = [...m[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  }
  return out;
}

async function main() {
  const sizes = sizesBySlug();
  const plan = [];
  const skipped = [];

  for (const [slug, byColour] of Object.entries(OPENING)) {
    const run = sizes[slug];
    if (!run) {
      skipped.push(`${slug}: not in stocklist.ts`);
      continue;
    }
    for (const [colour, total] of Object.entries(byColour)) {
      if (run.length === 1) {
        plan.push({ id: variantId(slug, run[0], colour), qty: total, why: "one size" });
        continue;
      }
      const bySize = STATED_SIZES[slug];
      if (bySize !== undefined) {
        for (const size of run) {
          if (bySize[size] === undefined) throw new Error(`${slug}: no stated count for ${size}`);
          plan.push({ id: variantId(slug, size, colour), qty: bySize[size], why: "per-size count stated" });
        }
        continue;
      }
      const each = STATED_SPLIT[slug];
      if (each !== undefined) {
        for (const size of run) {
          plan.push({ id: variantId(slug, size, colour), qty: each, why: "split stated" });
        }
        continue;
      }
      skipped.push(
        `${slug} / ${colour}: ${total} across ${run.length} sizes (${run.join(", ")}) — ` +
          `the dashboard counts the colourway, not the size. Count it on /stock.`,
      );
    }
  }

  console.log(`${plan.length} variant counts can be imported without guessing.`);
  console.log(`${skipped.length} CANNOT and are left uncounted:\n`);
  for (const s of skipped) console.log(`  - ${s}`);
  console.log("");

  if (!WRITE) {
    console.log("Dry run. Re-run with --write to apply.");
    for (const p of plan) console.log(`  would set ${p.id} = ${p.qty}  (${p.why})`);
    return;
  }

  /* The write path was removed on 2026-09-23. It wrote rows in a shape the
     stock tables no longer have (and DATABASE_URL is a sensitive Vercel
     secret that cannot be read out anyway). Apply the counts from the site:
     /stock -> "Load opening counts from the master list". */
  throw new Error("Writing moved into the site: sign in on /stock and press 'Load opening counts from the master list'.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
