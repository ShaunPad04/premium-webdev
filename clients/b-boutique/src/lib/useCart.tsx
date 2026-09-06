"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import { DELIVERY_P, productBySlug } from "./catalogue";

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
 * Slug, size and quantity. NOT the price. A price copied into the bag is a
 * price that can be edited in devtools, and a price that goes stale the moment
 * the catalogue changes; both are answered by looking it up on every read. The
 * server prices the bag again before charging — see app/api/checkout.
 */

export type BagLine = { slug: string; size: string; qty: number };

const KEY = "bb-bag-v1";
const MAX_QTY = 10;

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
    const { slug, size, qty } = entry as Record<string, unknown>;
    if (typeof slug !== "string" || typeof size !== "string") return [];
    const product = productBySlug(slug);
    if (!product || !product.sizes.includes(size)) return [];
    const n = Math.floor(Number(qty));
    if (!Number.isFinite(n) || n < 1) return [];
    return [{ slug, size, qty: Math.min(n, MAX_QTY) }];
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

  const add = useCallback((slug: string, size: string) => {
    const at = snapshot.findIndex((l) => l.slug === slug && l.size === size);
    if (at === -1) {
      write([...snapshot, { slug, size, qty: 1 }]);
      return;
    }
    const next = [...snapshot];
    next[at] = { ...next[at], qty: Math.min(next[at].qty + 1, MAX_QTY) };
    write(next);
  }, []);

  const setQty = useCallback((slug: string, size: string, qty: number) => {
    write(
      qty < 1
        ? snapshot.filter((l) => !(l.slug === slug && l.size === size))
        : snapshot.map((l) =>
            l.slug === slug && l.size === size
              ? { ...l, qty: Math.min(qty, MAX_QTY) }
              : l,
          ),
    );
  }, []);

  const remove = useCallback((slug: string, size: string) => {
    write(snapshot.filter((l) => !(l.slug === slug && l.size === size)));
  }, []);

  const clear = useCallback(() => write(EMPTY), []);

  return useMemo(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    /* Priced from the catalogue, never from the stored line. */
    const subtotalP = lines.reduce((sum, l) => {
      const p = productBySlug(l.slug);
      return p ? sum + p.priceP * l.qty : sum;
    }, 0);
    const deliveryP = count === 0 ? 0 : DELIVERY_P;
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
