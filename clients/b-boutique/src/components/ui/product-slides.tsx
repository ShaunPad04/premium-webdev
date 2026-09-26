"use client";

/* ProductSlides: a horizontal product showcase with one expanded slide.
 *
 * Reusable across client sites: it knows nothing about B Boutique. Pass it
 * `slides` (image nodes, so each site keeps its own image pipeline) and it
 * does the rest.
 *
 *   - The active slide is EXPANDED: its photograph plus a details panel
 *     (caption, title, description, price, optional second image, link).
 *     Beside the photograph from 1024px up; under it below that.
 *   - The others are COLLAPSED to their photograph, scaled down and fading
 *     with distance. The panel is clipped away, not unmounted, so opening
 *     and closing is one clip-path animation, never a layout change.
 *   - Arrows, pagination, drag/swipe (mouse and touch, with the track
 *     following the finger), a horizontal trackpad swipe, and the arrow keys
 *     while focus is inside it. A click on a collapsed slide brings it in.
 *   - `loop` renders a window of virtual positions around the active one, so
 *     it turns forever in either direction; without it the ends stop.
 *   - Only transform, opacity and clip-path animate. Reduced motion: every
 *     change is instant.
 *
 * Built 2026-09-26 for Brad from a written spec of the Framer "Product
 * Slides" component (the reference site is blocked from the build
 * environment, so it was not copied from). */

import Link from "next/link";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import "./product-slides.css";

export type ProductSlide = {
  id: string;
  title: string;
  /** Small line above the title (a category, a collection). */
  caption?: string;
  description?: string;
  /** Already formatted; a node so a site can use its own price component. */
  price?: ReactNode;
  href?: string;
  /** Decorative: the title names the slide. Fill the frame (absolute, cover). */
  image: ReactNode;
  secondaryImage?: ReactNode;
  /** Names for the two images' switches, e.g. the colourways. */
  imageLabel?: string;
  secondaryLabel?: string;
};

type Props = {
  slides: ProductSlide[];
  /** Accessible name for the carousel. */
  label: string;
  loop?: boolean;
  initial?: number;
  ctaLabel?: string;
  className?: string;
};

type Geo = { w: number; stacked: boolean; I: number; H: number; D: number; P: number; G: number; s: number };

const EASE: Transition = { duration: 0.75, ease: [0.16, 1, 0.3, 1] };
const mod = (a: number, n: number) => ((a % n) + n) % n;

/* Sizes from the stage's own width, so it fits wherever it is dropped. */
function geometry(w: number): Geo {
  if (w >= 1024) {
    const I = Math.round(Math.min(360, Math.max(250, w * 0.23)));
    return { w, stacked: false, I, H: Math.round(I * 1.25), D: Math.round(Math.min(330, Math.max(250, w * 0.21))), P: 0, G: 32, s: 0.74 };
  }
  /* Stacked: the photographs are a figure centred on white, so the
     neighbours tuck in behind the active frame (a negative gap) until their
     figures sit just inside the screen's edges. */
  const I = Math.round(Math.min(340, w * 0.58));
  return { w, stacked: true, I, H: Math.round(I * 1.25), D: 0, P: 258, G: -Math.round(w * 0.1), s: 0.78 };
}

export function ProductSlides({ slides, label, loop = true, initial = 0, ctaLabel = "View the piece", className = "" }: Props) {
  const n = slides.length;
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [active, setActive] = useState(initial); // a virtual index when looping
  const [alt, setAlt] = useState(false);
  const dragX = useMotionValue(0);
  const drag = useRef<{ x: number; y: number; id: number; on: boolean } | null>(null);
  const dragged = useRef(false);
  const wheelLock = useRef(0);

  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const set = () => setGeo(geometry(el.clientWidth));
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const go = useCallback(
    (v: number) => {
      setActive(loop ? v : Math.max(0, Math.min(n - 1, v)));
      setAlt(false);
    },
    [loop, n],
  );
  useEffect(() => { if (reduce) dragX.set(0); }, [reduce, dragX]);

  if (n === 0) return null;
  const real = mod(active, n);
  const t: Transition = reduce ? { duration: 0 } : EASE;

  /* Which positions exist: three either side, fewer when there are too few
     pieces to fill them without one appearing twice. */
  const reach = loop ? Math.min(3, Math.floor((n - 1) / 2)) : 3;
  const positions: number[] = [];
  for (let v = active - reach; v <= active + reach; v++) if (loop || (v >= 0 && v < n)) positions.push(v);

  const g = geo;
  const E = g ? (g.stacked ? g.I : g.I + g.D) : 0;
  const step = g ? g.I * g.s + g.G : 1;
  const place = (d: number) => {
    if (!g) return { x: 0, scale: 1, opacity: 0 };
    if (d === 0) return { x: -Math.round(E / 2), scale: 1, opacity: 1 };
    const a = Math.abs(d);
    const x = d > 0 ? E / 2 + g.G + (a - 1) * step : -E / 2 - g.G - (a - 1) * step - g.I * g.s;
    return { x: Math.round(x), scale: g.s, opacity: a === 1 ? 1 : a === 2 ? 0.42 : 0 };
  };
  const clip = (open: boolean) =>
    !g || open
      ? "inset(0px 0px 0px 0px)"
      : g.stacked
        ? `inset(0px 0px ${g.P}px 0px)`
        : `inset(0px ${g.D}px 0px 0px)`;

  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId || !d.on) return;
    const dx = dragX.get();
    let k = Math.round(-dx / step);
    if (k === 0 && Math.abs(dx) > 40) k = dx < 0 ? 1 : -1;
    if (!loop) k = Math.max(-active, Math.min(n - 1 - active, k));
    if (k) go(active + k);
    animate(dragX, 0, t);
  };

  const canPrev = loop || active > 0;
  const canNext = loop || active < n - 1;
  const slide = slides[real];

  return (
    <div
      className={`ps ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" && canPrev) { e.preventDefault(); go(active - 1); }
        if (e.key === "ArrowRight" && canNext) { e.preventDefault(); go(active + 1); }
      }}
    >
      <div
        ref={stage}
        className="ps-stage"
        style={g ? { height: g.H + g.P } : undefined}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          if ((e.target as Element).closest(".ps-swatches, .ps-cta")) return;
          drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId, on: false };
          dragged.current = false;
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || d.id !== e.pointerId) return;
          const dx = e.clientX - d.x;
          if (!d.on) {
            if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - d.y)) return;
            d.on = true;
            dragged.current = true;
            (e.currentTarget as Element).setPointerCapture(e.pointerId);
          }
          /* Resistance past a finite end. */
          const edge = !loop && ((dx > 0 && active === 0) || (dx < 0 && active === n - 1));
          dragX.set(edge ? dx * 0.3 : dx);
        }}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onWheel={(e) => {
          if (Math.abs(e.deltaX) < 30 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
          const now = Date.now();
          if (now - wheelLock.current < 650) return;
          wheelLock.current = now;
          if (e.deltaX > 0 ? canNext : canPrev) go(active + (e.deltaX > 0 ? 1 : -1));
        }}
      >
        <motion.div className="ps-track" style={{ x: dragX }}>
          {g &&
            positions.map((v) => {
              const d = v - active;
              const s = slides[mod(v, n)];
              const open = d === 0;
              const p = place(d);
              const showAlt = open && alt && !!s.secondaryImage;
              return (
                <motion.div
                  key={loop ? v : s.id}
                  className={`ps-slide${open ? " is-open" : ""}${g.stacked ? " is-stacked" : ""}`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${mod(v, n) + 1} of ${n}: ${s.title}`}
                  aria-hidden={open ? undefined : true}
                  style={{
                    width: E,
                    height: g.H + g.P,
                    transformOrigin: `0px ${g.H / 2}px`,
                    zIndex: 10 - Math.abs(d),
                    ["--ps-i" as string]: `${g.I}px`,
                    ["--ps-h" as string]: `${g.H}px`,
                  }}
                  initial={{ ...place(d > 0 ? d + 1 : d - 1), opacity: 0, clipPath: clip(false) }}
                  animate={{ ...p, clipPath: clip(open) }}
                  transition={t}
                  onClick={(e) => {
                    if (dragged.current) {
                      e.preventDefault();
                      dragged.current = false;
                      return;
                    }
                    /* A pointer click on a collapsed slide brings it in; a
                       programmatic click (detail 0) still follows its link. */
                    if (!open && e.detail > 0) {
                      e.preventDefault();
                      go(v);
                    }
                  }}
                >
                  <MediaFrame s={s} open={open} showAlt={showAlt} />
                  <div className="ps-panel" aria-hidden={open ? undefined : true}>
                    {s.caption && <p className="ps-caption">{s.caption}</p>}
                    <h3 className="ps-title">{s.title}</h3>
                    {s.description && <p className="ps-desc">{s.description}</p>}
                    {s.price && <p className="ps-price">{s.price}</p>}
                    {s.secondaryImage && (
                      <div className="ps-swatches" role="group" aria-label="Photograph">
                        {[s.imageLabel ?? "Main", s.secondaryLabel ?? "Alternate"].map((name, i) => (
                          <button
                            key={name}
                            type="button"
                            className="ps-swatch"
                            aria-pressed={open ? (i === 1) === alt : undefined}
                            tabIndex={open ? 0 : -1}
                            onClick={() => setAlt(i === 1)}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    )}
                    {s.href && (
                      <Link href={s.href} className="ps-cta" tabIndex={open ? 0 : -1} draggable={false}>
                        {ctaLabel}
                        <span className="ps-cta-arrow" aria-hidden="true">→</span>
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
        </motion.div>
      </div>

      <div className="ps-nav">
        <button type="button" className="ps-arrow" aria-label="Previous piece" disabled={!canPrev} onClick={() => go(active - 1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div className="ps-dots" role="group" aria-label="Choose a piece">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className="ps-dot"
              aria-label={`${i + 1}: ${s.title}`}
              aria-current={i === real ? "true" : undefined}
              onClick={() => {
                /* Shortest way round when looping. */
                let d = i - real;
                if (loop && Math.abs(d) > n / 2) d -= Math.sign(d) * n;
                go(active + d);
              }}
            >
              <span />
            </button>
          ))}
        </div>
        <button type="button" className="ps-arrow" aria-label="Next piece" disabled={!canNext} onClick={() => go(active + 1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <p className="sr-only" aria-live="polite">{`${real + 1} of ${n}: ${slide.title}`}</p>
    </div>
  );
}

function MediaFrame({ s, open, showAlt }: { s: ProductSlide; open: boolean; showAlt: boolean }) {
  const inner = (
    <>
      <span className={`ps-img${showAlt ? " is-hidden" : ""}`}>{s.image}</span>
      {s.secondaryImage && <span className={`ps-img ps-img--alt${showAlt ? "" : " is-hidden"}`}>{s.secondaryImage}</span>}
    </>
  );
  return s.href ? (
    <Link href={s.href} className="ps-media" tabIndex={open ? 0 : -1} aria-label={s.title} draggable={false}>
      {inner}
    </Link>
  ) : (
    <div className="ps-media">{inner}</div>
  );
}

export default ProductSlides;
