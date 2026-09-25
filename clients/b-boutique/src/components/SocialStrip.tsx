"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { socials } from "@/lib/nav";
import { SocialMark } from "./SocialMark";

/* "Follow along" strip above the footer (2026-09-25, preview for Brad,
 * after the Radian theme's). A row of tiles, one of them a short film of
 * the autumn look, and a Follow button to her Facebook page.
 *
 * The tiles are the shop's own imagery and link to the pieces in them, not
 * to Facebook: they are not her posts, and a grid dressed as a social feed
 * that is not one would be a small untruth on every page it sits on.
 *
 * The film is fetched only when the strip nears the screen, plays muted and
 * looped inline, pauses off screen, and never plays for anyone who has asked
 * for reduced motion (they get the still). */

type Tile = { href: string; img: string; alt: string; video?: string };

const TILES: Tile[] = [
  { href: "/shop/tailored-barrel-fit-trousers", img: "/img/look/film", alt: "The autumn look: Tailored Barrel Fit Trousers in black with the Italian Knit Ribbed Cardigan", video: "/img/look/film.mp4" },
  { href: "/shop/italian-knit-ribbed-cardigan", img: "/img/look/cardigan", alt: "Italian Knit Ribbed Cardigan in cream" },
  { href: "/shop/tartan-check-tie-skirt", img: "/img/look/tieskirt", alt: "Tartan Check Tie Skirt in burgundy" },
  { href: "/shop/chunky-knit-flower-cardigan", img: "/img/look/knit", alt: "Close-up of the hand-knit Chunky Knit Flower Cardigan" },
  { href: "/shop/leopard-print-longline-coat", img: "/img/look/leopard", alt: "Leopard Print Longline Coat" },
];

export function SocialStrip() {
  const film = useRef<HTMLVideoElement>(null);
  const fb = socials.find((s) => s.name === "Facebook");

  useEffect(() => {
    const v = film.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (v.preload !== "auto") v.preload = "auto";
          v.play().catch(() => {});
        } else v.pause();
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <section className="ss" aria-labelledby="ss-h">
      <div className="ss-head">
        <div>
          <p className="ss-eyebrow">Follow along</p>
          <h2 id="ss-h" className="ss-title">New on the rail, first on Facebook.</h2>
        </div>
        {fb ? (
          <a className="ss-follow" href={fb.href} target="_blank" rel="noopener noreferrer">
            <SocialMark name="Facebook" />
            <span>Follow B Boutique</span>
            <span className="sr-only"> on Facebook (opens in a new tab)</span>
          </a>
        ) : null}
      </div>
      <ul className="ss-row">
        {TILES.map((t) => (
          <li key={t.img}>
            <Link href={t.href} className="ss-tile" aria-label={t.alt}>
              {t.video ? (
                <video
                  ref={film}
                  className="ss-media"
                  muted
                  loop
                  playsInline
                  preload="none"
                  poster={`${t.img}-600.jpg`}
                  aria-hidden="true"
                >
                  <source src={t.video.replace(".mp4", ".webm")} type="video/webm" />
                  <source src={t.video} type="video/mp4" />
                </video>
              ) : (
                <picture>
                  <source type="image/avif" srcSet={`${t.img}-600.avif`} />
                  <source type="image/webp" srcSet={`${t.img}-600.webp`} />
                  <img className="ss-media" src={`${t.img}-600.jpg`} alt="" loading="lazy" decoding="async" />
                </picture>
              )}
              {t.video ? (
                <span className="ss-play" aria-hidden="true">
                  <svg width="10" height="12" viewBox="0 0 10 12"><path d="M0 0l10 6-10 6z" fill="currentColor" /></svg>
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
