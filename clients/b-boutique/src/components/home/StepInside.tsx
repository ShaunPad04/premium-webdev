"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { shopPhotos, type ShopPhoto } from "@/lib/about";

/* Step inside (2026-09-24, Brad). It replaced the statement pieces, which
 * were a second row of the same garments straight after New In. The home
 * page had every product and none of the place, and the place is the one
 * thing a big retailer cannot copy.
 *
 * Her own photographs of the shop, not generated ones: a generated interior
 * would be a shop that is not hers. Captions come from lib/about.ts, where
 * each one says only what is in the frame.
 *
 * Motion, one idea, the stacked-card scroll familiar from Framer sites:
 * every photograph is sticky, so the next one slides up and over the one
 * before, and the one being covered sinks back (scale and a little shade)
 * as it goes. The sink is the only JavaScript: sticky elements do not move
 * while stuck, so a CSS view timeline on them never advances. One rAF-
 * throttled scroll read writes a --sink variable per card; no re-renders.
 * Under reduced motion the cards simply scroll past, unstacked. */
const ROOMS: ShopPhoto[] = [shopPhotos.railWindow, shopPhotos.back, shopPhotos.counter];

function RoomPicture({ photo }: { photo: ShopPhoto }) {
  const set = (ext: string) =>
    photo.widths.map((w) => `/img/about/${photo.name}-${w}.${ext} ${Math.min(w, photo.w)}w`).join(", ");
  const sizes = "(min-width: 1024px) 92vw, 100vw";
  return (
    <picture>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      <img
        src={`/img/about/${photo.name}-${photo.widths[1]}.jpg`}
        srcSet={set("jpg")}
        sizes={sizes}
        width={photo.w}
        height={photo.h}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        className="si-img"
      />
    </picture>
  );
}

export function StepInside() {
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const ol = list.current;
    if (!ol || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = Array.from(ol.querySelectorAll<HTMLElement>(".si-card"));
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        /* 0 while the next card is still below the fold, 1 once it has
           covered this one. */
        const top = next.getBoundingClientRect().top;
        const stuck = card.getBoundingClientRect().top;
        const p = Math.min(1, Math.max(0, (vh - top) / Math.max(1, vh - stuck)));
        card.style.setProperty("--sink", p.toFixed(3));
      });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        window.addEventListener("scroll", onScroll, { passive: true });
        update();
      } else {
        window.removeEventListener("scroll", onScroll);
      }
    });
    io.observe(ol);
    ol.setAttribute("data-stack", "");
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      ol.removeAttribute("data-stack");
    };
  }, []);

  return (
    <section aria-labelledby="si-h" className="si">
      <div className="si-intro">
        <p className="label si-eyebrow">Step inside</p>
        <h2 id="si-h" className="si-h">
          One shop, on <em>Sea View Street.</em>
        </h2>
      </div>

      <ol ref={list} className="si-list">
        {ROOMS.map((room, i) => (
          <li key={room.name} className="si-card" style={{ "--i": i } as React.CSSProperties}>
            <div className="si-frame">
              <RoomPicture photo={room} />
              <span className="si-shade" aria-hidden="true" />
              <p className="si-cap">
                <span className="si-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="si-text">{room.caption}</span>
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="si-ctas">
        <Link href="/about" className="btn-solid si-cta">
          <span className="roll"><span>Our story</span></span> <span aria-hidden="true">&rarr;</span>
        </Link>
        <a href="#visit" className="si-link">Find the shop</a>
      </div>
    </section>
  );
}
