"use client";

import { useEffect, useState } from "react";

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
 *    RENDERED until after mount: the server HTML and the first paint
 *    contain exactly one <picture>, and the rest appear a tick later.
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

function SlidePicture({ file, first }: { file: string; first: boolean }) {
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
        fetchPriority={first ? "high" : "low"}
        loading={first ? undefined : "lazy"}
        decoding="async"
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

  /* Mount the remaining slides one animation frame AFTER paint, and only
     when motion is wanted.
     The frame matters twice over. It keeps the extra <picture> elements out
     of the first paint, so the LCP candidate has the network to itself; and
     because `reduced` starts false and corrects on mount, waiting a frame
     means a reduced-motion visitor never reaches the branch that renders
     the other four at all — they are not fetched, not merely not animated. */
  useEffect(() => {
    if (reduced) return;
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  useEffect(() => {
    if (reduced || !mounted) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), HOLD_MS);
    return () => clearInterval(t);
  }, [reduced, mounted]);

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
          <SlidePicture file={s.file} first={i === 0} />
        </div>
      ))}
    </div>
  );
}
