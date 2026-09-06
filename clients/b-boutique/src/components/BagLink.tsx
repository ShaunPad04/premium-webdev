"use client";

import Link from "next/link";

import { useCart } from "@/lib/useCart";

/* BAG in the header.
 *
 * The server renders "(0)" because it cannot know what is in somebody's bag,
 * and React hydrates against that before re-reading the real count from the
 * store — the documented two-pass behaviour of useSyncExternalStore rather
 * than a mismatch. See lib/useCart.
 *
 * The accessible name carries the count in words, because "Bag (2)" read
 * aloud as "bag bracket two" is worse than "Bag, 2 items". */
export function BagLink() {
  const { count } = useCart();

  return (
    <Link
      href="/bag"
      className="nav-link text-[10px] font-semibold uppercase leading-none tracking-[0.14em]"
      aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}
    >
      <span aria-hidden="true">Bag ({count})</span>
    </Link>
  );
}
