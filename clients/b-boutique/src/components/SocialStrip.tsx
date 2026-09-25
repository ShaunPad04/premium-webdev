"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { socials } from "@/lib/nav";
import { SocialMark } from "./SocialMark";

/* "Follow along" grid above the footer (2026-09-25, preview for Brad,
 * after the Radian theme's): three by two, square tiles edge to edge, the
 * autumn-look film top middle, and a Follow button to her Facebook page.
 *
 * The film is her real stock (the cardigan and barrel trousers) and links to
 * the trousers. The other five are generated mood images: a Paris street, a
 * Milan still life, a New York runway, London at dusk, Lake Como. None of
 * the clothes in them are pieces she sells, so they link nowhere and their
 * alt text says what they show, not a product name. They are not her posts
 * either, which is why the grid does not dress itself up as a Facebook feed.
 *
 * The film is fetched only when the grid nears the screen, plays muted and
 * looped inline, pauses off screen, and never plays for anyone who has asked
 * for reduced motion (they get the still). */

type Mood = { img: string; alt: string };

const FILM = {
  href: "/shop/tailored-barrel-fit-trousers",
  alt: "The autumn look: Tailored Barrel Fit Trousers in black with the Italian Knit Ribbed Cardigan",
};

// Grid order, row by row; the film takes the second slot.
const BEFORE: Mood[] = [{ img: "paris", alt: "A woman in black sunglasses and a black blazer against a sunlit Paris wall" }];
const AFTER: Mood[] = [
  { img: "milan", alt: "A black leather handbag, tortoiseshell sunglasses and gold hoops on a marble table" },
  { img: "nyfw", alt: "A model on a New York runway in a camel coat and wide black trousers" },
  { img: "london", alt: "A woman in a brown satin dress on a wet London street at dusk" },
  { img: "como", alt: "A woman in ivory silk leaning on a stone terrace above Lake Como" },
];

function MoodTile({ m }: { m: Mood }) {
  return (
    <li className="ss-tile">
      <picture>
        <source type="image/avif" srcSet={`/img/look/${m.img}-640.avif 640w, /img/look/${m.img}-1000.avif 1000w`} sizes="34vw" />
        <source type="image/webp" srcSet={`/img/look/${m.img}-640.webp 640w, /img/look/${m.img}-1000.webp 1000w`} sizes="34vw" />
        <img className="ss-media" src={`/img/look/${m.img}-1000.jpg`} alt={m.alt} width={1000} height={1000} loading="lazy" decoding="async" />
      </picture>
    </li>
  );
}

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
      <ul className="ss-grid">
        {BEFORE.map((m) => <MoodTile key={m.img} m={m} />)}
        <li className="ss-tile">
          <Link href={FILM.href} className="ss-film" aria-label={FILM.alt}>
            <video
              ref={film}
              className="ss-media ss-media--film"
              muted
              loop
              playsInline
              preload="none"
              poster="/img/look/film-600.jpg"
              aria-hidden="true"
            >
              <source src="/img/look/film.webm" type="video/webm" />
              <source src="/img/look/film.mp4" type="video/mp4" />
            </video>
            <span className="ss-play" aria-hidden="true">
              <svg width="10" height="12" viewBox="0 0 10 12"><path d="M0 0l10 6-10 6z" fill="currentColor" /></svg>
            </span>
          </Link>
        </li>
        {AFTER.map((m) => <MoodTile key={m.img} m={m} />)}
      </ul>
    </section>
  );
}
