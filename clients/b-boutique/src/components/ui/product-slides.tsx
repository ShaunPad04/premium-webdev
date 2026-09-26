"use client";

/* ProductSlides: a product showcase after the Framer "Product Slideshow".
 *
 * Reusable across client sites: it knows nothing about B Boutique. Pass it
 * `slides` (image nodes, so each site keeps its own image pipeline).
 *
 *   - A row of frameless models on white. The active one is full size in the
 *     middle; one either side, smaller and faded. Clicking a side model brings
 *     it in. No arrows, no dots: that is the reference's own interaction.
 *   - One details column, outside the row: caption, title, description,
 *     price, sizes (information only, never a picker), colour switches with
 *     thumbnails, and a link. It crossfades when the piece changes. Beside
 *     the row from 1024px up, under it below that.
 *   - Colourway thumbnails bottom-right of the row, as in the reference; a
 *     pointer shortcut to the same colour switches, hidden from assistive
 *     tech since the switches in the column are the real control.
 *   - Drag and swipe with the row following the finger, a horizontal
 *     trackpad swipe, and the arrow keys while focus is inside. The side
 *     models are buttons, so a keyboard gets through without arrows on screen.
 *   - `loop` renders a window of virtual positions around the active one, so
 *     it turns forever; without it the ends stop.
 *   - Only transform and opacity animate. Reduced motion: every change is
 *     instant.
 *
 * Built 2026-09-26 for Brad from screenshots of the reference (the Framer
 * pages themselves are blocked from the build environment). */

import Link from "next/link";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type Transition } from "motion/react";
import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import "./product-slides.css";

export type ProductVariant = {
  /** The colour's name, as the supplier gives it. */
  label: string;
  /** Fills the model frame (absolute, cover). Decorative. */
  image: ReactNode;
  /** A small version for the switches; falls back to a plain chip. */
  thumb?: ReactNode;
};

export type ProductSlide = {
  id: string;
  title: string;
  /** Small line above the title (a category, a collection). */
  caption?: string;
  description?: string;
  /** Already formatted; a node so a site can use its own price component. */
  price?: ReactNode;
  /** Shown as information, never as a size picker. */
  sizes?: string[];
  href?: string;
  /** The model photograph. Decorative: the title names the slide. */
  image: ReactNode;
  /** Colourways; the first should be the one `image` shows. */
  variants?: ProductVariant[];
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

type Geo = { I: number; H: number; spread: number; s: number };

const EASE: Transition = { duration: 0.8, ease: [0.16, 1, 0.3, 1] };
const mod = (a: number, n: number) => ((a % n) + n) % n;

/* Sizes from the stage's width and the screen's height, so the model fits
   the screen it is seen on. Photographs are 4:5. */
function geometry(w: number, vh: number, wide: boolean): Geo {
  if (wide) {
    const H = Math.round(Math.max(380, Math.min(560, vh * 0.62)));
    return { H, I: Math.round(H * 0.8), spread: Math.round(w * 0.34), s: 0.7 };
  }
  const I = Math.round(Math.min(300, w * 0.6));
  return { I, H: Math.round(I * 1.25), spread: Math.round(w * 0.42), s: 0.66 };
}

export function ProductSlides({ slides, label, loop = true, initial = 0, ctaLabel = "View the piece", className = "" }: Props) {
  const n = slides.length;
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [active, setActive] = useState(initial); // virtual index when looping
  const [variant, setVariant] = useState(0);
  const dragX = useMotionValue(0);
  const drag = useRef<{ x: number; y: number; id: number; on: boolean } | null>(null);
  const dragged = useRef(false);
  const wheelLock = useRef(0);

  useLayoutEffect(() => {
    const el = stage.current;
    const r = root.current;
    if (!el || !r) return;
    const set = () => setGeo(geometry(el.clientWidth, window.innerHeight, r.clientWidth >= 1024));
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const go = useCallback(
    (v: number) => {
      setActive(loop ? v : Math.max(0, Math.min(n - 1, v)));
      setVariant(0);
    },
    [loop, n],
  );

  if (n === 0) return null;
  const real = mod(active, n);
  const slide = slides[real];
  const t: Transition = reduce ? { duration: 0 } : EASE;
  const fade: Transition = reduce ? { duration: 0 } : { duration: 0.35, ease: [0.16, 1, 0.3, 1] };
  const canPrev = loop || active > 0;
  const canNext = loop || active < n - 1;

  /* Two positions either side: one showing, one waiting just off it so a
     turn slides in rather than popping. Fewer if there are too few pieces
     to fill them without one appearing twice. */
  const reach = loop ? Math.min(2, Math.floor((n - 1) / 2)) : 2;
  const positions: number[] = [];
  for (let v = active - reach; v <= active + reach; v++) if (loop || (v >= 0 && v < n)) positions.push(v);

  const g = geo;
  const place = (d: number) => {
    if (!g) return { x: 0, scale: 1, opacity: 0 };
    const a = Math.abs(d);
    return {
      x: Math.round(d * g.spread - g.I / 2),
      scale: a === 0 ? 1 : g.s,
      opacity: a === 0 ? 1 : a === 1 ? 0.35 : 0,
    };
  };

  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId || !d.on || !g) return;
    const dx = dragX.get();
    let k = Math.round(-dx / g.spread);
    if (k === 0 && Math.abs(dx) > 40) k = dx < 0 ? 1 : -1;
    if (!loop) k = Math.max(-active, Math.min(n - 1 - active, k));
    if (k) go(active + k);
    animate(dragX, 0, t);
  };
  /* A drag ends in a click on whatever is under the pointer; swallow it. */
  const swallow = (e: React.MouseEvent) => {
    if (!dragged.current) return false;
    e.preventDefault();
    dragged.current = false;
    return true;
  };

  const variants = slide.variants ?? [];

  return (
    <div
      ref={root}
      className={`ps ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" && canPrev) { e.preventDefault(); go(active - 1); }
        if (e.key === "ArrowRight" && canNext) { e.preventDefault(); go(active + 1); }
      }}
    >
      <p className="ps-hint" aria-hidden="true">
        <span className="ps-hint-click">Click on the pieces</span>
        <span className="ps-hint-tap">Tap the pieces</span>
      </p>

      <div className="ps-grid">
        <div
          ref={stage}
          className="ps-stage"
          style={g ? { height: g.H } : undefined}
          onPointerDown={(e) => {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            if ((e.target as Element).closest(".ps-thumbs")) return;
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
                const box = {
                  style: { width: g.I, height: g.H, zIndex: 10 - Math.abs(d) },
                  initial: { ...place(d > 0 ? d + 1 : d - 1), opacity: 0 },
                  animate: place(d),
                  transition: t,
                };
                const key = loop ? v : s.id;
                if (d === 0) {
                  const vs = s.variants ?? [];
                  const frames = vs.length ? vs.map((x) => x.image) : [s.image];
                  const inner = frames.map((img, i) => (
                    <span key={i} className={`ps-img${i === (vs.length ? variant : 0) ? "" : " is-hidden"}`}>{img}</span>
                  ));
                  return (
                    <motion.div key={key} className="ps-slide is-active" {...box}>
                      {s.href ? (
                        <Link
                          href={s.href}
                          className="ps-model"
                          aria-label={s.title}
                          draggable={false}
                          onClick={(e) => { swallow(e); }}
                        >
                          {inner}
                        </Link>
                      ) : (
                        <span className="ps-model">{inner}</span>
                      )}
                    </motion.div>
                  );
                }
                return (
                  <motion.div key={key} className="ps-slide" {...box} aria-hidden={Math.abs(d) > 1 ? true : undefined}>
                    <button
                      type="button"
                      className="ps-model"
                      aria-label={`Show ${s.title}`}
                      tabIndex={Math.abs(d) === 1 ? 0 : -1}
                      onClick={(e) => { if (!swallow(e)) go(v); }}
                    >
                      <span className="ps-img">{s.image}</span>
                    </button>
                  </motion.div>
                );
              })}
          </motion.div>

          {variants.length > 1 && (
            <div className="ps-thumbs" aria-hidden="true">
              {variants.map((x, i) => (
                <button
                  key={x.label}
                  type="button"
                  tabIndex={-1}
                  className={`ps-thumb${i === variant ? " is-on" : ""}`}
                  onClick={() => setVariant(i)}
                >
                  {x.thumb ?? x.image}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ps-details">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={fade}
            >
              {slide.caption && <p className="ps-caption">{slide.caption}</p>}
              <h3 className="ps-title">{slide.title}</h3>
              {slide.description && <p className="ps-desc">{slide.description}</p>}
              {slide.price && <p className="ps-price">{slide.price}</p>}
              {slide.sizes && slide.sizes.length > 0 && (
                <ul className="ps-sizes" aria-label="Sizes">
                  {slide.sizes.map((z) => <li key={z}>{z}</li>)}
                </ul>
              )}
              {variants.length > 1 && (
                <div className="ps-colours" role="group" aria-label="Colour">
                  {variants.map((x, i) => (
                    <button
                      key={x.label}
                      type="button"
                      className="ps-colour"
                      aria-pressed={i === variant}
                      onClick={() => setVariant(i)}
                    >
                      {x.thumb && <span className="ps-colour-thumb" aria-hidden="true">{x.thumb}</span>}
                      {x.label}
                    </button>
                  ))}
                </div>
              )}
              {slide.href && (
                <Link href={slide.href} className="ps-cta">
                  {ctaLabel}
                </Link>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{`${real + 1} of ${n}: ${slide.title}`}</p>
    </div>
  );
}

export default ProductSlides;
