import "server-only";
import { neon } from "@neondatabase/serverless";
import { allVariants, variantId, type Variant } from "./variants";

/** What is actually in the shop.
 *
 *  ── Why a database and not a file ────────────────────────────────────────
 *  A stock count changes every time something sells, from two directions: a
 *  customer paying online, and the shop owner tapping a piece sold at the
 *  counter. A file in the repository cannot take a write from a running
 *  serverless function, and a value in memory does not survive the next
 *  deploy — or even the next cold start. Stock is the one thing on this site
 *  that genuinely needs a database, and this is it.
 *
 *  ── Why Neon's own driver ────────────────────────────────────────────────
 *  It speaks to Postgres over HTTP rather than holding a TCP connection, so
 *  a function that runs for 200ms and dies does not leave a connection behind
 *  it. Using a normal Postgres client from a serverless function is the
 *  classic way to exhaust a connection pool the first time two people load
 *  the shop at once.
 *
 *  ── Until the database exists ────────────────────────────────────────────
 *  It does not, yet. Every function here answers `null` or an explicit
 *  "not configured" rather than throwing, and the shop behaves as it does
 *  today — sizes listed, no counts shown. This is the same rule the contact
 *  form and the checkout already follow: a missing configuration is reported
 *  plainly and never faked. It must never guess a count. A count nobody has
 *  taken, shown as "1 left", is a scarcity claim about a real business.
 */

/* Neon injects several connection strings. The pooled one is what a
   serverless function wants; the unpooled `_UNPOOLED` variant is for
   long-running processes and migrations. The names are read in preference
   order rather than hardcoded to one, because which of them a project gets
   depends on how the integration was connected. */
function connectionString(): string | null {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.NEON_DATABASE_URL ??
    null
  );
}

export function stockIsConfigured(): boolean {
  return connectionString() !== null;
}

function sql() {
  const url = connectionString();
  if (!url) return null;
  return neon(url);
}

export type StockRow = {
  id: string;
  slug: string;
  size: string;
  colour: string;
  /** How many are in the shop. Never negative. */
  qty: number;
  /** Set when the client says this line can be re-ordered from the
   *  wholesaler. A sold-out re-orderable line reads "out of stock"; a
   *  sold-out one-off comes off the site. */
  restockable: boolean;
};

/* ── Schema ──────────────────────────────────────────────────────────────
 * Created on demand rather than through a migration tool. One table and one
 * log at this size does not justify a migration framework, and `IF NOT
 * EXISTS` is idempotent — the alternative is a dependency and a build step
 * for a schema that will change perhaps twice.
 *
 * `stock_log` is not an afterthought. When a count is wrong — and it will be,
 * because a human is tapping a phone in a shop — the only useful question is
 * "what happened to this piece?", and that needs a record of every change and
 * where it came from. It is also the beginning of the order record the shop
 * does not yet have. */
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS stock (
    id           TEXT PRIMARY KEY,
    slug         TEXT NOT NULL,
    size         TEXT NOT NULL,
    colour       TEXT NOT NULL DEFAULT '',
    qty          INTEGER NOT NULL DEFAULT 0 CHECK (qty >= 0),
    restockable  BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS stock_log (
    id         BIGSERIAL PRIMARY KEY,
    variant_id TEXT NOT NULL,
    delta      INTEGER NOT NULL,
    qty_after  INTEGER NOT NULL,
    reason     TEXT NOT NULL,
    note       TEXT,
    at         TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS stock_log_variant ON stock_log (variant_id, at DESC);
`;

export async function ensureSchema(): Promise<boolean> {
  const q = sql();
  if (!q) return false;
  await q.query(SCHEMA);
  return true;
}

/** Every variant the catalogue implies, given a row if it has one.
 *
 *  Catalogue-first, not database-first. A piece that has never been counted
 *  still appears, with `qty: null` — which the page renders as "not counted"
 *  rather than as zero. Those are different facts and conflating them is how
 *  a shop hides its own stock from itself. */
export type StockView = Variant & {
  qty: number | null;
  restockable: boolean;
};

export async function readStock(): Promise<StockView[] | null> {
  const q = sql();
  if (!q) return null;

  await ensureSchema();
  const rows = (await q`SELECT id, qty, restockable FROM stock`) as {
    id: string;
    qty: number;
    restockable: boolean;
  }[];

  const byId = new Map(rows.map((r) => [r.id, r]));
  return allVariants().map((v) => {
    const row = byId.get(v.id);
    return {
      ...v,
      qty: row ? Number(row.qty) : null,
      restockable: row?.restockable ?? false,
    };
  });
}

/** How many of one variant are available to sell. `null` means not counted. */
export async function availableFor(
  slug: string,
  size: string,
  colour: string,
): Promise<number | null> {
  const q = sql();
  if (!q) return null;
  await ensureSchema();
  const rows = (await q`
    SELECT qty FROM stock WHERE id = ${variantId(slug, size, colour)}
  `) as { qty: number }[];
  return rows.length ? Number(rows[0].qty) : null;
}

/* ── Writes ──────────────────────────────────────────────────────────────
 * Every change goes through `adjust`, and every change is logged. There is
 * deliberately no "set the count to N" path that skips the log: a count that
 * changed with no record of why is the thing that makes a stock system
 * untrustworthy, and an untrusted stock system gets ignored, and an ignored
 * stock system oversells. */

export type Reason =
  | "sold-in-shop"
  | "sold-online"
  | "returned"
  | "counted"
  | "received";

export type AdjustResult =
  | { ok: true; qty: number }
  | { ok: false; code: "not_configured" | "unknown_variant" | "would_go_negative"; qty?: number };

export async function adjust(
  id: string,
  delta: number,
  reason: Reason,
  note?: string,
): Promise<AdjustResult> {
  const q = sql();
  if (!q) return { ok: false, code: "not_configured" };
  if (!Number.isInteger(delta) || delta === 0) {
    return { ok: false, code: "unknown_variant" };
  }

  await ensureSchema();

  /* The variant has to be one the catalogue actually contains. Without this
     check an id typed into a request creates a stock row for a garment that
     does not exist, which then shows up in her list and cannot be explained. */
  const known = allVariants().some((v) => v.id === id);
  if (!known) return { ok: false, code: "unknown_variant" };

  const v = allVariants().find((x) => x.id === id)!;

  /* One statement, so the read and the write cannot interleave with another
     request — two people marking the same piece sold at the same moment must
     not both read 1 and both write 0. The CHECK constraint on qty is the
     backstop: a change that would go below zero raises rather than silently
     clamping, because clamping hides a real disagreement about what is in the
     shop. */
  try {
    const rows = (await q`
      INSERT INTO stock (id, slug, size, colour, qty)
      VALUES (${id}, ${v.slug}, ${v.size}, ${v.colour}, ${Math.max(delta, 0)})
      ON CONFLICT (id) DO UPDATE
        SET qty = stock.qty + ${delta}, updated_at = now()
      RETURNING qty
    `) as { qty: number }[];

    const qty = Number(rows[0].qty);
    await q`
      INSERT INTO stock_log (variant_id, delta, qty_after, reason, note)
      VALUES (${id}, ${delta}, ${qty}, ${reason}, ${note ?? null})
    `;
    return { ok: true, qty };
  } catch (err) {
    /* The CHECK constraint firing is not an error to be logged and swallowed
       — it is the answer to the caller's question: there were not that many.
       Anything else is a real failure and is rethrown so it reaches the logs
       rather than being reported to her as "not enough stock". */
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("qty") && message.includes("check")) {
      const now = await availableFor(v.slug, v.size, v.colour);
      return { ok: false, code: "would_go_negative", qty: now ?? 0 };
    }
    throw err;
  }
}

/** Set a count outright — a stocktake, not a sale.
 *
 *  Kept separate from `adjust` because the reason matters: "I have counted
 *  them and there are three" is a different statement from "one sold", and
 *  the log should not pretend otherwise. */
export async function setCount(
  id: string,
  qty: number,
  note?: string,
): Promise<AdjustResult> {
  const q = sql();
  if (!q) return { ok: false, code: "not_configured" };
  if (!Number.isInteger(qty) || qty < 0) {
    return { ok: false, code: "would_go_negative" };
  }

  await ensureSchema();
  const v = allVariants().find((x) => x.id === id);
  if (!v) return { ok: false, code: "unknown_variant" };

  const before = await availableFor(v.slug, v.size, v.colour);
  await q`
    INSERT INTO stock (id, slug, size, colour, qty)
    VALUES (${id}, ${v.slug}, ${v.size}, ${v.colour}, ${qty})
    ON CONFLICT (id) DO UPDATE SET qty = ${qty}, updated_at = now()
  `;
  await q`
    INSERT INTO stock_log (variant_id, delta, qty_after, reason, note)
    VALUES (${id}, ${qty - (before ?? 0)}, ${qty}, 'counted', ${note ?? null})
  `;
  return { ok: true, qty };
}

export async function setRestockable(id: string, value: boolean): Promise<boolean> {
  const q = sql();
  if (!q) return false;
  await ensureSchema();
  const v = allVariants().find((x) => x.id === id);
  if (!v) return false;
  await q`
    INSERT INTO stock (id, slug, size, colour, qty, restockable)
    VALUES (${id}, ${v.slug}, ${v.size}, ${v.colour}, 0, ${value})
    ON CONFLICT (id) DO UPDATE SET restockable = ${value}, updated_at = now()
  `;
  return true;
}
