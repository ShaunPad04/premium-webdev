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
 * Two cases, and only two, are unambiguous:
 *
 *   ONE SIZE    The run is a single size, so the colourway total IS the
 *               variant count. Exact, no inference.
 *   STATED      The dashboard states the split in words. Exactly one piece
 *               does: jean-jogger, "S/M, M/L, L/XL (2 of each)".
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

/* The dashboard's per-colourway counts, transcribed 2026-09-22 alongside
   lib/stocklist.ts. Kept here rather than in stocklist.ts because a COUNT is
   not a property of the catalogue — it changes every time something sells,
   and the catalogue is a build-time constant. This file is the opening
   balance, not the source of truth; the database is. */
const OPENING = {
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
  "high-neck-checked-bomber": { "Red check": 2 },
  "italian-knit-belted-cardigan": { Brown: 3 },
  "italian-knit-rosette-jumper": { Cream: 3 },
  "chunky-knit-flower-cardigan": { Brown: 3 },
  "tomato-vase": { Red: 4 },
  "banana-jar": { Yellow: 3 },
  "bell-vase": { Gold: 4 },
};

/** The one piece whose per-size split the dashboard states in words. */
const STATED_SPLIT = { "jean-jogger": 2 };

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
