#!/usr/bin/env node
/* Before `next build`: copy the prices Hayley has set on /stock into
 * src/data/prices.json, which lib/stocklist.ts reads (2026-10-02, Brad: she
 * can change prices herself).
 *
 * Why at build time and not live: about twenty parts of the site read a price
 * (product pages, grids, search, the bag, checkout, emails, structured data,
 * llms.txt) and the pages are built ahead. Baking her prices into the build
 * changes all of them in one go, so the bag can never say £40 while checkout
 * charges £45. A save on /stock triggers this build through the Vercel deploy
 * hook (lib/prices.ts), so a change is live in a few minutes.
 *
 * Never fails the build. No database (a local build), no table yet, or a
 * database that is down: the prices in the code stand, and it says so. */
import { writeFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const out = new URL("../src/data/prices.json", import.meta.url);
const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.NEON_DATABASE_URL;

if (!url) {
  console.log("prices: no database here; building with the prices in the code");
  process.exit(0);
}

try {
  const rows = await neon(url)`SELECT slug, price_p FROM price ORDER BY slug`;
  const prices = Object.fromEntries(rows.map((r) => [r.slug, Number(r.price_p)]));
  writeFileSync(out, JSON.stringify(prices, null, 2) + "\n");
  console.log(`prices: ${rows.length} set on /stock`);
} catch (err) {
  /* 42P01: the table does not exist until the first price is saved. */
  if (err?.code === "42P01") console.log("prices: none set on /stock yet");
  else console.warn("prices: could not read them; building with the prices in the code.", err?.message ?? err);
}
