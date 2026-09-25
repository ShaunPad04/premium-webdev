import "server-only";
import { neon } from "@neondatabase/serverless";
import { allVariants, variantId, type Variant } from "./variants";
import { openingPlan } from "./opening-stock";

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
 * Created on demand rather than through a migration tool. Two tables and one
 * index does not justify a migration framework, and `IF NOT EXISTS` is
 * idempotent.
 *
 * ── ONE STATEMENT PER CALL, and this is not a style preference ───────────
 * The first version sent all three in a single string and every request to
 * /stock died with:
 *
 *     NeonDbError: cannot insert multiple commands into a prepared statement
 *
 * Neon's HTTP driver sends each call as one prepared statement, and Postgres
 * will not parse several commands in one of those (error 42601, raised in
 * exec_parse_message). It is not a Neon limitation to work around — it is how
 * the extended query protocol works, and the fix is to send them separately.
 *
 * This was shipped unverified because there was no database to run it
 * against, and it failed the first time a real one appeared. Worth
 * remembering: "it compiles and the types line up" is not the same as "it
 * has been run".
 *
 * `stock_log` is not an afterthought. When a count is wrong — and it will be,
 * because a human is tapping a phone in a shop — the only useful question is
 * "what happened to this piece?", and that needs a record of every change and
 * where it came from. It is also the beginning of the order record the shop
 * does not yet have. */
const SCHEMA: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS stock (
     id           TEXT PRIMARY KEY,
     slug         TEXT NOT NULL,
     size         TEXT NOT NULL,
     colour       TEXT NOT NULL DEFAULT '',
     qty          INTEGER NOT NULL DEFAULT 0 CHECK (qty >= 0),
     restockable  BOOLEAN NOT NULL DEFAULT FALSE,
     updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS stock_log (
     id         BIGSERIAL PRIMARY KEY,
     variant_id TEXT NOT NULL,
     delta      INTEGER NOT NULL,
     qty_after  INTEGER NOT NULL,
     reason     TEXT NOT NULL,
     note       TEXT,
     at         TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS stock_log_variant ON stock_log (variant_id, at DESC)`,
];

/* Three round trips is three too many to repeat on every request. Memoised
 * per warm instance: a cold start pays for it once, and `IF NOT EXISTS` makes
 * paying twice harmless anyway. Reset on failure so a transient error does
 * not leave an instance believing a schema exists that does not. */
let schemaReady: Promise<boolean> | null = null;

export async function ensureSchema(): Promise<boolean> {
  const q = sql();
  if (!q) return false;
  if (schemaReady) return schemaReady;

  schemaReady = (async () => {
    for (const statement of SCHEMA) await q.query(statement);
    await seedOpening(q);
    return true;
  })().catch((err) => {
    schemaReady = null;
    throw err;
  });

  return schemaReady;
}

/* The opening counts from the master list (lib/opening-stock.ts), written
 * the first time an instance touches the database, so nobody has to press a
 * button for them. One statement, and it only ever INSERTS: a variant that
 * already has a row (counted by hand, or a sale recorded) is left exactly
 * as it is, and two instances starting at once cannot both write a line.
 * Only the rows it actually wrote get a log entry, in the same statement.
 * After the first run it writes nothing. */
async function seedOpening(q: NonNullable<ReturnType<typeof sql>>) {
  const byId = new Map(allVariants().map((v) => [v.id, v]));
  const plan = openingPlan().plan.filter((p) => byId.has(p.id));
  if (plan.length === 0) return;
  const col = <T,>(f: (p: (typeof plan)[number]) => T) => plan.map(f);
  await q.query(
    `WITH written AS (
       INSERT INTO stock (id, slug, size, colour, qty)
       SELECT * FROM unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::int[])
       ON CONFLICT (id) DO NOTHING
       RETURNING id, qty
     )
     INSERT INTO stock_log (variant_id, delta, qty_after, reason, note)
     SELECT id, qty, qty, 'counted', 'opening count, master stock list 2026-09-22'
     FROM written`,
    [
      col((p) => p.id),
      col((p) => byId.get(p.id)!.slug),
      col((p) => byId.get(p.id)!.size),
      col((p) => byId.get(p.id)!.colour),
      col((p) => p.qty),
    ],
  );
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

/** The counts for a named set of variants, in one query.
 *
 *  For the two places that ask about specific things rather than about the
 *  whole shop: the product page, which asks about one garment's sizes and
 *  colours, and the checkout, which asks about what is in somebody's bag. A
 *  query per line would be a query per line.
 *
 *  A variant with no row is ABSENT from the map, not zero. "Nobody has
 *  counted this" and "there are none" are different answers and the caller
 *  has to decide what to do about each — see the note in /api/checkout.
 *
 *  `null` means there is no database configured at all. */
export async function countsFor(
  ids: readonly string[],
): Promise<Map<string, number> | null> {
  const q = sql();
  if (!q) return null;
  if (ids.length === 0) return new Map();

  await ensureSchema();
  const rows = (await q`
    SELECT id, qty FROM stock WHERE id = ANY(${ids as string[]})
  `) as { id: string; qty: number }[];
  return new Map(rows.map((r) => [r.id, Number(r.qty)]));
}

/** Which variants of one piece can be bought, and which are sold out.
 *
 *  ── What this deliberately does NOT return ───────────────────────────────
 *  A number. Not one count reaches a visitor, ever. "Only 1 left" is a
 *  scarcity claim about a real business, it falls under the same regulations
 *  as a price, and it is arguably worse because it pressures the purchase
 *  rather than describing it. The shop floor gets numbers; the shop front
 *  gets yes or no.
 *
 *  Three states, because two would lie:
 *    "in"      — counted, and there is at least one.
 *    "out"     — counted, and there are none. Cannot be bought.
 *    "unknown" — never counted. Behaves exactly as the site did before stock
 *                existed: the piece can be added and the shop rings to
 *                confirm. NOT rendered as either in or out of stock. */
export type Availability = "in" | "out" | "unknown";

export async function availabilityForSlug(
  slug: string,
): Promise<Record<string, { state: Availability; restockable: boolean; qty: number }> | null> {
  const q = sql();
  if (!q) return null;

  await ensureSchema();
  const rows = (await q`
    SELECT id, qty, restockable FROM stock WHERE slug = ${slug}
  `) as { id: string; qty: number; restockable: boolean }[];

  const out: Record<string, { state: Availability; restockable: boolean; qty: number }> = {};
  for (const r of rows) {
    out[r.id] = {
      state: Number(r.qty) > 0 ? "in" : "out",
      restockable: Boolean(r.restockable),
      qty: Number(r.qty),
    };
  }
  return out;
}
