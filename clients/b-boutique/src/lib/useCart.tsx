"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import { deliveryFor, productBySlug } from "./catalogue";
import { coloursFor } from "./variants";

/* The bag.
 *
 * ── Why there is no context and no provider ───────────────────────────────
 * The first version of this was a context: three places need the same live
 * bag — the header count, the add button on a product, and the bag page — and
 * shared state that several components mutate is the textbook case for one.
 *
 * It was wrong, and the lint rule that rejected it was right. The bag does not
 * live in React; it lives in localStorage, which is an external store that
 * changes behind React's back — another tab can change it. Mirroring an
 * external store into React state means an effect that calls setState on
 * mount, a cascading render, and two copies that agree only until they don't.
 *
 * `useSyncExternalStore` is the API for exactly this shape: one subscription,
 * one snapshot, and every component reading the same value with no provider
 * to thread through the tree and nothing to keep in step.
 *
 * ── Hydration ─────────────────────────────────────────────────────────────
 * The server cannot know what is in somebody's bag, so `getServerSnapshot`
 * returns a frozen empty array and the server renders an empty bag. React
 * hydrates against that and then re-reads from the client snapshot, which is
 * the documented two-pass behaviour rather than a mismatch. EMPTY is a module
 * constant because a new [] on every call is a new reference, and a snapshot
 * that changes identity on every read is an infinite render loop.
 *
 * ── What is stored ────────────────────────────────────────────────────────
 * Slug, size, COLOUR and quantity. NOT the price.
 *
 * Colour is part of the line and part of its identity, not a label on it. The
 * camel coat in a 12 and the black one in a 12 are two different things to
 * own and two different things to sell, so they are two lines in the bag and
 * two rows in the stock table — the same `variantId` in both places, which is
 * what lets the bag, the checkout and her stock list talk about one garment
 * without a second lookup table to keep in step.
 *
 * A piece whose colour the client has not confirmed carries `colour: ""`,
 * which renders as nothing rather than as a guess.
 *
 * The price is NOT stored. A price copied into the bag is a price that can be
 * edited in devtools, and a price that goes stale the moment
 * the catalogue changes; both are answered by looking it up on every read. The
 * server prices the bag again before charging — see app/api/checkout.
 */

export type BagLine = {
  slug: string;
  size: string;
  /** "" when the client has not confirmed a colour for this piece. */
  colour: string;
  qty: number;
};

/** Two lines are the same line when they are the same variant. */
const same = (a: { slug: string; size: string; colour: string }, b: BagLine) =>
  a.slug === b.slug && a.size === b.size && a.colour === b.colour;

const KEY = "bb-bag-v1";
/* Six, not ten.
   Ten was a round number picked before anybody knew what this shop holds.
   Her opening counts run 1 to 6 per colourway across all 54 of them, so ten
   let a customer put more of a piece in the bag than the shop has ever owned
   — and on a rail where most lines are one or two, that is not a theoretical
   limit, it is the ordinary case.

   This is a CEILING, not the stock check. The real gate is `countsFor` in
   /api/checkout, which refuses to sell more of a variant than the database
   says exists and fails closed if the database errors. That gate has been
   right since 2026-09-20 and has simply had nothing to check against, because
   the stock table is empty. scripts/import-stock.mjs fills it. */
const MAX_QTY = 6;

/** One shared reference for "nothing in the bag", on the server and before
 *  the first read. A fresh [] each time would change identity every render. */
const EMPTY: readonly BagLine[] = Object.freeze<BagLine[]>([]);

let snapshot: readonly BagLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function parse(raw: string | null): readonly BagLine[] {
  if (!raw) return EMPTY;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return EMPTY;
  }
  if (!Array.isArray(parsed)) return EMPTY;

  /* Anything in localStorage is untrusted: another tab, an older version of
     this code, or somebody with devtools open. Rebuild each line and drop
     anything that does not describe a product that still exists, at a size it
     is still sold in. */
  const lines = parsed.flatMap((entry): BagLine[] => {
    if (typeof entry !== "object" || entry === null) return [];
    const { slug, size, colour, qty } = entry as Record<string, unknown>;
    if (typeof slug !== "string" || typeof size !== "string") return [];
    /* Lines written before the bag knew about colour have none. They are read
       as the blank colour, which is exactly what every piece carries while no
       colour is confirmed — so nothing in anybody's bag is lost today. The
       moment a piece gains real colours, a blank line for it stops matching a
       variant below and is dropped rather than guessed into one of them. */
    const c = typeof colour === "string" ? colour : "";
    const product = productBySlug(slug);
    if (!product || !product.sizes.includes(size)) return [];
    if (!coloursFor(slug).includes(c)) return [];
    const n = Math.floor(Number(qty));
    if (!Number.isFinite(n) || n < 1) return [];
    return [{ slug, size, colour: c, qty: Math.min(n, MAX_QTY) }];
  });

  return lines.length ? lines : EMPTY;
}

function load(): readonly BagLine[] {
  try {
    return parse(window.localStorage.getItem(KEY));
  } catch {
    /* Private mode, blocked storage. An empty bag is the right answer — never
       a crash on a page somebody is shopping. */
    return EMPTY;
  }
}

function emit() {
  for (const l of listeners) l();
}

function write(next: readonly BagLine[]) {
  snapshot = next.length ? next : EMPTY;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    /* Storage full or blocked. The bag still works for this page view. */
  }
  emit();
}

function subscribe(onChange: () => void) {
  /* The first subscriber pulls the stored bag in. Doing it here rather than
     in an effect is the point of this API: the store loads itself, React just
     reads it. */
  if (!loaded) {
    loaded = true;
    snapshot = load();
  }
  listeners.add(onChange);

  /* Another tab is another copy of this page. Without this, adding something
     in one tab and checking out in another charges for the wrong bag. */
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    snapshot = parse(e.newValue);
    emit();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => EMPTY;

export function useCart() {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const add = useCallback((slug: string, size: string, colour: string) => {
    const at = snapshot.findIndex((l) => same({ slug, size, colour }, l));
    if (at === -1) {
      write([...snapshot, { slug, size, colour, qty: 1 }]);
      return;
    }
    const next = [...snapshot];
    next[at] = { ...next[at], qty: Math.min(next[at].qty + 1, MAX_QTY) };
    write(next);
  }, []);

  const setQty = useCallback(
    (slug: string, size: string, colour: string, qty: number) => {
      const key = { slug, size, colour };
      write(
        qty < 1
          ? snapshot.filter((l) => !same(key, l))
          : snapshot.map((l) =>
              same(key, l) ? { ...l, qty: Math.min(qty, MAX_QTY) } : l,
            ),
      );
    },
    [],
  );

  const remove = useCallback((slug: string, size: string, colour: string) => {
    write(snapshot.filter((l) => !same({ slug, size, colour }, l)));
  }, []);

  const clear = useCallback(() => write(EMPTY), []);

  return useMemo(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    /* Priced from the catalogue, never from the stored line. */
    const subtotalP = lines.reduce((sum, l) => {
      const p = productBySlug(l.slug);
      return p ? sum + p.priceP * l.qty : sum;
    }, 0);
    /* One definition of the delivery rule, shared with the checkout, so the
       price shown in the bag and the price actually charged cannot drift. */
    const deliveryP = count === 0 ? 0 : deliveryFor(subtotalP);
    return {
      lines,
      count,
      subtotalP,
      deliveryP,
      totalP: subtotalP + deliveryP,
      add,
      setQty,
      remove,
      clear,
    };
  }, [lines, add, setQty, remove, clear]);
}
