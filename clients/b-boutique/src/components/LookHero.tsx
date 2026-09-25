"use client";

import Link from "next/link";
import { useState } from "react";

import { productBySlug } from "@/lib/catalogue";
import { Price } from "./Price";
import { Cta, Where } from "./HeroStrips";

/* The lookbook hero (2026-09-25, preview for Brad).
 *
 * One campaign frame: a model in two real pieces from the rail, generated
 * in Higgsfield from those pieces' own product photographs and checked
 * against them. A dot sits on each garment and is the link to that exact
 * piece: click or tap it and you are on its page. Hovering or focusing it
 * first previews a card with the name, colour and price. (Brad, 25 Sep:
 * the dot should go straight to the product; "Shop the look" removed as it
 * repeated Shop all.)
 *
 * The dots are placed in the photograph's own coordinates, inside a box
 * sized exactly as `object-fit: cover` sizes the picture, so they stay on
 * the garment at any screen shape. The desktop frame is 16:9; the phone
 * frame is the same photograph with the backdrop extended to 9:16. */

type Spot = { slug: string; colour: string; d: [number, number]; m: [number, number]; side: "l" | "r" };

const SPOTS: Spot[] = [
  { slug: "italian-knit-ribbed-cardigan", colour: "Cream", d: [70, 47], m: [84, 50], side: "r" },
  { slug: "tailored-barrel-fit-trousers", colour: "Black", d: [52, 68], m: [55, 68], side: "l" },
];

export function LookHero() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="lk">
      <picture className="lk-pic">
        <source media="(min-width: 768px)" type="image/avif" srcSet="/img/hero/look-d1920.avif 1920w, /img/hero/look-d2560.avif 2560w, /img/hero/look-d3840.avif 3840w" sizes="100vw" />
        <source media="(min-width: 768px)" type="image/webp" srcSet="/img/hero/look-d1920.webp 1920w, /img/hero/look-d2560.webp 2560w, /img/hero/look-d3840.webp 3840w" sizes="100vw" />
        <source media="(min-width: 768px)" srcSet="/img/hero/look-d.jpg" />
        <source type="image/avif" srcSet="/img/hero/look-m900.avif 900w, /img/hero/look-m1200.avif 1200w, /img/hero/look-m1800.avif 1800w" sizes="100vw" />
        <source type="image/webp" srcSet="/img/hero/look-m900.webp 900w, /img/hero/look-m1200.webp 1200w, /img/hero/look-m1800.webp 1800w" sizes="100vw" />
        <img
          src="/img/hero/look-m.jpg"
          alt="A model seated on a black block in the Italian Knit Ribbed Cardigan in cream and the Tailored Barrel Fit Trousers in black"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <div className="lk-scrim" aria-hidden="true" />

      <div className="lk-frame">
        {SPOTS.map((s, i) => {
          const p = productBySlug(s.slug);
          if (!p) return null;
          const shown = open === i;
          return (
            <div
              key={s.slug}
              className="lk-spot"
              data-side={s.side}
              data-open={shown || undefined}
              style={{ "--dx": `${s.d[0]}%`, "--dy": `${s.d[1]}%`, "--mx": `${s.m[0]}%`, "--my": `${s.m[1]}%` } as React.CSSProperties}
              onMouseEnter={() => setOpen(i)}
              onMouseLeave={() => setOpen((v) => (v === i ? null : v))}
            >
              <Link
                href={`/shop/${p.slug}`}
                className="lk-dot"
                aria-label={`${p.name} in ${s.colour.toLowerCase()}, view piece`}
                onFocus={() => setOpen(i)}
                onBlur={() => setOpen((v) => (v === i ? null : v))}
              >
                <span aria-hidden="true" />
              </Link>
              {/* The preview card is the same link, for a pointer that lands
                  on it; keyboard and screen readers already have the dot. */}
              <Link href={`/shop/${p.slug}`} className="lk-card" tabIndex={-1} aria-hidden="true">
                <span className="lk-card-name">{p.name}</span>
                <span className="lk-card-meta">
                  {s.colour} <span aria-hidden="true">·</span> <Price priceP={p.priceP} slug={p.slug} />
                </span>
                <span className="lk-card-go">
                  View piece
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </div>
          );
        })}
      </div>

      <div className="lk-copy">
        <p className="lk-eyebrow">The autumn edit</p>
        <p className="lk-title">Soft knit, sharp tailoring.</p>
        <p className="lk-sub">An Italian ribbed cardigan and a tailored barrel trouser. Two pieces from the rail, one easy outfit.</p>
        <div className="lk-actions">
          <Cta />
        </div>
      </div>
      <Where />
    </div>
  );
}
