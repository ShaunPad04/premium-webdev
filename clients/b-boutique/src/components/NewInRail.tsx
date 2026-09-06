"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { newIn } from "@/lib/shop";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { ImageSlot, type Tone } from "./ImageSlot";

/* New in this week — the first light section after the black chapter.
 *
 * A carousel built on native CSS scroll-snap rather than a JS slider. It
 * drags, it flicks, it works with a trackpad, it works with arrow keys, and it
 * still works if JavaScript never loads. The buttons only add convenience on
 * top of behaviour the browser already has.
 *
 * ── The drift ─────────────────────────────────────────────────────────────
 * The rail moves continuously, at a walking pace, rather than jumping a card
 * at a time. The old behaviour advanced one card every 4.2s with a smooth
 * scroll, which is a carousel announcing itself: still, still, still, LURCH.
 * A slow constant glide reads as a shop rail being walked past, which is the
 * thing this section is a picture of.
 *
 * It is done by moving the native scroller's own scrollLeft a fraction of a
 * pixel per frame, NOT by transforming a track. That matters: the element
 * stays a real scroller, so drag, flick, trackpad, keyboard and the arrow
 * buttons all keep working exactly as they did, and none of it has to be
 * reimplemented. The list is rendered twice so the wrap is seamless — at the
 * moment it resets, the pixels either side of the seam are identical.
 *
 * Snap is off while it drifts (a mandatory snap fights a scrollLeft written
 * every frame and produces a stutter) and comes back the moment a person
 * touches it, so a flick still lands a card flush.
 *
 * ── What is under each photograph ─────────────────────────────────────────
 * Category, then name. Not brand and price — neither exists in the data, and
 * both are exactly the kind of thing that must not be invented for a shop
 * that has not opened. shop.ts is explicit that prices are absent on purpose:
 * the boutique sells in person and stock turns faster than a website does. So
 * the line under each piece is the real metadata we hold, and the section
 * closes by saying where to actually buy it.
 *
 * ── The photographs ───────────────────────────────────────────────────────
 * They are warm — brass rails, black marble, a bone floor, warm window light —
 * and the site around them is cool. They are not recoloured to fix that: the
 * files stay exactly as shot and a CSS filter calms them just enough to sit in
 * a cool room. Point at one and it returns to its own colour. */
/* Pixels per second. Slow is the whole point: fast enough that the rail is
   plainly alive, slow enough that a name stays readable while it passes and
   nothing drags itself out from under the piece you were looking at. */
const SPEED = 26;
const RESUME_AFTER = 9000; /* it stays out of the way this long after a touch */

export function NewInRail() {
  const rail = useRef<HTMLUListElement>(null);
  /* The wrap distance is measured off these two, not hard-coded. */
  const firstItem = useRef<HTMLLIElement>(null);
  const firstClone = useRef<HTMLLIElement>(null);
  const [drifting, setDrifting] = useState(false);
  /* Bumped on resize so the drift re-measures its wrap distance at the new
     breakpoint instead of running on a stale one. */
  const [resizeTick, setResizeTick] = useState(0);
  const reduced = usePrefersReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  /* Bumped by any deliberate interaction — an arrow, a drag, a keypress. The
     timer effect depends on it, so touching the rail restarts the clock for
     free rather than needing a separate "stop" to remember to call. */
  const [touchedAt, setTouchedAt] = useState(0);

  const nudge = useCallback((dir: 1 | -1) => {
    const el = rail.current;
    const a = firstItem.current;
    const b = firstClone.current;
    if (!el) return;
    // One card plus its gap, so a card never lands half-cropped.
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    /* The rail loops, so stepping back off the front jumps to the equivalent
       place one set along rather than stopping dead at zero. */
    const loop = a && b ? b.offsetLeft - a.offsetLeft : 0;
    if (dir === -1 && loop > 0 && el.scrollLeft - step < 0) {
      el.scrollLeft += loop;
    }
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  }, []);

  /* The rail walks itself along, a fraction of a pixel at a time.
   *
   * It stops for: a pointer over it, focus inside it, a hidden tab, reduced
   * motion, and any deliberate interaction (for RESUME_AFTER). That last one
   * matters most — nothing is worse than a carousel that drags itself out
   * from under the piece you were looking at.
   *
   * WCAG 2.2.2 wants a way to pause motion that runs past five seconds.
   * Hovering, focusing, or simply touching the rail all do it here; there is
   * no separate play/pause control, which is a judgement call rather than a
   * certainty — the motion is decorative, carries no information, and every
   * ordinary way of engaging with the rail halts it.
   *
   * The wrap distance is measured, not assumed: the offset between the first
   * original card and its clone is exactly one set plus one gap, whatever the
   * breakpoint has done to the card widths. Reset by that and the seam is
   * invisible, because the content either side of it is the same content. */
  useEffect(() => {
    if (reduced || hovered || tabHidden) return;
    const since = Date.now() - touchedAt;
    const delay = since < RESUME_AFTER ? RESUME_AFTER - since : 0;

    let raf = 0;
    let last = 0;
    /* The position is tracked here as a float rather than read back off the
       element, and that is load-bearing rather than tidiness. This scroller
       rounds scrollLeft to whole pixels — write 40.5, read 41 — so at 26px/s
       the ~0.43px this adds per frame was being rounded away as fast as it
       accumulated and the rail sat perfectly still. Keeping the real number
       here and writing it out each frame lets the fraction carry. */
    let pos = 0;
    /* Measured once, when the drift starts, rather than every frame.
     *
     * Fractionally, via getBoundingClientRect: offsetLeft rounds to whole
     * pixels, and at breakpoints where the card width is not an integer —
     * (100% - 32px) / 3 is 206.67 at 768 — that rounding put the wrap about a
     * pixel out and the seam showed. The difference between two elements'
     * rects is unaffected by how far the rail is scrolled, so it is safe to
     * take at any position.
     *
     * Once, because reading a rect inside the loop forces layout on every
     * frame for a number that only changes when the breakpoint does. Resize
     * bumps `resizeTick`, which restarts this effect and re-measures. */
    let loop = 0;
    let start = 0;

    const measure = () => {
      const a = firstItem.current;
      const b = firstClone.current;
      const el = rail.current;
      if (!a || !b || !el) return;
      const ar = a.getBoundingClientRect();
      /* Not rounded. Rounding was tried, on the theory that an integer jump
         would preserve the sub-pixel phase; measured, it made things slightly
         worse, because it puts the clone 0.3px out of step with the original
         it is standing in for. The true distance is the honest one. What is
         left is a sub-pixel difference at breakpoints where the card pitch is
         fractional — (100% - 32px) / 3 is 206.67 at 768 — which lands a card
         or two within a pixel of where it was, once per lap. Verified by
         inspection rather than assumed: the visible card sequence and their
         positions match across the wrap. */
      loop = b.getBoundingClientRect().left - ar.left;
      start = ar.left - el.getBoundingClientRect().left + el.scrollLeft;
    };

    const step = (now: number) => {
      const el = rail.current;
      if (!el) return;

      if (!last) last = now;
      const dt = Math.min((now - last) / 1000, 0.05); /* a backgrounded tab can
        hand back a gap of seconds; clamped so it never lurches on return */
      last = now;

      if (loop > 0) {
        pos += SPEED * dt;
        if (pos >= start + loop) pos -= loop;
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(step);
    };

    const begin = window.setTimeout(() => {
      setDrifting(true);
      measure();
      /* Pick the float accumulator up from wherever the person left the rail,
         so resuming after a drag continues from there rather than snapping
         back to the start. */
      pos = rail.current?.scrollLeft ?? 0;
      raf = requestAnimationFrame((t) => {
        last = t;
        step(t);
      });
    }, delay);

    return () => {
      window.clearTimeout(begin);
      cancelAnimationFrame(raf);
      setDrifting(false);
    };
  }, [reduced, hovered, tabHidden, touchedAt, resizeTick]);

  useEffect(() => {
    const onResize = () => setResizeTick((v) => v + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onVis = () => setTabHidden(document.visibilityState === "hidden");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const handled = useCallback(() => setTouchedAt(Date.now()), []);

  return (
    <section
      id="new-in"
      aria-labelledby="newin-heading"
      className="newin"
      /* Deliberately no onPointerEnter here. Pausing on the whole section made
         the rail stop for a cursor resting anywhere near it — over the
         heading, the arrows, the footnote, or the empty gutter beside a card —
         which reads as broken rather than considered. The pause now lives on
         the photographs themselves, below: you stop the rail by looking at a
         piece, which is the only reason to want it stopped. Focus still pauses
         from here, because a keyboard user tabbing in has the same intent and
         no pointer to express it with. */
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHovered(false);
      }}
    >
      <div className="newin-head">
        <div className="newin-title">
          <p className="newin-eyebrow">New arrivals</p>
          <h2 id="newin-heading" className="newin-h2">
            New in this week
          </h2>
        </div>

        {/* Editorial utility, not carousel furniture: a bare arrow with a
            44px hit area around it, no fill, no ring, no pill. */}
        <div className="newin-controls">
          <button
            type="button"
            onClick={() => { handled(); nudge(-1); }}
            aria-label="Show previous pieces"
            aria-controls="newin-rail"
            className="newin-arrow"
          >
            <span aria-hidden="true">&larr;</span>
          </button>
          <button
            type="button"
            onClick={() => { handled(); nudge(1); }}
            aria-label="Show more pieces"
            aria-controls="newin-rail"
            className="newin-arrow"
          >
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>

      <ul
        id="newin-rail"
        ref={rail}
        onPointerDown={handled}
        onKeyDown={handled}
        onWheel={handled}
        tabIndex={0}
        aria-label="New arrivals"
        className={`newin-rail${drifting ? " is-drifting" : ""}`}
      >
        {/* The set is rendered twice. The first copy is the real list; the
            second exists only so the wrap has somewhere to land, and is hidden
            from assistive technology so nothing is announced twice. Nothing in
            a card is focusable, so the clone adds no tab stops either. */}
        {[0, 1].map((copy) =>
          newIn.map((piece, i) => (
            <li
              key={`${copy}-${piece.slug}`}
              ref={i === 0 ? (copy === 0 ? firstItem : firstClone) : undefined}
              aria-hidden={copy === 1 ? true : undefined}
              className="newin-item"
              style={{ "--i": i } as React.CSSProperties}
            >
              <div
              className="newin-media"
              /* The hover target is the image, not the card and not the
                 section. Crossing the 16px gap between two cards resumes the
                 drift for a frame or two — at 26px/s that is under 3px, and
                 the alternative (a debounce) buys nothing you can see. */
              onPointerEnter={() => setHovered(true)}
              onPointerLeave={() => setHovered(false)}
            >
                <ImageSlot
                  tone={piece.tone as Tone}
                  seed={i + 11}
                  uid={`newin-${copy}-${i}`}
                  slot={`new-${piece.slug}`}
                  /* Empty on purpose. The category and name sit directly beneath
                     in real text, so a copy of the name here would just be
                     announced twice — and there is no per-piece description in
                     the data to say anything more useful without inventing it. */
                  alt=""
                  sizes="(min-width: 1280px) 19vw, (min-width: 768px) 31vw, 78vw"
                  className="absolute inset-0 h-full w-full"
                />
              </div>
              <p className="newin-cat">{piece.category}</p>
              <p className="newin-name">{piece.name}</p>
            </li>
          )),
        )}
      </ul>

      <p className="newin-foot">
        Stock changes weekly and sells in the shop, not online.{" "}
        <a href="#visit" className="newin-viewall">
          View all new in <span className="newin-viewall-arrow" aria-hidden="true">&rarr;</span>
        </a>
      </p>
    </section>
  );
}
