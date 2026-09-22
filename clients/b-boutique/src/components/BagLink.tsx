"use client";

import Link from "next/link";

import { useCart } from "@/lib/useCart";

/* The bag in the header — a drawn bag, not the word.
 *
 * The word "BAG (0)" became a picture of a bag at the client's request,
 * 2026-09-22. It is a thin line drawing in currentColor at the same 1.3
 * stroke as the search icon, so it reads as part of the same small-type
 * header rather than as an icon set dropped in from elsewhere. No fill, no
 * badge bubble: the count is a plain numeral inside the bag body, in the
 * header's own 10px Inter, and it only appears once something is in it — a
 * "0" printed on an empty bag is noise.
 *
 * The server renders an empty bag because it cannot know what is in
 * somebody's bag, and React hydrates against that before re-reading the real
 * count from the store — the documented two-pass behaviour of
 * useSyncExternalStore rather than a mismatch. See lib/useCart.
 *
 * The accessible name carries the count in words, because a picture says
 * nothing to a screen reader and "bag bracket two" is worse than "Bag, 2
 * items". The link is padded out to a 44px target; the drawing is 20px. */
export function BagLink() {
  const { count } = useCart();

  return (
    <Link
      href="/bag"
      className="nav-link relative -m-3 inline-flex items-center justify-center p-3"
      aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        className="block"
      >
        {/* Body, then the handle arching above it. */}
        <path
          d="M3.6 6.4h12.8l-.9 11H4.5l-.9-11Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path
          d="M7 8.6V5.4a3 3 0 0 1 6 0v3.2"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
      {count > 0 ? (
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[calc(50%+2.5px)] -translate-x-1/2 -translate-y-1/2 text-[8.5px] font-semibold leading-none tabular-nums"
        >
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}
