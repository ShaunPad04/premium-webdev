"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { formatPriceShort } from "@/lib/catalogue";
import { newIn } from "@/lib/shop";
import { useInView } from "@/lib/useInView";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { ProductPhoto } from "./ProductPhoto";

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
 * prices live in lib/catalogue.ts with the shop rather than here, and every
 * one of them is invented. So the line under each piece is the metadata this
 * list holds, and the section closes by sending you to the shop.
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
/* Long enough for an arrow button's smooth scrollBy to land, and no longer.
 *
 * This was 9000ms, and it was bound to a wheel handler on the rail as well as
 * to the arrows. That combination is why the rail read as broken: scrolling
 * the PAGE with the cursor anywhere over the rail fires `wheel` on it, so the
 * ordinary act of arriving at the section stopped the drift for nine seconds
 * — which is roughly how long it takes to read the section and scroll on. The
 * client's instruction is that it should stop on hover and otherwise move, so
 * the wheel handler is gone and this is now only what the arrows need.
 *
 * A drag needs no allowance of its own: dragging means a pointer is on the
 * rail, and a pointer on the rail is already the hover pause. */
const RESUME_AFTER = 700;
/** Time constant for the glide in and out of a hover pause, in seconds.
 *  See the easing note in the drift loop. */
const EASE_TAU = 0.2;

export function NewInRail() {
  const rail = useRef<HTMLUListElement>(null);
  /* The wrap distance is measured off these two, not hard-coded. */
  const firstItem = useRef<HTMLLIElement>(null);
  const firstClone = useRef<HTMLLIElement>(null);
  /* "This rail is under script control", NOT "it is moving right now".
   *
   * The distinction is the second half of the smooth-stop fix. The class
   * turns scroll-snap off, and it used to be cleared the moment the drift
   * paused — so a pointer landing on the rail handed a mandatory snap back to
   * the browser mid-glide, and it immediately dragged the nearest card flush
   * against the gutter. That is the backwards jolt the client reported, and
   * it is not the easing: it is the browser correcting a position the script
   * had legitimately left between two cards.
   *
   * So the flag now tracks the loop's existence rather than its velocity. It
   * goes off only when the drift genuinely ends — reduced motion, an unmount,
   * a resize re-measure — at which point snap is wanted again. */
  const [drifting, setDrifting] = useState(false);
  /* Set by the drift loop so the pointer-leave effect can wake it. */
  const resumeRef = useRef<(() => void) | null>(null);
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
  /* Off screen, the drift stops entirely. It used to write scrollLeft on this
     rail sixty times a second from the moment the page loaded, including the
     whole time the section was below the fold — scroll and paint work on
     twelve photographs nobody could see. */
  const [section, inView] = useInView<HTMLElement>();

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
   * The only stop a visitor can see is a pointer on the rail, or focus inside
   * it. The three others are invisible by construction: a hidden tab and an
   * off-screen section stop work nobody could watch, and reduced motion is the
   * setting asking for it. An arrow click buys RESUME_AFTER so its smooth
   * scroll is not fought frame by frame.
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
  /* `hovered` is deliberately NOT in the dependency list below. It is read
     through a ref inside the loop instead, so a pointer arriving on the rail
     changes the loop's target velocity rather than tearing the loop down and
     rebuilding it. Restarting the effect is what made the stop instant. */
  const pausedRef = useRef(false);
  /* Written in an effect rather than during render. Assigning
     `pausedRef.current = hovered` in the component body is a ref mutation
     during render, which React's own lint rule rejects and which is unsafe
     under concurrent rendering: a render that gets thrown away still leaves
     the ref changed. An effect runs after the commit, so the ref only ever
     reflects state that was actually painted. */
  useEffect(() => {
    pausedRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    if (reduced || tabHidden || !inView) return;
    const since = Date.now() - touchedAt;
    const delay = since < RESUME_AFTER ? RESUME_AFTER - since : 0;

    let raf = 0;
    let last = 0;
    /* Current speed in px/s, eased toward its target rather than set to it.
       This is the whole of the fix for the hard stop: the rail was going from
       26px/s to nothing between two frames, which reads as a freeze, and the
       snap re-engaging on the same frame then pulled the nearest card flush —
       the backwards jolt. Now it decelerates into the pause and accelerates
       out of it, and the snap never re-engages (see `is-drifting` below). */
    let vel = 0;
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

      /* Exponential approach to the target speed, framerate-independent.
         1 - e^(-dt/TAU) is the fraction of the remaining gap to close this
         frame; using dt rather than a fixed factor means a 120Hz display and
         a 60Hz one decelerate over the same number of SECONDS rather than the
         same number of frames. TAU is the time constant: the gap closes to
         ~63% in one TAU, so the glide settles in a little over half a second
         — long enough to read as easing, short enough that a pointer landing
         on a card does not feel ignored. */
      const target = pausedRef.current ? 0 : SPEED;
      vel += (target - vel) * (1 - Math.exp(-dt / EASE_TAU));
      /* Below a twentieth of a pixel per second nothing more will ever be
         painted, so settle exactly on zero rather than approaching it for the
         rest of the session. */
      if (target === 0 && vel < 0.05) vel = 0;

      if (loop > 0 && vel > 0) {
        pos += vel * dt;
        if (pos >= start + loop) pos -= loop;
        el.scrollLeft = pos;
      }

      /* Fully stopped and asked to stay stopped: give the frame budget back
         until something changes. The effect does not tear down, so nothing is
         re-measured and the position is not lost — `resume` picks the loop up
         exactly where it left off. */
      if (target === 0 && vel === 0) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(step);
    };

    /* Called when the pointer leaves. The loop may have parked itself above,
       in which case it needs waking; if it is still gliding to a halt it is
       already running and this is a no-op. */
    const resume = () => {
      if (raf || pausedRef.current) return;
      last = 0;
      raf = requestAnimationFrame(step);
    };
    resumeRef.current = resume;

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
      resumeRef.current = null;
      setDrifting(false);
    };
    /* `hovered` is absent on purpose — see pausedRef above. */
  }, [reduced, tabHidden, inView, touchedAt, resizeTick]);

  /* Wake the parked loop when the pointer leaves. Hover is handled inside the
     loop rather than by restarting the effect, so this is the one thing that
     has to reach in from outside. */
  useEffect(() => {
    if (!hovered) resumeRef.current?.();
  }, [hovered]);

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
      ref={section}
      aria-labelledby="newin-heading"
      className="newin"
      /* Deliberately no onPointerEnter on the SECTION. Pausing here made the
         rail stop for a cursor resting anywhere near it — over the heading,
         the footnote, or the empty gutter — which reads as broken rather than
         considered. The pointer pause lives on the rail itself, below.
         Focus still pauses from here, because a keyboard user tabbing in has
         the same intent and no pointer to express it with. */
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
        /* The whole rail is the hover target, not each photograph.
           It was on the photographs, which meant the 16px gap between two
           cards resumed the drift for a frame or two as the cursor crossed
           it — a twitch under a pointer that had not left the rail. The <ul>
           is exactly the cards and their gaps and nothing else, so it is the
           honest boundary for "the pointer is on the carousel".
           No onWheel: a wheel event here is almost always the page being
           scrolled past, not the rail being scrolled. See RESUME_AFTER. */
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
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
              {/* ── The card is a LINK, since 2026-09-22 ───────────────────
                  It was not, and the client found that the way a customer
                  would: "when I click one of these... it should show the
                  product page". Nothing happened, because the only link in
                  this rail was "View all" at the end. A rail of photographed
                  products on the busiest page of the shop, and not one of
                  them could be clicked.

                  ── The clone must not add tab stops ──────────────────────
                  The set renders twice so the marquee has somewhere to wrap.
                  The second copy is aria-hidden, which handles screen
                  readers, and it did not matter for the keyboard before
                  because nothing in a card was focusable. Now it is: without
                  tabIndex={-1} a keyboard user would tab through TWENTY links
                  to reach ten products, half of them invisible duplicates. */}
              <Link
                href={`/shop/${piece.slug}`}
                tabIndex={copy === 1 ? -1 : undefined}
                className="newin-link"
              >
              <div className="newin-media">
                <ProductPhoto
                  photo={piece.photo}
                  square={piece.category === "Homeware"}
                  /* Empty on purpose. The category and name sit directly beneath
                     in real text, so a copy of the name here would just be
                     announced twice — and there is no per-piece description in
                     the data to say anything more useful without inventing it. */
                  alt=""
                  sizes="(min-width: 1280px) 19vw, (min-width: 768px) 31vw, 78vw"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              {/* One line, and it is the piece.
                  It used to be category-then-name — "JACKETS" over "Tailored
                  camel blazer". The client asked for the specific product
                  instead, in her words "'Italian Blue Knitwear', etc", and
                  she is right: a rail headed New in this week that labels a
                  card JACKETS is answering a question nobody asked. The
                  category is already the nav, the category pages and the
                  shop's own filter; here it was a second, vaguer label above
                  the real one.
                  The names themselves are still ours, not hers — see the note
                  on `newIn` in lib/shop.ts. They describe what is in the
                  photograph and claim no colour, origin, fibre or brand,
                  which is exactly what "Italian Blue Knitwear" would claim
                  three times over. They are replaced, not edited, when her
                  real list arrives. */}
              <p className="newin-name">{piece.name}</p>
              {/* Price and a control, because this is a shop.
                  The rail carried a name and nothing else until 2026-09-22.
                  On a clothing site that is a lookbook, not a shop window —
                  the client asked for "pricing and a CTA below the products,
                  remember this is a professional ecommerce store".

                  Same rule as everywhere else: a placeholder is not a price.
                  The eight pieces still waiting on her figure say so instead
                  of printing one. */}
              <p className="newin-price">
                {piece.priced ? (
                  formatPriceShort(piece.priceP)
                ) : (
                  <span className="newin-price--pending">Price to confirm</span>
                )}
              </p>
              {/* Not a nested <a> — the whole card is already the link, and a
                  link inside a link is invalid and unusable with a keyboard.
                  This is the card's own affordance, styled as a control and
                  driven by the card's hover and focus. */}
              <span aria-hidden="true" className="newin-cta">
                View piece
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              </Link>
            </li>
          )),
        )}
      </ul>

      <p className="newin-foot">
        Stock changes weekly, and everything here is a single piece.{" "}
        <Link href="/shop" className="newin-viewall">
          Shop all new in <span className="newin-viewall-arrow" aria-hidden="true">&rarr;</span>
        </Link>
      </p>
    </section>
  );
}
