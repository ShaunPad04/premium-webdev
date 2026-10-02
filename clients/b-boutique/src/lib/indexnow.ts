import "server-only";
import priceDates from "@/data/price-dates.json";
import { absolute } from "./site";
import { sql } from "./stock";

/** Tell Bing (and through it ChatGPT search and Copilot) that a product page
 *  changed price, once the build carrying the new price is LIVE (2026-10-02).
 *
 *  Why here and not in the build or in setPrice: both run before the new
 *  pages are serving, and a crawler sent early reads the old price. This runs
 *  from /api/availability, which only the live deployment answers, so by
 *  definition the pages it names already show the new price.
 *
 *  price_ping remembers which change was announced, so each one is pinged
 *  once however many instances start. The claim is one statement: two
 *  instances racing cannot both win a slug. IndexNow is public by design;
 *  the key only proves we own the domain, which is why it sits in /public. */

const KEY = "7f82ae78d90d188c480fc520ed6ce869";

let done = false;

export async function pingChangedPrices(): Promise<void> {
  if (done || process.env.VERCEL_ENV !== "production") return;
  done = true;
  const dates = priceDates as Record<string, string>;
  const slugs = Object.keys(dates);
  const q = sql();
  if (!q || slugs.length === 0) return;

  await q.query(`CREATE TABLE IF NOT EXISTS price_ping (slug TEXT PRIMARY KEY, at TIMESTAMPTZ NOT NULL)`);
  const claimed = (await q.query(
    `INSERT INTO price_ping (slug, at)
     SELECT * FROM unnest($1::text[], $2::timestamptz[])
     ON CONFLICT (slug) DO UPDATE SET at = EXCLUDED.at WHERE price_ping.at < EXCLUDED.at
     RETURNING slug`,
    [slugs, slugs.map((s) => dates[s])],
  )) as { slug: string }[];
  if (claimed.length === 0) return;

  const won = claimed.map((r) => r.slug);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(absolute("/")).host,
      key: KEY,
      keyLocation: absolute(`/${KEY}.txt`),
      urlList: won.map((s) => absolute(`/shop/${s}`)),
    }),
  }).catch(() => null);

  /* 200 and 202 both mean received. Anything else: release the claim so the
   * next instance tries again. */
  if (!res || (res.status !== 200 && res.status !== 202)) {
    await q.query(`DELETE FROM price_ping WHERE slug = ANY($1::text[])`, [won]);
    done = false;
  }
}
