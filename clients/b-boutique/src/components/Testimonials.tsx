"use client";

import { useEffect, useState } from "react";

import {
  testimonials,
  testimonialShots,
  testimonialsPending,
} from "@/lib/testimonials";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { ImageSlot } from "./ImageSlot";

/* What our customers say.
 *
 * Photograph on the left, quotes moving on the right — the layout the section
 * already had, with the right-hand column changed from a one-at-a-time
 * carousel to a continuous rail.
 *
 * ── Why the carousel went ─────────────────────────────────────────────────
 * The old right column showed one quote at a time behind arrows, a counter and
 * a progress bar: four controls and a 6.5s timer to deliver six sentences. It
 * made the reader wait for content that has no order and no urgency. A rail
 * shows several at once, needs no controls, and can be read in any order at
 * whatever pace the reader has — which is what a wall of reviews is.
 *
 * That removed the swipe handler, the arrow keys, the index state and the
 * leaving-slide bookkeeping with it. None of it is missed: there is no longer
 * a position to be at, so there is nothing to navigate.
 *
 * ── The photograph keeps its own clock ────────────────────────────────────
 * It used to crossfade in step with the quote, because both were driven by one
 * index. With the quotes on a rail there is no index to follow, so the images
 * run on their own slow timer. Deliberately slower than anything on the rail:
 * two things changing at the same rate read as one mechanism, and these are
 * not related — the room is not an illustration of the quote beside it.
 *
 * ── Honesty ───────────────────────────────────────────────────────────────
 * Every quote is invented. See lib/testimonials.ts. The marker below renders
 * for as long as any entry is still placeholder, and it is deliberately in the
 * reading column rather than tucked under the fold. */

/** Slow. The rail beside it moves at 26px/s; a 9s hold reads as a different
 *  thing happening rather than a second hand on the same clock. */
const SHOT_INTERVAL = 9000;

export function Testimonials() {
  const reduced = usePrefersReducedMotion();
  const [shot, setShot] = useState(0);
  const [tabHidden, setTabHidden] = useState(false);
  const shots = testimonialShots;

  useEffect(() => {
    const onVis = () => setTabHidden(document.visibilityState === "hidden");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (reduced || tabHidden || shots.length < 2) return;
    const t = window.setTimeout(
      () => setShot((i) => (i + 1) % shots.length),
      SHOT_INTERVAL,
    );
    return () => window.clearTimeout(t);
  }, [shot, reduced, tabHidden, shots.length]);

  return (
    <section id="testimonials" aria-labelledby="tm-heading" className="tm">
      <h2 id="tm-heading" className="sr-only">
        What our customers say
      </h2>

      <div className="tm-media">
        {shots.map((s, i) => (
          <div
            key={s.slot}
            className={`tm-shot ${i === shot ? "is-active" : ""}`}
            aria-hidden={i !== shot}
          >
            <ImageSlot
              tone="marble"
              seed={31 + i}
              slot={s.slot}
              alt={i === shot ? s.alt : ""}
              sizes="(min-width: 1024px) 47vw, 100vw"
              className="absolute inset-0 h-full w-full"
            />
          </div>
        ))}
      </div>

      <div className="tm-body">
        <div className="tm-inner">
          <p className="tm-eyebrow">What our customers say</p>

          <InfiniteMovingCards
            items={testimonials.map((t, i) => ({ ...t, id: i }))}
            speed="slow"
            direction="left"
            gap={18}
            label="Customer reviews"
            className="tm-rail"
            /* The site has no card vocabulary — DESIGN.md is explicit that it
               is flat and square — so the default card is replaced rather than
               restyled at the call site. A hairline, a quote, an attribution. */
            renderItem={(t) => (
              <figure className="tm-card">
                <blockquote className="tm-card-quote">{t.quote}</blockquote>
                <figcaption className="tm-card-meta">
                  <span className="tm-card-name">{t.name}</span>
                  <span className="tm-card-source">{t.source}</span>
                </figcaption>
              </figure>
            )}
          />

          {testimonialsPending ? (
            <p className="tm-pending">
              [Placeholder testimonials — invented for this demo, awaiting
              genuine customer reviews]
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
