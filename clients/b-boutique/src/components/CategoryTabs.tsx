"use client";

import Link from "@/components/Link";
import { useEffect, useRef, useState } from "react";

import { featured } from "@/lib/shop";

/* Shop by category (2026-09-27). Desktop: four panels, Brad's pick C
 * ("Hover expand") of three 21st-ui-explore directions; the panel pointed at
 * or keyboard-focused opens to the whole portrait with a "Shop <category>"
 * pill, the others narrow to strips with the name running up them, and on a
 * touch screen of that width the first tap opens a panel, the second shops.
 * Phones and tablets since 2026-09-29: folding strips, Brad's pick C of three
 * (A swipe cards without the Shop pill, B cards stacking on scroll). Four
 * strips stacked with their names; the open one shows the whole photograph
 * with the desktop's tag, name and "Shop <category>" line. The first tap on
 * a closed strip opens it, a tap on the open one shops. (It replaced swipe
 * cards with a Shop pill, which replaced pill tabs over one 16:9 photo.)
 * Her four real 3:4 portraits throughout.
 *
 * Stays at #rails, so every "/#rails" link still lands here. */

/* Wide enough for the side-by-side panels, where a mouse opens one by
   hovering. Below it the strips stack, and hovering down them would move
   them under the pointer, so there a click opens a strip too. */
const desk = () => window.matchMedia("(min-width: 1024px)").matches;

const UpRight = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const Arrow = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export function CategoryTabs() {
  const [on, setOn] = useState(0);
  /* The four photographs are requested once the page is interactive
     (2026-09-28): the row sits just below the hero, inside Chrome's own
     lazy-load distance, so "loading=lazy" still fetched ~120 KB of them
     while a phone was painting the hero. Nobody reaches the row before
     hydration; until then each card shows its own dark ground. */
  const [pics, setPics] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setPics(true));
    return () => cancelAnimationFrame(id);
  }, []);
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
          {/* No "Shop all" here (2026-09-29, Brad): the hero's Shop all is
              directly above. */}
        </div>
        <ul className="ctab-row">
          {featured.map((c, i) => (
            <li key={c.slug} className="ctab-panel" data-on={i === on ? "" : undefined} onPointerEnter={(e) => { if (e.pointerType === "mouse" && desk()) setOn(i); }}>
              <Link
                href={c.href}
                className="ctab-link"
                onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) setOn(i); }}
                onPointerDown={(e) => { touch.current = e.pointerType !== "mouse"; }}
                onClick={(e) => {
                  if (i !== on && (touch.current || !desk())) { e.preventDefault(); setOn(i); }
                }}
              >
                {pics ? (
                  <picture className="ctab-pic">
                    <source type="image/avif" srcSet={`/img/cat/${c.slug}-p800.avif 800w, /img/cat/${c.slug}-p1200.avif 1200w`} sizes="(min-width: 1024px) 60vw, 100vw" />
                    <source type="image/webp" srcSet={`/img/cat/${c.slug}-p800.webp 800w, /img/cat/${c.slug}-p1200.webp 1200w`} sizes="(min-width: 1024px) 60vw, 100vw" />
                    <img src={`/img/cat/${c.slug}-p800.webp`} alt="" loading="lazy" decoding="async" draggable={false} />
                  </picture>
                ) : null}
                {/* The link's name: every visible label below is a decorative
                    copy that some screen size hides. */}
                <span className="sr-only">{c.name}</span>
                <span className="ctab-label" aria-hidden="true">
                  <span className="ctab-n">{c.number}</span>
                  <span className="ctab-name">{c.name}</span>
                </span>
                <span className="ctab-cta" aria-hidden="true">Shop<span className="ctab-cta-cat"> {c.name.toLowerCase()}</span> <Arrow /></span>
                {/* Desktop, after the 21st.dev Elastic Gallery (Brad,
                    2026-09-27): a glass tag, the name in capitals and a
                    "Shop ↗" line on the open panel; the name running up a
                    closed one. Decorative copies: the link is named by the
                    sr-only span above (no aria-label, 2026-09-28: a label
                    that left out the visible "Shop" failed Lighthouse's
                    label-in-name check). */}
                <span className="ctab-d" aria-hidden="true">
                  <span className="ctab-d-tag">{c.number} / {String(featured.length).padStart(2, "0")}</span>
                  <span className="ctab-d-title">{c.name}</span>
                  <span className="ctab-d-go">Shop {c.name.toLowerCase()} <UpRight /></span>
                </span>
                <span className="ctab-v" aria-hidden="true">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
