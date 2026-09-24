"use client";

import Link from "next/link";
import { useState } from "react";

import { products } from "@/lib/catalogue";
import { look } from "@/lib/look";
import { Price } from "@/components/Price";

/* Shop the look (2026-09-24, Brad): her shop window with a dot on each
 * piece, and the same pieces listed beside it. The list is the real control
 * (plain links, in reading order); the dots are a shortcut that highlights
 * the matching row and are themselves links. See lib/look.ts for the
 * pending client confirmation. */
const PIECES = look.spots
  .map((s, i) => ({ ...s, n: i + 1, p: products.find((p) => p.slug === s.slug) }))
  .filter((s) => s.p);

const set = (ext: string) =>
  [640, 760].map((w) => `/img/about/${look.image}-${w}.${ext} ${w}w`).join(", ");

export function ShopTheLook() {
  const [on, setOn] = useState<number | null>(null);
  if (PIECES.length === 0) return null;

  return (
    <section className="stl" aria-labelledby="stl-h">
      <div className="stl-inner">
        <figure className="stl-media">
          <picture>
            <source type="image/avif" srcSet={set("avif")} sizes="(min-width: 1024px) 50vw, 100vw" />
            <source type="image/webp" srcSet={set("webp")} sizes="(min-width: 1024px) 50vw, 100vw" />
            <img src={`/img/about/${look.image}-960.jpg`} alt={look.alt} width={look.w} height={look.h} loading="lazy" decoding="async" className="stl-img" />
          </picture>
          {PIECES.map((s) => (
            <Link
              key={s.slug}
              href={`/shop/${s.slug}`}
              className="stl-dot"
              data-on={on === s.n ? "" : undefined}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              onPointerEnter={() => setOn(s.n)}
              onPointerLeave={() => setOn(null)}
              onFocus={() => setOn(s.n)}
              onBlur={() => setOn(null)}
            >
              <span aria-hidden="true">{s.n}</span>
              <span className="sr-only">{s.p!.name}</span>
            </Link>
          ))}
        </figure>

        <div className="stl-copy">
          <p className="label stl-eyebrow">Shop the look</p>
          <h2 id="stl-h" className="stl-h">
            Straight from <em>the window.</em>
          </h2>
          <p className="stl-lede">Everything on the mannequins is on the rails. Tap a piece to see it.</p>
          <ol className="stl-list">
            {PIECES.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/shop/${s.slug}`}
                  className="stl-row"
                  data-on={on === s.n ? "" : undefined}
                  onPointerEnter={() => setOn(s.n)}
                  onPointerLeave={() => setOn(null)}
                >
                  <span className="stl-n" aria-hidden="true">{s.n}</span>
                  <span className="stl-name">{s.p!.name}</span>
                  <span className="stl-price"><Price priceP={s.p!.priceP} /></span>
                  <span className="stl-arrow" aria-hidden="true">&rarr;</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
