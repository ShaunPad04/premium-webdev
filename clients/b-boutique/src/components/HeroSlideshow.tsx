"use client";

import { useCallback, useEffect, useState } from "react";

import { hours, shop } from "@/lib/shop";
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
  /** Two lines of display type that change with the frame. See CAPTION note. */
  text: readonly [string, string];
};

/* ── The captions, and where every word of them came from ─────────────────
 *
 * The client sent a slideshow component (cosmos.so imagery, MIT) and asked
 * for the hero to work like it. Its gesture is a two-line statement that
 * changes WITH the picture, plus arrows and a counter. That gesture is what
 * is adopted here; its copy is not, because its copy is mood text
 * ("SURRENDER TO THE VOID") and this is a real shop's front door.
 *
 * So nothing below is written for effect. Each line is either the client's
 * own words or read out of `lib/shop.ts` at render:
 *
 *   1  "Something a little different" — her supplied bio, verbatim, the same
 *      sentence printed on the owner card.
 *   2  The trading categories, which are the site's own subheading.
 *   3  Homeware and gifts — her bio again ("finding that special gift").
 *   4  `shop.street` / `shop.town`. Derived, so it cannot drift from the
 *      address in the footer, the map and the JSON-LD.
 *   5  "Every day" is asserted ONLY if every row in `hours` actually has
 *      opening hours. If a day is ever closed, the line degrades to the
 *      neutral "Come in" rather than printing a promise that stopped being
 *      true. That check is the whole reason this is a function.
 *
 * No size range, no price, no "new in every week". Those would all be
 * inventions and the hero is the loudest place on the site to put one. */
const everyDay = hours.every((d) => d.hours);

/* Order matters. `1-paris` is first because it is the frame the client
   approved as the hero before the slideshow existed, and because it is the
   one whose mobile file came from a true 9:16 outpaint rather than a window
   cut out of the 16:9 — so it is the sharpest of the five on a phone, which
   is where the LCP is measured. */
const SLIDES: readonly Slide[] = [
  { file: "1-paris",   text: ["Something a little", "different"] },
  { file: "2-street",  text: ["Independent", "womenswear"] },
  { file: "3-terrace", text: ["Homeware", "and gifts"] },
  { file: "4-flowers", text: [shop.street, shop.town] },
  { file: "5-sea",     text: everyDay ? ["Open", "every day"] : ["Come", "in"] },
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

  /* Bumped on every press of an arrow. It is in the interval's dependency
     list purely so the timer is torn down and restarted: without it, a
     manual advance one second before a tick would be followed a second
     later by an automatic one, which reads as the control being ignored. */
  /* The one control left on the hero, 2026-09-22. The client asked for the
     counter and the arrows to go; they have. What cannot go is a way to STOP
     the slides: they change on their own every six seconds, indefinitely,
     and WCAG 2.2.2 requires a pause for anything that moves for longer than
     five. So the arrows became this — one bare icon, no box. */
  const [paused, setPaused] = useState(false);

  /* Step to the nearest slide in `dir` whose photograph has arrived. Shared
     by the timer and the arrows so there is one definition of "next", and so
     a press can never fade to an empty frame — the same rule the autoplay
     has followed since the deferral landed. */
  const step = useCallback(
    (i: number, dir: 1 | -1) => {
      const n = SLIDES.length;
      for (let s = 1; s <= n; s++) {
        const next = (((i + dir * s) % n) + n) % n;
        if (next === i) break;
        if (ready[next]) return next;
      }
      return i; /* nothing else has loaded yet — hold this frame */
    },
    [ready],
  );

  useEffect(() => {
    if (reduced || !mounted || paused) return;
    const t = setInterval(() => setIndex((i) => step(i, 1)), HOLD_MS);
    return () => clearInterval(t);
  }, [reduced, mounted, step, paused]);

  /* Reduced motion: the first frame, and nothing else mounted or fetched. */
  const visible = reduced || !mounted ? SLIDES.slice(0, 1) : SLIDES;

  /* A fragment, not a wrapper, and that is structural rather than tidiness.
   *
   * The photographs must stay at z-index -10 so the scrim paints over them
   * and the copy over that; the captions and the arrows must sit at z-index 1
   * so they are visible and clickable. A single positioned wrapper at -10
   * would be a stacking context its own children could never climb out of,
   * so the two layers are siblings inside `.hero` instead.
   *
   * The pictures keep the `hero-media` class because that is what carries the
   * scroll parallax (locked decision 7). The controls deliberately do NOT —
   * a photograph that drifts on scroll is art direction; an arrow button that
   * drifts away from your cursor is a bug. */
  return (
    <>
      {/* Still one announced picture rather than five: role="img" plus a
          single label here, every <img> alt="". The CAPTIONS deliberately
          live OUTSIDE it — text inside a role="img" is erased from the
          accessibility tree, and these are real words. */}
      <div
        className="hero-media hero-slides-pics absolute inset-0 -z-10"
        role="img"
        aria-label="Women photographed in everyday clothes on city streets"
      >
        {visible.map((s, i) => (
          <div
            key={s.file}
            className="hero-slide"
            aria-hidden="true"
            data-active={i === index ? "" : undefined}
          >
            <SlidePicture file={s.file} first={i === 0} onReady={() => markReady(i)} />
          </div>
        ))}
      </div>

      {/* Only the frame on screen is in the accessibility tree; the other
          four are aria-hidden, so a screen reader hears one statement rather
          than five stacked on top of each other. aria-live is NOT used: this
          is ambient decoration and interrupting a reader every six seconds
          to announce "Homeware and gifts" would be hostile. */}
      <div className="hero-captions">
        {visible.map((s, i) => (
          <p
            key={s.file}
            className="hero-caption"
            data-active={i === index ? "" : undefined}
            aria-hidden={i === index ? undefined : "true"}
          >
            <span>{s.text[0]}</span>
            <span>{s.text[1]}</span>
          </p>
        ))}
      </div>

      {/* Arrows and counter — the client's reference carries both.
       *
       * Rendered only when motion is wanted, because with
       * `prefers-reduced-motion` this component mounts ONE slide and fetches
       * no others: arrows pointing at four photographs that were never
       * downloaded would be controls that do nothing. A static frame with no
       * controls is the honest degradation.
       *
       * Disabled until the deferred slides mount (idle after `load`), for the
       * same reason — `disabled` says so out loud instead of failing
       * silently for the second or so it takes. */}
      {reduced ? null : (
        <div className="hero-controls">
          <button
            type="button"
            onClick={() => setPaused((v) => !v)}
            disabled={!mounted}
            aria-pressed={paused}
            aria-label={paused ? "Play the photographs" : "Pause the photographs"}
            className="hero-pause"
          >
            {paused ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M4 2.5v9l7.5-4.5L4 2.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M4.5 2.5v9M9.5 2.5v9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      )}
    </>
  );
}
