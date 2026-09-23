"use client";

/* 3D coverflow — vendored 2026-09-23 at the client's request for the home
 * page's New Arrivals, replacing the drifting rail (NewInRail).
 *
 * The motion is the component's own: a centre card and two either side,
 * turned away in perspective, sliding round on a slow ease, with the centre
 * photograph softly blown up behind the stage. What was changed on the way
 * in, and why:
 *
 *   - NO DEMO DISHES. Its five restaurant plates are gone; the cards are the
 *     shop's real New In pieces (`newIn` in lib/shop.ts): name, category,
 *     the price the checkout charges, and the product page as the link.
 *   - Light, not black. The home page already has dark bands either side of
 *     this; the stage sits on the site's paper, and the ambient photograph
 *     is a faint wash rather than a dark room.
 *   - Sized for phones. The demo's cards were a fixed 330x500 with the side
 *     cards 285px/510px out, which runs off a 390px screen. Card width is a
 *     clamp of the viewport and every offset is a multiple of it; the card
 *     is 4:5, the photographs' own ratio, so nobody's head is cropped.
 *   - Keyboard arrows only while the carousel has focus. The demo listened
 *     on window, so ArrowLeft/Right anywhere on the page spun it.
 *   - It auto-advances, so it has a real Pause button (WCAG 2.2.2), stops on
 *     hover and focus, and never auto-advances under reduced motion.
 *   - Every card is a real link to its piece. A pointer click on a SIDE card
 *     brings it to the centre instead of navigating; the centre card opens.
 *   - The site's type, colours, square photographs and ProductPhoto
 *     (AVIF/WebP/JPEG at measured sizes) instead of inline styles, system
 *     fonts, gold and remote images. */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { formatPriceShort } from "@/lib/catalogue";
import { newIn } from "@/lib/shop";
import { ProductPhoto } from "@/components/ProductPhoto";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const Chevron = ({ dir }: { dir: "l" | "r" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d={dir === "l" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Where each card sits, by its distance from the centre. Offsets are in
   units of the card width (--cw), so the layout holds at any screen size. */
function place(offset: number, total: number) {
  const d = offset > total / 2 ? offset - total : offset; // -2..2 around the centre
  switch (d) {
    case 0:
      return { t: "translateX(0) scale(1) rotateY(0deg)", o: 1, z: 30, f: "none" };
    case 1:
      return { t: "translateX(calc(var(--cw) * 0.86)) scale(0.84) rotateY(-24deg)", o: 0.8, z: 20, f: "brightness(0.92)" };
    case -1:
      return { t: "translateX(calc(var(--cw) * -0.86)) scale(0.84) rotateY(24deg)", o: 0.8, z: 20, f: "brightness(0.92)" };
    case 2:
      return { t: "translateX(calc(var(--cw) * 1.55)) scale(0.68) rotateY(-38deg)", o: 0.45, z: 10, f: "brightness(0.85)" };
    case -2:
      return { t: "translateX(calc(var(--cw) * -1.55)) scale(0.68) rotateY(38deg)", o: 0.45, z: 10, f: "brightness(0.85)" };
    default:
      return { t: "translateX(0) scale(0.4)", o: 0, z: 0, f: "none" };
  }
}

export function CoverFlowCarousel() {
  const items = newIn;
  const total = items.length;
  const reduced = usePrefersReducedMotion();
  const [current, setCurrent] = useState(0);
  const [held, setHeld] = useState(false);
  const [paused, setPaused] = useState(false);
  /* Drag and swipe (2026-09-23, client: "you should be able to just swipe
     this on both mobile and desktop"). Pointer events cover a finger and a
     mouse alike; a horizontal trackpad swipe arrives as wheel deltaX. A drag
     past 45px turns one card; `dragged` then swallows the click that ends
     the drag, so letting go over a card does not also open it. */
  const drag = useRef<{ x: number; y: number; id: number } | null>(null);
  const dragged = useRef(false);
  const wheelLock = useRef(0);

  const next = useCallback(() => setCurrent((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    if (reduced || paused || held || total <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [reduced, paused, held, next, total]);

  if (total === 0) return null;
  const now = items[current];

  return (
    <section
      id="new-in"
      aria-labelledby="cf-heading"
      aria-roledescription="carousel"
      className="cf"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
        if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      }}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
        dragged.current = false;
        setHeld(true);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId || dragged.current) return;
        const dx = e.clientX - d.x;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(e.clientY - d.y)) {
          dragged.current = true;
          (dx < 0 ? next : prev)();
        }
      }}
      onPointerUp={() => { drag.current = null; setHeld(false); }}
      onPointerCancel={() => { drag.current = null; setHeld(false); }}
      onWheel={(e) => {
        if (Math.abs(e.deltaX) < 30 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
        const now = Date.now();
        if (now - wheelLock.current < 600) return;
        wheelLock.current = now;
        (e.deltaX > 0 ? next : prev)();
      }}
    >
      {/* The centre piece, blown up and faint, behind the stage. */}
      <div className="cf-ambient" aria-hidden="true">
        <ProductPhoto key={now.slug} photo={now.photo} sizes="40vw" className="cf-ambient-img" />
      </div>

      <div className="cf-head">
        <p className="cf-eyebrow">New arrivals</p>
        <h2 id="cf-heading" className="cf-h2">
          Just <em>in</em>
        </h2>
      </div>

      <div className="cf-stage">
        {items.map((piece, i) => {
          const offset = (i - current + total) % total;
          const p = place(offset, total);
          const centre = offset === 0;
          return (
            <Link
              key={piece.slug}
              href={`/shop/${piece.slug}`}
              className={`cf-card${centre ? " is-centre" : ""}`}
              style={{ transform: p.t, opacity: p.o, zIndex: p.z, filter: p.f }}
              tabIndex={centre ? 0 : -1}
              aria-hidden={centre ? undefined : true}
              draggable={false}
              onClick={(e) => {
                if (dragged.current) {
                  e.preventDefault();
                  dragged.current = false;
                  return;
                }
                /* A real pointer click on a side card turns the carousel to
                   it; the centre card opens the piece. (A programmatic click
                   has detail 0 and still navigates.) */
                if (!centre && e.detail > 0) {
                  e.preventDefault();
                  setCurrent(i);
                }
              }}
            >
              <span className="cf-photo">
                <ProductPhoto
                  photo={piece.photo}
                  square={piece.category === "Homeware"}
                  alt=""
                  sizes="(min-width: 768px) 330px, 62vw"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </span>
              <span className="cf-body">
                <span className="cf-cat">{piece.category}</span>
                <span className="cf-name">{piece.name}</span>
                <span className="cf-price">{piece.priced ? formatPriceShort(piece.priceP) : "Price to confirm"}</span>
                <span className="cf-cta">
                  View piece
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      <div className="cf-controls">
        <button type="button" className="cf-btn" onClick={prev} aria-label="Previous piece">
          <Chevron dir="l" />
        </button>
        <p className="cf-count" aria-live="polite">
          <span>{String(current + 1).padStart(2, "0")}</span> / {String(total).padStart(2, "0")}
          <span className="sr-only">: {now.name}</span>
        </p>
        <button type="button" className="cf-btn" onClick={next} aria-label="Next piece">
          <Chevron dir="r" />
        </button>
        {reduced ? null : (
          <button
            type="button"
            className="cf-pause"
            onClick={() => setPaused((v) => !v)}
            aria-pressed={paused}
          >
            {paused ? "Play" : "Pause"}
          </button>
        )}
      </div>

      <p className="cf-foot">
        New stock comes in regularly, and everything here is a single piece.{" "}
        <Link href="/shop" className="cf-all">
          Shop everything <span aria-hidden="true">&rarr;</span>
        </Link>
      </p>
    </section>
  );
}

export default CoverFlowCarousel;
