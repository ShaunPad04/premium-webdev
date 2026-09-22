import "server-only";
import { neon } from "@neondatabase/serverless";

import { adjust, ensureSchema as ensureStockSchema, stockIsConfigured } from "./stock";
import { variantId } from "./variants";

/** An order somebody placed on the website.
 *
 *  ── Why this exists ──────────────────────────────────────────────────────
 *  Until now the shop could take a payment and write nothing down. There was
 *  no record to pick from, pack, refund or audit, the customer's name and
 *  address were never asked for at all, and a sale online did not move the
 *  stock count — so the same one-off piece could be sold twice, or sold again
 *  over the counter an hour later.
 *
 *  This file is the record. It does three jobs that have to happen together
 *  or not at all:
 *
 *    1. Writes down WHO bought WHAT and WHERE IT GOES.
 *    2. Takes the piece off the shelf the moment a checkout is created, so a
 *       second customer cannot be sent to pay for it.
 *    3. Gives the shop something to look at: an order, an address, and a
 *       button that says it has been posted.
 *
 *  ── The reservation, and why it is a decrement rather than a hold ────────
 *  A separate `reserved` column would be the textbook answer and it is more
 *  machinery than this shop needs. `adjust` in stock.ts is already atomic —
 *  one statement, and a CHECK constraint that refuses to take the count below
 *  zero rather than clamping — so decrementing at checkout time gives the
 *  guarantee for free: two people a second apart cannot both pass, because
 *  the second one's write is refused by the database rather than by a race we
 *  wrote ourselves.
 *
 *  The cost is that an abandoned basket holds a piece off the shelf until it
 *  is released. That is what `releaseStale` is for, and it is why an order is
 *  written BEFORE the customer is sent to pay rather than after they come
 *  back — see the note on `markPaid`.
 *
 *  ── Uncounted variants are NOT reserved, deliberately ────────────────────
 *  `qty: null` means nobody has counted it, which this codebase is careful to
 *  treat as "the website does not know" rather than as zero. Decrementing one
 *  would create a row at zero and assert that the rail is empty, which nobody
 *  has established — and it would make the piece unsellable after one order.
 *  So an uncounted line is recorded on the order and left alone on the shelf,
 *  exactly as the checkout already allows it through. The gap closes when the
 *  counts go in, which is a person and /stock, not code.
 */

function connectionString(): string | null {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.NEON_DATABASE_URL ??
    null
  );
}

function sql() {
  const url = connectionString();
  if (!url) return null;
  return neon(url);
}

export { stockIsConfigured as ordersAreConfigured };

/** One line of an order, priced and named as it was at the moment of sale.
 *
 *  The price IS stored here, which contradicts the rule everywhere else in
 *  this codebase that money is looked up rather than carried. That rule is
 *  about a price a BROWSER sends, which can be edited. This is the price the
 *  server itself worked out and the customer actually paid, and an order
 *  record that re-prices itself from the catalogue would quietly rewrite
 *  history the next time she changes a price. A receipt is a fact about a
 *  past event. */
export type OrderLine = {
  variantId: string;
  slug: string;
  /** As the customer would read it back: "Fair Isle Jumper, S-M, Beige". */
  describe: string;
  size: string;
  colour: string;
  qty: number;
  /** In PENCE, as charged. */
  priceP: number;
  /** False where the variant was never counted, so nothing was reserved and
   *  the shop has to check the rail by hand before posting. */
  reserved: boolean;
};

export type OrderStatus = "pending" | "paid" | "failed" | "released";

export type Order = {
  reference: string;
  status: OrderStatus;
  name: string;
  email: string;
  /** The whole posting address as the customer typed it, newlines and all. */
  address: string;
  postcode: string;
  /** Optional at checkout — empty string when the customer left it blank. */
  phone: string;
  lines: OrderLine[];
  subtotalP: number;
  deliveryP: number;
  totalP: number;
  postedAt: string | null;
  createdAt: string;
};

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS orders (
     reference    TEXT PRIMARY KEY,
     status       TEXT NOT NULL DEFAULT 'pending',
     name         TEXT NOT NULL,
     email        TEXT NOT NULL,
     address      TEXT NOT NULL,
     postcode     TEXT NOT NULL,
     lines        JSONB NOT NULL,
     subtotal_p   INTEGER NOT NULL,
     delivery_p   INTEGER NOT NULL,
     total_p      INTEGER NOT NULL,
     posted_at    TIMESTAMPTZ,
     created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  /* Added 2026-09-22. ALTER rather than a column in the CREATE above,
     because the table may already exist in Neon from before the phone was
     asked for, and CREATE TABLE IF NOT EXISTS would skip it and leave the
     INSERT failing on a missing column. Default '' so older rows read as
     "not given", which is what they are. */
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT ''`,
  /* She reads this newest first, filtered to what still needs doing. */
  `CREATE INDEX IF NOT EXISTS orders_status_created ON orders (status, created_at DESC)`,
];

let schemaReady: Promise<boolean> | null = null;

export async function ensureOrderSchema(): Promise<boolean> {
  const q = sql();
  if (!q) return false;
  if (schemaReady) return schemaReady;

  schemaReady = (async () => {
    await ensureStockSchema();
    for (const statement of SCHEMA) await q.query(statement);
    return true;
  })().catch((err) => {
    schemaReady = null;
    throw err;
  });

  return schemaReady;
}

function rowToOrder(r: Record<string, unknown>): Order {
  return {
    reference: String(r.reference),
    status: String(r.status) as OrderStatus,
    name: String(r.name),
    email: String(r.email),
    address: String(r.address),
    postcode: String(r.postcode),
    phone: String(r.phone ?? ""),
    lines: (r.lines ?? []) as OrderLine[],
    subtotalP: Number(r.subtotal_p),
    deliveryP: Number(r.delivery_p),
    totalP: Number(r.total_p),
    postedAt: r.posted_at ? new Date(String(r.posted_at)).toISOString() : null,
    createdAt: new Date(String(r.created_at)).toISOString(),
  };
}

export type CustomerDetails = {
  name: string;
  email: string;
  address: string;
  postcode: string;
  phone: string;
};

/** Write the order and take its pieces off the shelf, in that order.
 *
 *  ── Why the order is written BEFORE the payment ──────────────────────────
 *  SumUp publishes no payment webhook, so the only authoritative confirmation
 *  is the success page asking SumUp whether it was paid. If the order were
 *  only written at that point, every customer who paid and closed the tab
 *  would be a payment with no record — money taken and nothing to pack.
 *
 *  So: written as `pending` before the redirect, confirmed on the way back,
 *  and swept up by `releaseStale` if the customer never returns. A pending
 *  order is never treated as a sale; it is a held piece and a thing to chase.
 *
 *  Returns the lines it managed to reserve so the caller can refuse the whole
 *  checkout if the shelf has emptied underneath it. */
export async function createPendingOrder(input: {
  reference: string;
  customer: CustomerDetails;
  lines: Omit<OrderLine, "reserved">[];
  subtotalP: number;
  deliveryP: number;
  totalP: number;
}): Promise<
  | { ok: true; order: Order }
  | { ok: false; code: "not_configured" }
  | { ok: false; code: "sold_out"; describe: string }
> {
  const q = sql();
  if (!q) return { ok: false, code: "not_configured" };
  await ensureOrderSchema();

  /* Reserve first. An order written for pieces the shop turns out not to have
     is a record of something that cannot be fulfilled, and it would have to
     be unpicked. Nothing is written until every line is held. */
  const held: OrderLine[] = [];
  for (const line of input.lines) {
    const result = await adjust(
      line.variantId,
      -line.qty,
      "sold-online",
      `reserved for ${input.reference}`,
    );

    if (result.ok) {
      held.push({ ...line, reserved: true });
      continue;
    }

    /* Never counted, so there is no row and nothing to hold. Recorded as
       unreserved rather than refused — the same position the checkout's own
       stock check already takes on an uncounted line. */
    if (result.code === "unknown_variant" || result.code === "not_configured") {
      held.push({ ...line, reserved: false });
      continue;
    }

    /* The shelf emptied between the checkout's stock check and this moment.
       Put back everything already held, so an abandoned attempt does not
       quietly consume the shop's stock. */
    await releaseLines(held, input.reference, "checkout refused");
    return { ok: false, code: "sold_out", describe: line.describe };
  }

  const rows = (await q`
    INSERT INTO orders (reference, name, email, address, postcode, phone,
                        lines, subtotal_p, delivery_p, total_p)
    VALUES (${input.reference}, ${input.customer.name}, ${input.customer.email},
            ${input.customer.address}, ${input.customer.postcode},
            ${input.customer.phone},
            ${JSON.stringify(held)}::jsonb,
            ${input.subtotalP}, ${input.deliveryP}, ${input.totalP})
    RETURNING *
  `) as Record<string, unknown>[];

  return { ok: true, order: rowToOrder(rows[0]) };
}

/** Put reserved pieces back on the shelf. Used when a checkout is refused
 *  part-way and when an abandoned order is swept up. */
async function releaseLines(lines: OrderLine[], reference: string, why: string) {
  for (const line of lines) {
    if (!line.reserved) continue;
    await adjust(line.variantId, +line.qty, "returned", `${why} — ${reference}`);
  }
}

export async function orderByReference(reference: string): Promise<Order | null> {
  const q = sql();
  if (!q) return null;
  await ensureOrderSchema();
  const rows = (await q`
    SELECT * FROM orders WHERE reference = ${reference}
  `) as Record<string, unknown>[];
  return rows.length ? rowToOrder(rows[0]) : null;
}

/** Confirm a payment. Idempotent, and that is not a nicety — the success page
 *  is a URL a customer can reload, and the reconciliation sweep can reach the
 *  same order a moment later. Marking paid twice must not send two emails or
 *  move the stock again.
 *
 *  Stock is NOT touched here: the pieces came off the shelf when the order was
 *  created. Payment confirms the reservation, it does not repeat it. */
export async function markPaid(reference: string): Promise<{ order: Order; changed: boolean } | null> {
  const q = sql();
  if (!q) return null;
  await ensureOrderSchema();

  const rows = (await q`
    UPDATE orders SET status = 'paid', updated_at = now()
    WHERE reference = ${reference} AND status = 'pending'
    RETURNING *
  `) as Record<string, unknown>[];

  if (rows.length) return { order: rowToOrder(rows[0]), changed: true };

  const existing = await orderByReference(reference);
  return existing ? { order: existing, changed: false } : null;
}

/** The payment failed or was abandoned: put the pieces back. Also idempotent. */
export async function releaseOrder(
  reference: string,
  status: Extract<OrderStatus, "failed" | "released">,
  why: string,
): Promise<Order | null> {
  const q = sql();
  if (!q) return null;
  await ensureOrderSchema();

  const rows = (await q`
    UPDATE orders SET status = ${status}, updated_at = now()
    WHERE reference = ${reference} AND status = 'pending'
    RETURNING *
  `) as Record<string, unknown>[];

  if (!rows.length) return orderByReference(reference);

  const order = rowToOrder(rows[0]);
  await releaseLines(order.lines, reference, why);
  return order;
}

/** Orders the shop still has to do something about, newest first. */
export async function listOrders(limit = 50): Promise<Order[] | null> {
  const q = sql();
  if (!q) return null;
  await ensureOrderSchema();
  const rows = (await q`
    SELECT * FROM orders
    WHERE status IN ('paid', 'pending')
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as Record<string, unknown>[];
  return rows.map(rowToOrder);
}

/** She has put it in the post. */
export async function markPosted(reference: string): Promise<Order | null> {
  const q = sql();
  if (!q) return null;
  await ensureOrderSchema();
  const rows = (await q`
    UPDATE orders SET posted_at = now(), updated_at = now()
    WHERE reference = ${reference} AND status = 'paid'
    RETURNING *
  `) as Record<string, unknown>[];
  return rows.length ? rowToOrder(rows[0]) : null;
}

/** Pending orders older than `minutes`, for the reconciliation sweep to ask
 *  SumUp about. A customer who pays and closes the tab never reaches the
 *  success page, so without this their order would sit pending forever and
 *  their garment would stay off the shelf. */
export async function stalePendingOrders(minutes = 30): Promise<Order[] | null> {
  const q = sql();
  if (!q) return null;
  await ensureOrderSchema();
  const rows = (await q`
    SELECT * FROM orders
    WHERE status = 'pending'
      AND created_at < now() - (${minutes} * INTERVAL '1 minute')
    ORDER BY created_at ASC
    LIMIT 100
  `) as Record<string, unknown>[];
  return rows.map(rowToOrder);
}

/** Build an order line from a priced checkout line. Keeps the variant id
 *  derivation in one place so the order and the stock row cannot disagree
 *  about which garment they mean. */
export function toOrderLine(l: {
  slug: string;
  name: string;
  size: string;
  colour: string;
  qty: number;
  priceP: number;
  describe: string;
}): Omit<OrderLine, "reserved"> {
  return {
    variantId: variantId(l.slug, l.size, l.colour),
    slug: l.slug,
    describe: l.describe,
    size: l.size,
    colour: l.colour,
    qty: l.qty,
    priceP: l.priceP,
  };
}
