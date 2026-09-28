"use client";

import Link from "@/components/Link";
import Image from "next/image";
import { useEffect, useRef } from "react";

import { featured } from "@/lib/shop";
import { FlipText } from "./FlipText";
import { Arrow } from "@/components/Arrow";

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
 * Four narrow columns on a phone is four slivers. It becomes a swipe pager at
 * 78vw per card (see the effect below), and because there is no hover on
 * touch, the card in view takes its colour back.
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

    /* A pager, not a scroller (2026-09-27, Brad: "you shouldn't be able to
     * pull it at all ... it should just be sat in one nice spot, and no
     * white should show"). The row used to be a native snap scroller, and
     * iOS let it be dragged past either end, showing the white page behind,
     * or left between two cards. The native fix, overscroll-behavior-x,
     * was tried on 2026-09-24 and removed: on iOS it also trapped the
     * page's vertical scroll.
     *
     * So the row does not scroll at all. The browser keeps vertical panning
     * (touch-action: pan-y in CSS); a sideways swipe moves exactly one card
     * with an eased glide. The first and last cards sit flush with the
     * screen edges and the middle ones are centred, so there is never a
     * gap, and a swipe past either end does nothing. The live card takes
     * its colour back, as before. */
    let index = 0;
    const place = (i: number) => {
      index = Math.max(0, Math.min(cards.length - 1, i));
      const c = cards[index];
      const view = el.parentElement?.clientWidth ?? window.innerWidth;
      const max = Math.max(0, el.scrollWidth - view);
      const x = Math.max(0, Math.min(max, c.offsetLeft - (view - c.offsetWidth) / 2));
      el.style.transform = `translate3d(${-x}px, 0, 0)`;
      cards.forEach((card, n) => { card.dataset.live = n === index ? "true" : "false"; });
    };

    let start: { x: number; y: number; t: number } | null = null;
    let swiped = false;
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      start = { x: e.clientX, y: e.clientY, t: e.timeStamp };
      swiped = false;
    };
    const up = (e: PointerEvent) => {
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const fast = Math.abs(dx) / Math.max(1, e.timeStamp - start.t) > 0.35;
      start = null;
      if (Math.abs(dx) < Math.abs(dy) || (Math.abs(dx) < 40 && !fast) || Math.abs(dx) < 12) return;
      swiped = true;
      place(index + (dx < 0 ? 1 : -1));
    };
    const cancel = () => { start = null; };
    // A swipe that ends on a card is not a tap on its link.
    const click = (e: MouseEvent) => {
      if (swiped) { e.preventDefault(); e.stopPropagation(); swiped = false; }
    };
    // Tabbing to a card brings it into view.
    const focus = (e: FocusEvent) => {
      const i = cards.findIndex((c) => c.contains(e.target as Node));
      if (i >= 0) place(i);
    };
    const resize = () => place(index);

    place(0);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", cancel);
    el.addEventListener("click", click, true);
    el.addEventListener("focusin", focus);
    window.addEventListener("resize", resize, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", cancel);
      el.removeEventListener("click", click, true);
      el.removeEventListener("focusin", focus);
      window.removeEventListener("resize", resize);
      el.style.transform = "";
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
                /* Four cards since Homeware left the rail (2026-09-26).
                   Measured: at 1440 a card is 360x547, so the 3:4 photo is
                   drawn 410 wide (28.5vw); 30vw covers it. */
                sizes="(min-width: 1024px) 30vw, 88vw"
                quality={90}
                className="cats-img"
              />
              <span aria-hidden="true" className="cats-scrim" />
              <span className="cats-meta">
                <span className="cats-number">{c.number}</span>
                <span className="cats-name"><FlipText>{c.name}</FlipText></span>
                <span className="cats-explore">
                  Explore <span className="cats-arrow" aria-hidden="true"><Arrow /></span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
