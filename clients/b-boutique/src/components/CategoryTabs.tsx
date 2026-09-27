"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { featured } from "@/lib/shop";

/* Shop by category as four panels (2026-09-27, Brad picked C, "Hover
 * expand", of three 21st-ui-explore directions; A was four portraits in a
 * row, B a list of names beside one photo). It replaced pill tabs over one
 * widened 16:9 photo, which he called terrible on desktop.
 *
 * The panel pointed at, or focused, opens to the whole portrait with a
 * "Shop <category>" pill; the others narrow to strips with the name running
 * up them. Phones stack the four as bands: the first tap opens a closed
 * band, the second (on the open one) shops. Her four real 3:4 portraits;
 * the widened desktop versions were retired with the tabs.
 *
 * Stays at #rails, so every "/#rails" link still lands here. */

const Arrow = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export function CategoryTabs() {
  const [on, setOn] = useState(0);
  /* A tap fires pointerenter just before click, which would open the panel
     and then follow the link in one go. Hover opens for a mouse only; a
     touch or pen press is remembered so its click can open instead. Focus
     opens a panel only from the keyboard, since a tap focuses the link too. */
  const touch = useRef(false);

  return (
    <section id="rails" aria-labelledby="rails-heading" className="ctab">
      <div className="ctab-inner">
        <div className="ctab-head">
          <h2 id="rails-heading" className="ctab-h">Shop by category</h2>
          <Link href="/clothing" className="ctab-all">Shop all <Arrow /></Link>
        </div>
        <ul className="ctab-row">
          {featured.map((c, i) => (
            <li key={c.slug} className="ctab-panel" data-on={i === on ? "" : undefined} onPointerEnter={(e) => { if (e.pointerType === "mouse") setOn(i); }}>
              <Link
                href={c.href}
                className="ctab-link"
                onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) setOn(i); }}
                onPointerDown={(e) => { touch.current = e.pointerType !== "mouse"; }}
                onClick={(e) => {
                  if (touch.current && i !== on) { e.preventDefault(); setOn(i); }
                }}
              >
                <picture className="ctab-pic">
                  <source type="image/avif" srcSet={`/img/cat/${c.slug}-p800.avif 800w, /img/cat/${c.slug}-p1200.avif 1200w`} sizes="(min-width: 1024px) 60vw, 100vw" />
                  <source type="image/webp" srcSet={`/img/cat/${c.slug}-p800.webp 800w, /img/cat/${c.slug}-p1200.webp 1200w`} sizes="(min-width: 1024px) 60vw, 100vw" />
                  <img src={`/img/cat/${c.slug}-p800.webp`} alt="" loading="lazy" decoding="async" draggable={false} />
                </picture>
                <span className="ctab-label">
                  <span className="ctab-n" aria-hidden="true">{c.number}</span>
                  <span className="ctab-name">{c.name}</span>
                </span>
                <span className="ctab-cta" aria-hidden="true">Shop {c.name.toLowerCase()} <Arrow /></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
