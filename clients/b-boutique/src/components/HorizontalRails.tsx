"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";

import { featured } from "@/lib/shop";
import { FlipText } from "./FlipText";

/* The featured category rail.
 *
 * Five photographs, resting monochrome, and the one you point at comes back
 * to its own colour. The source files are full colour and stay that way — the
 * black and white is `filter: grayscale()`, so there is one asset per
 * category rather than a colour copy and a mono copy to keep in step.
 *
 * ── Desktop ───────────────────────────────────────────────────────────────
 * Five equal columns, 2px apart, reading as one contact sheet rather than
 * five cards: no radius, no shadow, no border, no padding around the image.
 *
 * ── Mobile ────────────────────────────────────────────────────────────────
 * Five narrow columns on a phone is five slivers. It becomes a snap rail at
 * 78vw per card, and because there is no hover on touch, the card nearest the
 * centre of the rail takes its colour back. Swipe and one
 * photograph comes alive as the last one settles back — no tap required, which
 * is the point: a colour reveal you have to discover is a colour reveal nobody
 * sees.
 *
 * The pinned horizontal ScrollTrigger that used to drive this section is gone
 * with the eight-card track it moved. Five cards fit; there is nothing left to
 * pin for, and pinning to move nothing is what the hero was just cured of. */
export function HorizontalRails() {
  const rail = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    // Desktop drives colour from :hover in CSS; this is touch-only.
    const touch = window.matchMedia("(max-width: 1023px)");
    if (!touch.matches) return;

    const cards = [...el.querySelectorAll<HTMLElement>("[data-card]")];
    if (!cards.length) return;

    /* Nearest card to the centre of the rail, measured directly.
     *
     * The first attempt used an IntersectionObserver with the viewport
     * pinched to its middle 20% and threshold 0.5, and it never fired once:
     * a card is 78vw wide, so it can cover at most 20/78 = 26% of itself
     * inside that band and the 50% threshold is unreachable. IO reports how
     * MUCH of a card is visible, and the question here is WHICH card is
     * closest — those are different questions, and only one of them has an
     * answer that survives a change to the card width.
     *
     * So: compare centres. Exact, independent of card size, and correct on
     * first paint rather than only after a scroll event. */
    let frame = 0;
    const pick = () => {
      frame = 0;
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((c, i) => {
        const centre = c.offsetLeft + c.offsetWidth / 2;
        const d = Math.abs(centre - mid);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      cards.forEach((c, i) => { c.dataset.live = i === best ? "true" : "false"; });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(pick); };

    pick();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      cards.forEach((c) => delete c.dataset.live);
    };
  }, []);

  return (
    <section id="rails" aria-labelledby="rails-heading" className="cats">
      <h2 id="rails-heading" className="sr-only">
        Shop by category
      </h2>

      <ul ref={rail} className="cats-rail">
        {featured.map((c) => (
          <li key={c.slug} className="cats-card" data-card>
            <Link href={c.href} className="cats-link flip-host">
              <Image
                src={c.image}
                alt={c.alt}
                fill
                /* These are wider than the column they sit in, and that is
                   not a mistake. The card is 372x600 at 1920 while the source
                   is 3:4, so object-fit: cover scales the photograph to 450
                   wide and crops the sides — the browser only knows the 372px
                   box and would fetch for that, leaving the visible pixels
                   upscaled. 30vw covers the crop across 1024-1920 (the true
                   need runs 23-31vw), and 88vw covers it on a phone, where a
                   78vw card 452 tall needs 339 of a 3:4 frame. */
                sizes={"sizes" in c ? c.sizes : "(min-width: 1024px) 21vw, 80vw"}
                quality={90}
                className="cats-img"
              />
              <span aria-hidden="true" className="cats-scrim" />
              <span className="cats-meta">
                <span className="cats-number">{c.number}</span>
                <span className="cats-name"><FlipText>{c.name}</FlipText></span>
                <span className="cats-explore">
                  Explore <span className="cats-arrow" aria-hidden="true">&rarr;</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
