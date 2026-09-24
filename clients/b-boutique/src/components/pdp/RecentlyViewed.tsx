"use client";

import Link from "next/link";
import { useEffect } from "react";

import { markViewed, useRecent } from "@/lib/useSaved";
import { ProductPhoto } from "../ProductPhoto";

export type Mini = { slug: string; name: string; photo: string; price: string; square: boolean };

/* Recently viewed, from this browser only. Records the current piece, shows
   up to four others. Renders nothing on a first visit. */
export function RecentlyViewed({ current, all }: { current: string; all: Mini[] }) {
  const recent = useRecent();
  useEffect(() => markViewed(current), [current]);
  const items = recent
    .filter((s) => s !== current)
    .map((s) => all.find((p) => p.slug === s))
    .filter((p): p is Mini => Boolean(p))
    .slice(0, 4);
  if (items.length === 0) return null;

  return (
    <section className="rv" aria-labelledby="rv-h">
      <h2 id="rv-h" className="rv-h">Recently viewed</h2>
      <ul className="rv-row">
        {items.map((p) => (
          <li key={p.slug}>
            <Link href={`/shop/${p.slug}`} className="rv-card">
              <span className="rv-media">
                <ProductPhoto photo={p.photo} square={p.square} sizes="(min-width: 1024px) 220px, 42vw" className="absolute inset-0 h-full w-full object-cover" />
              </span>
              <span className="rv-name">{p.name}</span>
              <span className="rv-price">{p.price}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
