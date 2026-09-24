import type { StockView } from "./stock";

/* Scarcity badges, from counted stock only (2026-09-24, Brad: "driven by
 * stock data").
 *
 * Until now no count reached a visitor at all, on the principle that "only 1
 * left" is a claim about a real business. The rule is kept, narrowed: a badge
 * is shown only when EVERY variant of the piece has been counted in the stock
 * database, so the total it states is a fact rather than a guess. A piece
 * with even one uncounted variant gets no badge. With no database connected,
 * nothing gets a badge. The label is worked out here, on the server; the
 * visitor receives the words, never the numbers behind them. */

export type Badge =
  | { kind: "one-of-one"; label: "One of one" }
  | { kind: "only-two"; label: "Only 2 left" }
  | { kind: "last-in-size"; label: string; size: string };

export function badgesFrom(rows: StockView[]): Record<string, Badge> {
  const bySlug = new Map<string, StockView[]>();
  for (const r of rows) {
    const list = bySlug.get(r.slug) ?? [];
    list.push(r);
    bySlug.set(r.slug, list);
  }

  const out: Record<string, Badge> = {};
  for (const [slug, vs] of bySlug) {
    if (vs.some((v) => v.qty === null)) continue;
    const total = vs.reduce((n, v) => n + (v.qty ?? 0), 0);
    if (total === 1) {
      out[slug] = { kind: "one-of-one", label: "One of one" };
      continue;
    }
    if (total === 2) {
      out[slug] = { kind: "only-two", label: "Only 2 left" };
      continue;
    }
    if (total > 2) {
      const bySize = new Map<string, number>();
      for (const v of vs) bySize.set(v.size, (bySize.get(v.size) ?? 0) + (v.qty ?? 0));
      const sizes = [...bySize.entries()];
      const last = sizes.find(([, n]) => n === 1);
      if (last && sizes.length > 1) {
        out[slug] = { kind: "last-in-size", label: `Last one in ${last[0]}`, size: last[0] };
      }
    }
  }
  return out;
}
