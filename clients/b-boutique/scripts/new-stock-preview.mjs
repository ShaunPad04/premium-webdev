#!/usr/bin/env node
/* Record a walk through newly added stock for Brad to review before it goes
 * live (2026-10-10). Needs a server on :3000 (pnpm build && pnpm start).
 *
 *   node scripts/new-stock-preview.mjs <slug> [<slug> ...]
 *
 * Shows the foot of /clothing and of each category grid the slugs sit in,
 * then each product page with every colourway, at 1440x900. Writes
 * new-stock-preview-<date>.webm beside the project; convert with
 * ffmpeg -i in.webm -c:v libx264 -pix_fmt yuv420p out.mp4. */
import { chromium } from "@playwright/test";
import { readdirSync, renameSync } from "node:fs";
import { stocklist } from "../src/lib/stocklist.ts";

const BASE = "http://localhost:3000";
const slugs = process.argv.slice(2);
if (!slugs.length) { console.error("give at least one product slug"); process.exit(1); }
const CATS = { Knitwear: "knitwear", "Coats & Jackets": "coats-jackets", Trousers: "trousers", Tops: "tops", Skirts: "skirts", "Co-ords": "co-ords", Dresses: "dresses" };
const cats = [...new Set(slugs.map((s) => CATS[stocklist.find((p) => p.slug === s)?.category]).filter(Boolean))];

const dir = "/tmp/claude-501/new-stock-preview";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir, size: { width: 1440, height: 900 } } });
const page = await ctx.newPage();
const pause = (ms) => page.waitForTimeout(ms);
const scrollTo = (y, ms = 1200) => page.evaluate(([y, ms]) => new Promise((done) => {
  const start = window.scrollY, t0 = performance.now();
  const step = (t) => { const k = Math.min(1, (t - t0) / ms); const e = 1 - Math.pow(1 - k, 3);
    window.scrollTo(0, start + (y - start) * e); if (k < 1) requestAnimationFrame(step); else done(); };
  requestAnimationFrame(step);
}), [y, ms]);

for (const path of ["/clothing", ...cats.map((c) => `/clothing/${c}`)]) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await pause(1200);
  const y = await page.evaluate(() => { const cards = [...document.querySelectorAll('main a[href^="/shop/"]')]; const last = cards[cards.length - 1]; return last.getBoundingClientRect().bottom + window.scrollY - window.innerHeight + 40; });
  await scrollTo(y, 3000); await pause(3200);
}
for (const slug of slugs) {
  await page.goto(`${BASE}/shop/${slug}`, { waitUntil: "networkidle" });
  await pause(2200);
  const thumbs = page.locator('[class*="thumb"] button, .gallery-thumbs button, button[aria-label*="olour"]');
  const n = await thumbs.count();
  for (let i = 1; i < Math.min(n, 3); i++) { await thumbs.nth(i).click().catch(() => {}); await pause(1600); }
  if (n > 1) { await thumbs.nth(0).click().catch(() => {}); await pause(1200); }
  await scrollTo(650, 1800); await pause(2200);
}
await pause(800);
await ctx.close(); await browser.close();
const webm = readdirSync(dir).find((f) => f.endsWith(".webm"));
const out = `new-stock-preview-${new Date().toISOString().slice(0, 10)}.webm`;
renameSync(`${dir}/${webm}`, out);
console.log(out);
