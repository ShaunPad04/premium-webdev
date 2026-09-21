"use client";

import { useCallback, useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/* The hero slideshow.
 *
 * Five campaign photographs, cross-fading. It replaces `HeroPicture`, which
 * did the same job for a single frame; the <picture> pattern it established
 * is kept intact per slide, because it is what makes the browser choose one
 * file before any request goes out.
 *
 * ── The three things this component is actually about ─────────────────────
 *
 * 1. ONE image on first load, not five.
 *    All five slides sit inside the viewport, so `loading="lazy"` does
 *    nothing for them — a lazy image that is already on screen is fetched
 *    immediately. Five heroes at once is roughly 750 KB on the critical
 *    path for four pictures nobody has seen yet. So slides 2-5 are not
 *    RENDERED until the page has loaded AND the browser has gone idle: the
 *    server HTML and the first paint contain exactly one <picture>. It said
 *    "a tick later" and did exactly that, which was not nearly late enough —
 *    see the dated note on the mounting effect below.
 *
 * 2. The first slide is the LCP candidate and is treated as one.
 *    `fetchPriority="high"`, no lazy attribute, and it is the only slide in
 *    the initial markup. The others carry `loading="lazy"` and
 *    `fetchPriority="low"` so they cannot compete with it once they mount.
 *
 * 3. Reduced motion stops the slideshow, not just the fade.
 *    A cross-fade every six seconds is motion whether or not it is smooth.
 *    With `prefers-reduced-motion` the timer never starts and the component
 *    renders the first photograph alone — which also means the other four
 *    are never fetched at all. That is the honest reading of the setting:
 *    the user asked for less movement, not for a faster carousel.
 *
 * ── Accessibility ─────────────────────────────────────────────────────────
 * The photographs are campaign imagery sitting behind the page's h1. A
 * screen reader announcing five alt texts in a row would be noise, and
 * describing each garment edges toward claiming it is stock. So the region
 * carries ONE label and each <img> is alt="" — decorative, as they are. The
 * h1 above still names the business, the category and the street. */

type Slide = {
  /** Basename in /img/hero; the -d and -m variants are built by build-hero.mjs. */
  file: string;
};

/* Order matters. `1-paris` is first because it is the frame the client
   approved as the hero before the slideshow existed, and because it is the
   one whose mobile file came from a true 9:16 outpaint rather than a window
   cut out of the 16:9 — so it is the sharpest of the five on a phone, which
   is where the LCP is measured. */
const SLIDES: readonly Slide[] = [
  { file: "1-paris" },
  { file: "2-street" },
  { file: "3-terrace" },
  { file: "4-flowers" },
  { file: "5-sea" },
];

/** Long enough to look at, short enough to see a second frame before the
 *  fold is scrolled past. Paired with the fade duration in globals.css. */
const HOLD_MS = 6000;

function SlidePicture({
  file,
  first,
  onReady,
}: {
  file: string;
  first: boolean;
  onReady: () => void;
}) {
  return (
    <picture>
      <source media="(min-width: 1024px)" type="image/avif" srcSet={`/img/hero/${file}-d.avif`} />
      <source media="(min-width: 1024px)" type="image/webp" srcSet={`/img/hero/${file}-d.webp`} />
      <source media="(min-width: 1024px)" type="image/jpeg" srcSet={`/img/hero/${file}-d.jpg`} />
      <source type="image/avif" srcSet={`/img/hero/${file}-m.avif`} />
      <source type="image/webp" srcSet={`/img/hero/${file}-m.webp`} />
      {/* A bare <img> inside <picture> is the whole point here; next/image
          cannot express media-scoped art direction, and the rule that would
          object allows this shape. */}
      <img
        src={`/img/hero/${file}-m.jpg`}
        alt=""
        /* "high" stays, and it was TESTED rather than assumed.
           The LCP element is the h1, not this photograph, so the textbook
           reading is that high priority here promotes 274 KB ahead of the
           48 KB Bodoni woff2 the LCP text is waiting for. That was tried:
           `auto` measured a median LCP of 4.97s over five runs against
           4.68s with `high`, a 0.29s REGRESSION, with a 0.09s spread that
           is far too tight to be noise. The theory was wrong and the number
           is what counts.
           The likeliest reason is that the hero's own paint is a gate on
           the h1 becoming the largest contentful element at all — it is
           drawn over this image — so starving the image delays the text
           that sits on it. Recorded so nobody re-runs the experiment. */
        fetchPriority={first ? "high" : "low"}
        loading={first ? undefined : "lazy"}
        decoding="async"
        /* `complete` is checked as well as onLoad, because an image served
           from cache can finish before React attaches the handler and the
           event would never fire. */
        ref={(el) => { if (el?.complete) onReady(); }}
        onLoad={onReady}
        style={{ color: "transparent" }}
        className="h-full w-full object-cover"
      />
    </picture>
  );
}

export function HeroSlideshow() {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  /* False on the server and on first paint, so the initial HTML carries one
     photograph. Flipped in an effect, which never runs before paint. */
  const [mounted, setMounted] = useState(false);

  /* Mount the remaining slides well after paint, and only when motion is
     wanted. Because `reduced` starts false and corrects on mount, a
     reduced-motion visitor never reaches the branch that renders the other
     four at all — they are not fetched, not merely not animated. */
  /* ── 2026-09-21: one animation frame was nowhere near late enough ────────
   *
   * This used to be a single requestAnimationFrame. The intent was right —
   * keep slides 2-5 out of the first paint — but a rAF fires on the very
   * next frame, so all four still started downloading inside the critical
   * window. Measured on a throttled mobile profile: 1319 KB fetched for
   * photographs nobody had seen yet, finishing between 5.7s and 7.2s.
   *
   * That matters more than it looks, because of what the LCP element
   * actually is. It is NOT the photograph. Read out of the browser's own
   * PerformanceObserver rather than assumed, the LCP element is
   * `h1.hero-line` — the headline text — which needs the Bodoni woff2. The
   * font is correctly preloaded, and was then queued behind 1.3 MB of images
   * competing for the same connection. So the slideshow was not slowing the
   * page down by being large; it was slowing the page down by being EARLY.
   *
   * Now they wait for the window `load` event and then for the browser to go
   * idle, which puts them after the font, the first slide and the rest of
   * the critical path. The 2000ms timeout is the ceiling, and it is chosen
   * against HOLD_MS: the first transition is at 6000ms, so even in the worst
   * case the second slide has four seconds to arrive before it is needed.
   *
   * requestIdleCallback is absent in Safari, hence the setTimeout fallback.
   * Nothing here changes a single byte of image quality, which is the point
   * — the client asked for these photographs to be sharper, and the fix for
   * the LCP was never to undo that. */
  useEffect(() => {
    if (reduced) return;

    let idle: number | undefined;
    let cancelled = false;

    const schedule = () => {
      if (cancelled) return;
      const ric = (
        window as Window & {
          requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
        }
      ).requestIdleCallback;
      if (ric) idle = ric(() => !cancelled && setMounted(true), { timeout: 2000 });
      else idle = window.setTimeout(() => !cancelled && setMounted(true), 1200);
    };

    /* `load` has usually already fired by the time this runs on a warm
       cache, in which case schedule immediately rather than waiting for an
       event that is never coming again. */
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (idle !== undefined) {
        const cic = (window as Window & { cancelIdleCallback?: (h: number) => void })
          .cancelIdleCallback;
        (cic ?? window.clearTimeout)(idle);
      }
    };
  }, [reduced]);

  /* Advance only to a slide whose photograph has actually arrived.
   *
   * Deferring slides 2-5 to idle bought the LCP back, and it moved the
   * download later: measured on Slow 4G with 4x CPU, slide 2 now finishes at
   * ~11.1s while the first crossfade is due at 6s. Fading to a frame that
   * has not loaded shows an empty box on the most prominent element of the
   * site, which is a worse defect than the one being fixed.
   *
   * So the timer proposes and readiness disposes: each tick looks for the
   * next slide that has loaded and goes there, and if none has yet it simply
   * stays where it is and tries again on the following tick. On a fast
   * connection every slide is ready long before its turn and this is
   * invisible; on a slow one the hero holds a real photograph instead of
   * flashing a gap. Nothing is skipped permanently — a slide that arrives
   * late is picked up on the next pass. */
  const [ready, setReady] = useState<boolean[]>(() => SLIDES.map((_, i) => i === 0));

  const markReady = useCallback((i: number) => {
    setReady((r) => (r[i] ? r : r.map((v, n) => (n === i ? true : v))));
  }, []);

  useEffect(() => {
    if (reduced || !mounted) return;
    const t = setInterval(() => {
      setIndex((i) => {
        for (let step = 1; step <= SLIDES.length; step++) {
          const next = (i + step) % SLIDES.length;
          if (next === i) break;
          if (ready[next]) return next;
        }
        return i; /* nothing else has loaded yet — hold this frame */
      });
    }, HOLD_MS);
    return () => clearInterval(t);
  }, [reduced, mounted, ready]);

  /* Reduced motion: the first frame, and nothing else mounted or fetched. */
  const visible = reduced || !mounted ? SLIDES.slice(0, 1) : SLIDES;

  return (
    <div
      className="hero-slides"
      role="img"
      aria-label="Women photographed in everyday clothes on city streets"
    >
      {visible.map((s, i) => (
        <div
          key={s.file}
          className="hero-slide"
          /* aria-hidden on every slide: the wrapper above is the one thing
             announced. Without this a screen reader finds five nested
             regions where the design has one picture. */
          aria-hidden="true"
          data-active={i === index ? "" : undefined}
        >
          <SlidePicture file={s.file} first={i === 0} onReady={() => markReady(i)} />
        </div>
      ))}
    </div>
  );
}
