import "server-only";
import { randomBytes } from "node:crypto";
import { sql } from "./stock";

/** The stock book (2026-10-10, Brad): where Hayley logs each new piece as it
 *  arrives, on /stock/book behind the same passcode as the stock list.
 *
 *  ── Why it lives here and not in a Claude artifact ────────────────────────
 *  The first version was a claude.ai artifact with its own database. It
 *  needed her to have a Claude account on an invited email and could never
 *  be opened from a public link (outside visitors cannot write), and the
 *  link she tapped in WhatsApp opened in WhatsApp's own browser, signed out,
 *  as "Page not found". This page opens in any browser with the PIN she
 *  already uses every day.
 *
 *  ── What an entry is ──────────────────────────────────────────────────────
 *  The supplier's page (name, fabric, sizes and photos are read from it), the
 *  price as it will show, each colour with how many and which sizes, and a
 *  note. Status is one of three words: `new` (waiting for us), `question`
 *  (we have asked her something; `reply` holds it and her `answer` comes
 *  back and flips it to `new` again), `done` (live; `productUrl` points at
 *  the page). Only Black Line sets `done` and `question`, through the same
 *  signed-in endpoint, from scripts/stock-book.mjs.
 *
 *  ── The rules that keep it honest ─────────────────────────────────────────
 *  Her price and counts are what she wrote: nothing here rounds, guesses or
 *  "corrects" them. A piece she has not finished describing is a question,
 *  never a guess. Nothing on the shop reads this table: it is an inbox for
 *  us, and the website changes only when a build ships. */

export type BookColour = { colour: string; qty: number; sizes: string };
export type BookStatus = "new" | "question" | "done";

export type BookEntry = {
  id: string;
  url: string;
  name: string;
  priceP: number;
  colours: BookColour[];
  notes: string;
  status: BookStatus;
  reply: string;
  answer: string;
  productUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type BookInput = {
  url: string;
  name: string;
  priceP: number;
  colours: BookColour[];
  notes: string;
};

const SCHEMA = `CREATE TABLE IF NOT EXISTS stock_book (
  id          TEXT PRIMARY KEY,
  url         TEXT NOT NULL,
  name        TEXT NOT NULL DEFAULT '',
  price_p     INTEGER NOT NULL CHECK (price_p > 0),
  colours     JSONB NOT NULL,
  notes       TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'question', 'done')),
  reply       TEXT NOT NULL DEFAULT '',
  answer      TEXT NOT NULL DEFAULT '',
  product_url TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
)`;

let ready: Promise<void> | null = null;
function ensure(q: NonNullable<ReturnType<typeof sql>>) {
  ready ??= q
    .query(SCHEMA)
    .then(() => undefined)
    .catch((err) => {
      ready = null;
      throw err;
    });
  return ready;
}

export function bookIsConfigured(): boolean {
  return sql() !== null;
}

/* ── Validation: the one place the shape is decided ─────────────────────── */

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Check what the page (or anyone POSTing) sent. Returns the cleaned entry
 *  or the first thing wrong with it, in words she will see. */
export function validateInput(raw: unknown): { ok: true; input: BookInput } | { ok: false; problem: string } {
  const b = (raw ?? {}) as Record<string, unknown>;
  const url = str(b.url, 500);
  if (!/^https?:\/\/\S+\.\S+/.test(url)) return { ok: false, problem: "Paste the supplier's page link, starting with http." };
  const priceP = typeof b.priceP === "number" ? b.priceP : Number.NaN;
  if (!Number.isInteger(priceP) || priceP < 100 || priceP > 99900) return { ok: false, problem: "Enter the price in pounds, like 26 or 44.99." };
  const rawColours = Array.isArray(b.colours) ? b.colours.slice(0, 12) : [];
  const colours: BookColour[] = [];
  for (const c of rawColours as Record<string, unknown>[]) {
    const colour = str(c?.colour, 40);
    const qty = typeof c?.qty === "number" ? c.qty : Number.NaN;
    const sizes = str(c?.sizes, 80);
    if (!colour) return { ok: false, problem: "Every colour row needs a colour name." };
    if (!Number.isInteger(qty) || qty < 1 || qty > 999) return { ok: false, problem: `How many ${colour}? A whole number, 1 or more.` };
    colours.push({ colour, qty, sizes });
  }
  if (colours.length === 0) return { ok: false, problem: "Add at least one colour with how many you have." };
  return { ok: true, input: { url, name: str(b.name, 80), priceP, colours, notes: str(b.notes, 500) } };
}

/* ── Reads ──────────────────────────────────────────────────────────────── */

type Row = {
  id: string; url: string; name: string; price_p: number; colours: unknown; notes: string;
  status: BookStatus; reply: string; answer: string; product_url: string; created_at: string; updated_at: string;
};

function fromRow(r: Row): BookEntry {
  const colours = (typeof r.colours === "string" ? JSON.parse(r.colours) : r.colours) as BookColour[];
  return {
    id: r.id, url: r.url, name: r.name, priceP: Number(r.price_p), colours, notes: r.notes,
    status: r.status, reply: r.reply, answer: r.answer, productUrl: r.product_url,
    createdAt: new Date(r.created_at).toISOString(), updatedAt: new Date(r.updated_at).toISOString(),
  };
}

/** Every entry, newest first. Null when there is no database. */
export async function listBook(): Promise<BookEntry[] | null> {
  const q = sql();
  if (!q) return null;
  await ensure(q);
  const rows = (await q`SELECT * FROM stock_book ORDER BY created_at DESC LIMIT 500`) as Row[];
  return rows.map(fromRow);
}

async function one(q: NonNullable<ReturnType<typeof sql>>, id: string): Promise<BookEntry | null> {
  const rows = (await q`SELECT * FROM stock_book WHERE id = ${id}`) as Row[];
  return rows[0] ? fromRow(rows[0]) : null;
}

/* ── Her writes ─────────────────────────────────────────────────────────── */

export async function addEntry(input: BookInput): Promise<BookEntry | null> {
  const q = sql();
  if (!q) return null;
  await ensure(q);
  /* Short and unguessable enough for a URL she never types. */
  const id = randomBytes(6).toString("base64url");
  await q`INSERT INTO stock_book (id, url, name, price_p, colours, notes)
          VALUES (${id}, ${input.url}, ${input.name}, ${input.priceP}, ${JSON.stringify(input.colours)}::jsonb, ${input.notes})`;
  return one(q, id);
}

/** Edit a piece that is not live yet. A live piece is the website's now;
 *  changing it is a new entry or a message. */
export async function editEntry(id: string, input: BookInput): Promise<BookEntry | null> {
  const q = sql();
  if (!q) return null;
  await ensure(q);
  await q`UPDATE stock_book
          SET url = ${input.url}, name = ${input.name}, price_p = ${input.priceP},
              colours = ${JSON.stringify(input.colours)}::jsonb, notes = ${input.notes}, updated_at = now()
          WHERE id = ${id} AND status <> 'done'`;
  return one(q, id);
}

/** Any status: a live piece cleared from the book stays on the website,
 *  because nothing on the shop reads this table. The book is her inbox to
 *  us, and she can tidy it. */
export async function removeEntry(id: string): Promise<boolean> {
  const q = sql();
  if (!q) return false;
  await ensure(q);
  const rows = (await q`DELETE FROM stock_book WHERE id = ${id} RETURNING id`) as { id: string }[];
  return rows.length > 0;
}

/** Her answer to our question puts the piece back in our queue. */
export async function answerEntry(id: string, answer: string): Promise<BookEntry | null> {
  const q = sql();
  if (!q) return null;
  await ensure(q);
  await q`UPDATE stock_book SET answer = ${answer}, status = 'new', updated_at = now()
          WHERE id = ${id} AND status = 'question'`;
  return one(q, id);
}

/* ── Our writes (scripts/stock-book.mjs, signed in with the same PIN) ──── */

export async function askQuestion(id: string, reply: string): Promise<BookEntry | null> {
  const q = sql();
  if (!q) return null;
  await ensure(q);
  await q`UPDATE stock_book SET reply = ${reply}, status = 'question', updated_at = now() WHERE id = ${id} AND status <> 'done'`;
  return one(q, id);
}

export async function markDone(id: string, productUrl: string): Promise<BookEntry | null> {
  const q = sql();
  if (!q) return null;
  await ensure(q);
  await q`UPDATE stock_book SET product_url = ${productUrl}, status = 'done', updated_at = now() WHERE id = ${id}`;
  return one(q, id);
}
