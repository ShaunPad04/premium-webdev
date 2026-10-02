import "server-only";
import { sql } from "./stock";

/** Prices Hayley sets on /stock (2026-10-02, Brad).
 *
 *  One price per PIECE, not per colour: catalogue.ts refuses to build a piece
 *  whose colours disagree, because the card and product page show one price.
 *
 *  Saved here, then baked into the next build by scripts/fetch-prices.mjs, so
 *  every page, the bag and checkout change together. A save triggers that
 *  build through DEPLOY_HOOK_URL (Vercel deploy hook, branch
 *  client/b-boutique). Without it the price is saved and goes live on the
 *  next deploy of any kind.
 *
 *  Every change is logged with the old and new price, like stock_log: a price
 *  is what a customer is entitled to pay, so a wrong one has to be
 *  explainable afterwards. */

/** £1 to £999. A slip of a digit (£4 for £40) still fits, which is why the
 *  page asks her to confirm the old and new price in words. */
export const PRICE_MIN_P = 100;
export const PRICE_MAX_P = 99900;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS price (
     slug        TEXT PRIMARY KEY,
     price_p     INTEGER NOT NULL CHECK (price_p > 0),
     updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS price_log (
     id     BIGSERIAL PRIMARY KEY,
     slug   TEXT NOT NULL,
     old_p  INTEGER,
     new_p  INTEGER NOT NULL,
     at     TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
];

let ready: Promise<void> | null = null;
function ensure(q: NonNullable<ReturnType<typeof sql>>) {
  ready ??= (async () => {
    for (const s of SCHEMA) await q.query(s);
  })().catch((err) => {
    ready = null;
    throw err;
  });
  return ready;
}

/** slug -> pence, for every piece whose price was set on /stock. */
export async function readPrices(): Promise<Record<string, number>> {
  const q = sql();
  if (!q) return {};
  await ensure(q);
  const rows = (await q`SELECT slug, price_p FROM price`) as { slug: string; price_p: number }[];
  return Object.fromEntries(rows.map((r) => [r.slug, Number(r.price_p)]));
}

export function priceRebuildIsConfigured(): boolean {
  return Boolean(process.env.DEPLOY_HOOK_URL);
}

/** Save a piece's price, log it, and start the rebuild that puts it live.
 *  `oldP` is what the site was showing, for the log. */
export async function setPrice(
  slug: string,
  priceP: number,
  oldP: number,
): Promise<{ ok: true; rebuilding: boolean } | { ok: false; code: string }> {
  const q = sql();
  if (!q) return { ok: false, code: "not_configured" };
  await ensure(q);
  await q`INSERT INTO price (slug, price_p) VALUES (${slug}, ${priceP})
          ON CONFLICT (slug) DO UPDATE SET price_p = EXCLUDED.price_p, updated_at = now()`;
  await q`INSERT INTO price_log (slug, old_p, new_p) VALUES (${slug}, ${oldP}, ${priceP})`;

  let rebuilding = false;
  const hook = process.env.DEPLOY_HOOK_URL;
  if (hook) {
    rebuilding = await fetch(hook, { method: "POST" })
      .then((r) => r.ok)
      .catch(() => false);
  }
  return { ok: true, rebuilding };
}
