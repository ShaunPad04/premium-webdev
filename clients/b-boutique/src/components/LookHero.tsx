"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { productBySlug } from "@/lib/catalogue";
import { Price } from "./Price";
import { Cta, Where } from "./HeroStrips";

/* The lookbook hero (2026-09-25, preview for Brad).
 *
 * One campaign frame: a model in two real pieces from the rail, generated
 * in Higgsfield from those pieces' own product photographs and checked
 * against them. A dot sits on each garment; hovering (or focusing, or on a
 * phone tapping) one opens a card with the piece's name, colour and price
 * and a link to it. "Shop the look" opens both.
 *
 * The dots are placed in the photograph's own coordinates, inside a box
 * sized exactly as `object-fit: cover` sizes the picture, so they stay on
 * the garment at any screen shape. The desktop frame is 16:9; the phone
 * frame is the same photograph with the backdrop extended to 9:16. */

type Spot = { slug: string; colour: string; d: [number, number]; m: [number, number]; side: "l" | "r" };

const SPOTS: Spot[] = [
  { slug: "italian-knit-ribbed-cardigan", colour: "Cream", d: [66.5, 47], m: [79, 50], side: "r" },
  { slug: "tailored-barrel-fit-trousers", colour: "Black", d: [52, 68], m: [55, 68], side: "l" },
];

export function LookHero() {
  const [open, setOpen] = useState<number | null>(null);
  const [all, setAll] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();

  /* A tap anywhere else closes an open card; Escape too. */
  useEffect(() => {
    if (open === null && !all) return;
    const off = (e: PointerEvent) => {
      if (!(e.target as Element).closest(".lk-spot, .lk-look")) {
        setOpen(null);
        setAll(false);
      }
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setAll(false);
      }
    };
    document.addEventListener("pointerdown", off);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", off);
      document.removeEventListener("keydown", esc);
    };
  }, [open, all]);

  return (
    <div className="lk" ref={root}>
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
          const shown = all || open === i;
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
              <button
                type="button"
                className="lk-dot"
                aria-expanded={shown}
                aria-controls={`${id}-${i}`}
                aria-label={`${p.name}, show details`}
                onClick={() => setOpen((v) => (v === i ? null : i))}
                onFocus={() => setOpen(i)}
              >
                <span aria-hidden="true" />
              </button>
              <Link href={`/shop/${p.slug}`} id={`${id}-${i}`} className="lk-card" tabIndex={shown ? 0 : -1} aria-hidden={!shown}>
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
          <button type="button" className="lk-look" aria-pressed={all} onClick={() => setAll((v) => !v)}>
            {all ? "Hide the pieces" : "Shop the look"}
          </button>
        </div>
      </div>
      <Where />
    </div>
  );
}
