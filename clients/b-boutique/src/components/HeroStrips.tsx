"use client";

import Link from "next/link";
import { useState } from "react";

import ParallaxStripSlider, { type Slide } from "@/components/ui/parallax-strip-slider";
import { openingSummary, shop } from "@/lib/shop";

/* The home hero's slides. Same five photographs as before (public/img/hero,
 * phone and desktop crops), the same captions — every one of which is
 * either her positioning line or derived from shop.ts — with the headline
 * that used to sit on its own now carried by the first slide. */
const everyDay = openingSummary().toLowerCase().startsWith("every day");

const sources = (file: string) => [
  { media: "(min-width: 1024px)", type: "image/avif", srcSet: `/img/hero/${file}-d.avif` },
  { media: "(min-width: 1024px)", type: "image/webp", srcSet: `/img/hero/${file}-d.webp` },
  { media: "(min-width: 1024px)", type: "image/jpeg", srcSet: `/img/hero/${file}-d.jpg` },
  /* The frame is cover-cropped from a 9:16 portrait, so on a phone it is
     as wide as the screen or 0.56 of the screen's height, whichever is
     larger; `sizes` says exactly that, and a typical phone takes the 900. */
  { type: "image/avif", srcSet: `/img/hero/${file}-s.avif 900w, /img/hero/${file}-m.avif 1536w`, sizes: "max(100vw, 56svh)" },
  { type: "image/webp", srcSet: `/img/hero/${file}-s.webp 900w, /img/hero/${file}-m.webp 1536w`, sizes: "max(100vw, 56svh)" },
];

const SLIDES: Slide[] = [
  { file: "1-paris", title: <>For every woman<br />who walks <em>in</em>.</> },
  { file: "2-street", title: <>Independent<br /><em>womenswear</em>.</> },
  { file: "3-terrace", title: <>Homeware<br />and <em>gifts</em>.</> },
  { file: "4-flowers", title: <>{shop.street},<br />{shop.town}.</> },
  { file: "5-sea", title: everyDay ? <>Open<br /><em>every</em> day.</> : <>Come<br /><em>in</em>.</> },
].map(({ file, title }) => ({ src: `/img/hero/${file}-m.jpg`, sources: sources(file), title }));

export function HeroStrips() {
  const [paused, setPaused] = useState(false);

  return (
    <ParallaxStripSlider
      slides={SLIDES}
      autoplay
      paused={paused}
      showProgressBar
      accentColor="#FDFAF9"
      backgroundColor="#1A1416"
      scrim="linear-gradient(to top, rgba(26,20,22,.78) 0%, rgba(26,20,22,.34) 42%, rgba(26,20,22,.06) 70%, rgba(26,20,22,.38) 100%)"
    >
      <div className="flex items-center gap-3">
        <Link href="/shop" className="hero-cta">
          <span className="roll"><span>See what is in</span></span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        {/* WCAG 2.2.2: the slides move on their own every six seconds. */}
        <button
          type="button"
          onClick={() => setPaused((v) => !v)}
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
    </ParallaxStripSlider>
  );
}

/* What the hero shows if the slider ever fails: the first photograph, the
   headline and the button, with nothing moving. See SafeBoundary. */
export function HeroStill() {
  const first = SLIDES[0];
  return (
    <div className="relative h-full w-full overflow-hidden bg-bb-black">
      <picture>
        {first.sources?.map((s) => (
          <source key={`${s.media ?? ""}${s.type}`} media={s.media} type={s.type} srcSet={s.srcSet} sizes={s.sizes} />
        ))}
        <img src={first.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </picture>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(26,20,22,.78) 0%, rgba(26,20,22,.3) 45%, rgba(26,20,22,.38) 100%)" }}
      />
      <div className="absolute inset-x-0 bottom-0 flex items-end gap-6 px-[18px] pb-14 sm:px-10 md:px-[var(--bb-gutter-editorial)] pointer-coarse:flex-col pointer-coarse:items-start">
        <p className="pss-title flex-1" style={{ color: "#FDFAF9" }}>{first.title}</p>
        <Link href="/shop" className="hero-cta">
          <span className="roll"><span>See what is in</span></span>
        </Link>
      </div>
    </div>
  );
}
