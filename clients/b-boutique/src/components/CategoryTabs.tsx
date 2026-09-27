"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { featured } from "@/lib/shop";

/* Shop by category as tabs over one big photograph (2026-09-27, Brad sent
 * a reference: a row of pill tabs, one photo filling the section under
 * them, a "Shop jackets" pill on the photo, and a finger swipe on phones).
 * It replaces the four-column rail (HorizontalRails, kept for a switch
 * back) at #rails, so every "/#rails" link still lands here.
 *
 * Photographs: the same four category portraits. Phones show them as they
 * are, 3:4. Desktop shows a 16:9 version whose grey studio backdrop was
 * widened with Higgsfield outpaint; the original photo is pasted back over
 * the middle, so the model is the real frame and only backdrop is new
 * (outputs in /img/cat: -p = 3:4 phone, -w = 16:9 desktop).
 *
 * Tabs follow the WAI-ARIA tabs pattern: arrow keys, Home and End move
 * between them, one tab in the Tab order. A sideways swipe on the photo
 * moves one category and stops at either end, as the old pager did; the
 * browser keeps vertical scrolling (touch-action: pan-y). */
export function CategoryTabs() {
  const [index, setIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const list = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const active = featured[index];

  const go = (i: number, focus = false) => {
    const n = Math.max(0, Math.min(featured.length - 1, i));
    setIndex(n);
    if (focus) tabs.current[n]?.focus();
  };

  // Keep the live tab in view in the scrolling tab row on a phone.
  useEffect(() => {
    const row = list.current;
    const tab = tabs.current[index];
    if (!row || !tab || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" });
  }, [index]);

  /* Swipe on the photograph (touch and pen only). On a phone the photos
     sit side by side and follow the finger (--drag), then settle on the
     nearest; a short fast flick counts too. Past either end the drag is
     damped and springs back. Desktop crossfades and ignores all of this. */
  const live = useRef(0);
  useEffect(() => { live.current = index; }, [index]);
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    let start: { x: number; y: number; t: number } | null = null;
    let dragging = false;
    let swiped = false;
    const last = featured.length - 1;
    const set = (px: number) => el.style.setProperty("--drag", `${px}px`);
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      start = { x: e.clientX, y: e.clientY, t: e.timeStamp };
      dragging = false;
      swiped = false;
    };
    const move = (e: PointerEvent) => {
      if (!start) return;
      let dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!dragging) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
        dragging = true;
        el.dataset.dragging = "";
      }
      const i = live.current;
      if ((i === 0 && dx > 0) || (i === last && dx < 0)) dx *= 0.3;
      set(dx);
    };
    const up = (e: PointerEvent) => {
      if (!start) return;
      const dx = e.clientX - start.x;
      const fast = Math.abs(dx) / Math.max(1, e.timeStamp - start.t) > 0.35;
      start = null;
      delete el.dataset.dragging;
      set(0);
      if (!dragging) return;
      dragging = false;
      swiped = true;
      if (Math.abs(dx) > el.clientWidth * 0.18 || (fast && Math.abs(dx) > 24)) {
        setIndex((i) => Math.max(0, Math.min(last, i + (dx < 0 ? 1 : -1))));
      }
    };
    const cancel = () => { start = null; dragging = false; delete el.dataset.dragging; set(0); };
    // A swipe that ends on the Shop pill is not a tap on it.
    const click = (e: MouseEvent) => { if (swiped) { e.preventDefault(); e.stopPropagation(); swiped = false; } };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", cancel);
    el.addEventListener("click", click, true);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", cancel);
      el.removeEventListener("click", click, true);
    };
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    const k = e.key;
    if (k === "ArrowRight" || k === "ArrowDown") { e.preventDefault(); go(index + 1, true); }
    else if (k === "ArrowLeft" || k === "ArrowUp") { e.preventDefault(); go(index - 1, true); }
    else if (k === "Home") { e.preventDefault(); go(0, true); }
    else if (k === "End") { e.preventDefault(); go(featured.length - 1, true); }
  };

  return (
    <section id="rails" aria-labelledby="rails-heading" className="ctab">
      <div className="ctab-inner">
        <div className="ctab-head">
        <h2 id="rails-heading" className="ctab-h">Shop by category</h2>

        <div ref={list} role="tablist" aria-label="Categories" className="ctab-tabs" onKeyDown={onKey}>
          {featured.map((c, i) => (
            <button
              key={c.slug}
              ref={(el) => { tabs.current[i] = el; }}
              type="button"
              role="tab"
              id={`ctab-tab-${c.slug}`}
              aria-selected={i === index}
              aria-controls="ctab-panel"
              tabIndex={i === index ? 0 : -1}
              className="ctab-tab"
              onClick={() => go(i)}
            >
              {c.name}
            </button>
          ))}
        </div>
        </div>

        <div
          ref={frame}
          role="tabpanel"
          id="ctab-panel"
          aria-labelledby={`ctab-tab-${active.slug}`}
          className="ctab-frame"
        >
          {featured.map((c, i) => (
            <picture key={c.slug} className="ctab-pic" style={{ "--o": i - index } as React.CSSProperties} data-on={i === index ? "" : undefined} aria-hidden={i === index ? undefined : true}>
              <source media="(min-width: 1024px)" type="image/avif" srcSet={`/img/cat/${c.slug}-w1600.avif 1600w, /img/cat/${c.slug}-w2400.avif 2400w`} sizes="94vw" />
              <source media="(min-width: 1024px)" type="image/webp" srcSet={`/img/cat/${c.slug}-w1600.webp 1600w, /img/cat/${c.slug}-w2400.webp 2400w`} sizes="94vw" />
              <source type="image/avif" srcSet={`/img/cat/${c.slug}-p800.avif 800w, /img/cat/${c.slug}-p1200.avif 1200w`} sizes="92vw" />
              <source type="image/webp" srcSet={`/img/cat/${c.slug}-p800.webp 800w, /img/cat/${c.slug}-p1200.webp 1200w`} sizes="92vw" />
              <img src={`/img/cat/${c.slug}-p800.webp`} alt={i === index ? c.alt : ""} loading="lazy" decoding="async" className="ctab-img" draggable={false} />
            </picture>
          ))}
          <Link href={active.href} className="ctab-cta">
            Shop {active.name.toLowerCase()}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
