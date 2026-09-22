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
 *   DATABASE_URL=... node scripts/import-stock.mjs          # dry run
 *   DATABASE_URL=... node scripts/import-stock.mjs --write
 *   DATABASE_URL=... node scripts/import-stock.mjs --write --force
 */
import { readFileSync } from "node:fs";

const WRITE = process.argv.includes("--write");
const FORCE = process.argv.includes("--force");

/* Opening counts per colourway, from the MASTER stock list Brad supplied on
   2026-09-22 (40 pieces; the 8 still awaiting photographs are not here, so
   nothing is counted for a product the site cannot show). It replaced the
   earlier dashboard figures, which covered 35 of 54 colourways; this covers
   every colourway on the site. Generated from the list, not retyped. */
const OPENING = {
  "fair-isle-jumper": { Beige: 2, Brown: 4 },
  "faux-feather-sleeveless-jumper": { Black: 3, Beige: 3 },
  "paisley-fringe-belted-cardigan-vest": { Burgundy: 3, Brown: 3 },
  "fine-knit-jumper-with-asymmetric-hem": { Brown: 3, Beige: 6 },
  "lace-blouse-with-layered-ruffle": { Burgundy: 3, Brown: 3 },
  "zebra-print-balloon-leg-jeans": { "Zebra Print": 10 },
  "striped-fuzzy-zip-up-jumper": { Beige: 3, "Red / Pink": 3 },
  "plaid-check-hooded-jacket": { Beige: 3 },
  "balloon-sleeve-longline-coat": { Burgundy: 2, Brown: 2, Camel: 2 },
  "amour-half-zip-wool-jumper": { Navy: 3 },
  "piping-detail-denim-jacket-trouser-set": { "Denim Blue": 5 },
  "pleated-barrel-trouser": { Navy: 3, Beige: 3 },
  "jewelled-collar-cardigan": { Black: 2, Burgundy: 2, Cream: 1 },
  "multi-jumper": { Brown: 3, Olive: 3 },
  "argyle-vest-t-shirt": { Brown: 2, Burgundy: 2 },
  "pinstripe-lined-top": { Black: 3, Burgundy: 3, Brown: 3 },
  "velour-lounge-set": { Khaki: 2, Burgundy: 2, "Chocolate Brown": 2 },
  "straight-leg-wide-trouser": { Black: 5, Brown: 4 },
  "wide-leg-trouser": { Beige: 5, "Chocolate Brown": 5 },
  "sheer-sleeve-knit-dress": { Burgundy: 3, Brown: 3 },
  "jean-jogger": { Blue: 6, Black: 6 },
  "paisley-oversized-knitted-jumper": { Brown: 3, Burgundy: 3 },
  "leopard-print-longline-coat": { "Leopard Print": 1 },
  "short-trench-coat": { Sand: 3 },
  "high-neck-checked-bomber": { "Pink / Burgundy Check": 2 },
  "italian-knit-belted-cardigan": { Brown: 3 },
  "italian-knit-rosette-jumper": { Cream: 3 },
  "italian-knit-ribbed-cardigan": { Cream: 3 },
  "chunky-knit-flower-cardigan": { Brown: 3 },
  "tomato-vase": { Red: 4 },
  "banana-jar": { Yellow: 3 },
  "bell-vase": { Gold: 4 },
};


/** Pieces whose per-size split the list STATES, so importing it is copying,
 *  not inferring. jean-jogger: "S/M, M/L, L/XL (2 of each)". The jeans and the
 *  denim set give an exact count per size in the master list; each split was
 *  checked to add up to its colourway total before being written here. */
const STATED_SPLIT = { "jean-jogger": 2 };
const STATED_SIZES = {
  "zebra-print-balloon-leg-jeans": {"XS": 1, "S": 3, "M": 3, "L": 2, "XL": 1},
  "piping-detail-denim-jacket-trouser-set": {"XXS": 1, "XS": 2, "M": 1, "L": 1},
};

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

  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    throw new Error("No DATABASE_URL — nothing to write to.");
  }

  const { neon } = await import("@neondatabase/serverless");
  const q = neon(process.env.DATABASE_URL ?? process.env.POSTGRES_URL);

  const existing = new Map(
    (
      await q`SELECT id, qty FROM stock WHERE id = ANY(${plan.map((p) => p.id)})`
    ).map((r) => [r.id, Number(r.qty)]),
  );

  let wrote = 0;
  let held = 0;
  for (const p of plan) {
    const have = existing.get(p.id);
    if (have !== undefined && have !== null && !FORCE) {
      held += 1;
      console.log(`  HELD  ${p.id} already counted (${have}) — --force to overwrite`);
      continue;
    }
    await q`
      INSERT INTO stock (id, slug, size, colour, qty, restockable)
      VALUES (${p.id}, ${p.id.split("·")[0]}, '', '', ${p.qty}, false)
      ON CONFLICT (id) DO UPDATE SET qty = ${p.qty}
    `;
    await q`
      INSERT INTO stock_log (id, delta, reason)
      VALUES (${p.id}, ${p.qty}, 'opening count imported from the stock dashboard')
    `;
    wrote += 1;
  }
  console.log(`\nwrote ${wrote}, held ${held}.`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
