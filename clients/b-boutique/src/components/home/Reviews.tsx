"use client";

import { useReducedMotion } from "motion/react";

import { CardTransformed, CardsContainer, ContainerScroll, ReviewStars } from "@/components/ui/animated-cards-stack";
import { googleSummary, reviews, type Review } from "@/lib/reviews";

/* Reviews (2026-09-26, Brad: the 21st.dev animated cards stack). The cards
 * sit in a fanned pile on a sticky stage and lift off one by one as the
 * page scrolls, leaving the last. Every word comes from lib/reviews.ts,
 * which holds only reviews copied from Google, and the section renders
 * nothing while that list is empty.
 *
 * Each card reads like Google's own: a lettered avatar, the name, the
 * stars, the words. No date ("2 hours ago" is true for two hours) and no
 * review count (it went stale with every new review); the link goes to the
 * listing, which always has both. With reduced motion there is no pile:
 * the cards sit in a plain grid. */

/* The avatar's colour is picked from the name, so it stays the same on
   every visit, as Google's does. Each has white text at 4.5:1 or better. */
const AVATAR = ["#B3261E", "#1F5E4B", "#3B4A8C", "#7A3E6B", "#5B5B5B"];
const avatarColour = (name: string) =>
  AVATAR[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR.length];

function Card({ r, id }: { r: Review; id: string }) {
  return (
    <>
      {r.stars ? <ReviewStars rating={r.stars} className="rv-stack-stars" /> : null}
      <blockquote id={`${id}-q`} className="rv-stack-quote">
        {r.quote ?? "A rating, left without a written review."}
      </blockquote>
      <div className="rv-stack-by">
        <span className="rv-avatar" aria-hidden="true" style={{ background: avatarColour(r.name) }}>
          {r.name.trim().charAt(0).toUpperCase()}
        </span>
        <span className="rv-who">
          <span id={`${id}-n`} className="rv-name">{r.name}</span>
          <span className="rv-src">{r.source} {r.quote ? "review" : "rating"}</span>
        </span>
      </div>
    </>
  );
}

export function Reviews({ items = reviews }: { items?: Review[] }) {
  const reduce = useReducedMotion();
  if (items.length === 0) return null;
  return (
    <section className="rv rv--stack" aria-labelledby="rv-h">
      <div className="rv-inner">
        <p className="label rv-eyebrow">Reviews</p>
        <h2 id="rv-h" className="rv-h">In their <em>words</em></h2>
        <p className="rv-summary">
          <ReviewStars rating={5} className="rv-stack-stars" />
          <span>{googleSummary.rating} on Google</span>
          <span aria-hidden="true">·</span>
          <a href={googleSummary.href} target="_blank" rel="noopener noreferrer" className="rv-summary-link">
            Read them on Google<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </div>

      {reduce ? (
        <ul className="rv-stack-grid">
          {items.map((r, i) => (
            <li key={r.name} className="rv-stack-card rv-stack-card--flat" aria-labelledby={`rv${i}-n`}>
              <Card r={r} id={`rv${i}`} />
            </li>
          ))}
        </ul>
      ) : (
        <ContainerScroll className="rv-stack-scroll" style={{ height: `${Math.max(2, items.length) * 75}svh` }}>
          <div className="rv-stack-stage">
            <CardsContainer className="rv-stack-cards">
              {items.map((r, i) => (
                <CardTransformed
                  key={r.name}
                  arrayLength={items.length}
                  index={i + 2}
                  role="article"
                  aria-labelledby={`rv${i}-n`}
                  aria-describedby={`rv${i}-q`}
                  className="rv-stack-card"
                >
                  <Card r={r} id={`rv${i}`} />
                </CardTransformed>
              ))}
            </CardsContainer>
          </div>
        </ContainerScroll>
      )}
    </section>
  );
}
