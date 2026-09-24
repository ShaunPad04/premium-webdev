import Link from "next/link";

import { LuminaInteractiveList, LuminaTitle, type LuminaSlide } from "@/components/ui/lumina-interactive-list";

/* The home hero's slides (2026-09-23: the Lumina interactive list, Brad's
 * pick from 21st.dev, in its centred layout). The photographs are
 * pre-encoded by scripts/build-hero.mjs from assets/hero. */

const sources = (file: string) => [
  /* 1920 / 2560 / 3840 (the 4K frame): a laptop takes 1920, retina and 4K
     screens take the larger steps. The frame is full-bleed, so 100vw. */
  { media: "(min-width: 1024px)", type: "image/avif", srcSet: `/img/hero/${file}-d1920.avif 1920w, /img/hero/${file}-d2560.avif 2560w, /img/hero/${file}-d.avif 3840w`, sizes: "100vw" },
  { media: "(min-width: 1024px)", type: "image/webp", srcSet: `/img/hero/${file}-d1920.webp 1920w, /img/hero/${file}-d2560.webp 2560w, /img/hero/${file}-d.webp 3840w`, sizes: "100vw" },
  { media: "(min-width: 1024px)", type: "image/jpeg", srcSet: `/img/hero/${file}-d.jpg` },
  /* Cover-cropped from a 9:16 portrait, so on a phone the frame is as wide
     as the screen or 0.56 of its height, whichever is larger. */
  { type: "image/avif", srcSet: `/img/hero/${file}-s.avif 900w, /img/hero/${file}-s1200.avif 1200w, /img/hero/${file}-m.avif 1536w`, sizes: "max(100vw, 56svh)" },
  { type: "image/webp", srcSet: `/img/hero/${file}-s.webp 900w, /img/hero/${file}-s1200.webp 1200w, /img/hero/${file}-m.webp 1536w`, sizes: "max(100vw, 56svh)" },
];

const SLIDES: LuminaSlide[] = [
  /* Brad's MADRID reference: one aerial frame, two horses in a
     red field (Higgsfield; campaign imagery, no shop, stock or person). One
     slide, so nothing auto-advances and no pause control is needed. */
  /* 2026-09-24, Brad: more frames, a smooth slideshow. Higgsfield campaign
     imagery with a dark, empty centre so the name sits in it rather than on
     top of something: ivory silk, a boutique corner, crimson ribbon with
     pearls, and a promenade at dusk. No shop, stock or real person shown. */
  /* Silk opens, the horses follow (2026-09-24). Measured, mobile, n=5:
     horses first 81 [81-84], LCP 5.11s; silk first 89 [86-92], LCP 3.69s.
     The largest paint is the title text, which waits behind the first
     frame's bytes: 224 KB for the horses at 1200w, 37 KB for the silk. */
  { file: "silk", label: "Silk" },
  { file: "horses", label: "B Boutique" },
  { file: "rail", label: "The rail" },
  { file: "ribbon", label: "Ribbon" },
  { file: "shore", label: "The shore" },
].map(({ file, ...s }) => ({ ...s, title: "B Boutique", src: `/img/hero/${file}-m.jpg`, sources: sources(file) }));

function Cta() {
  return (
    <Link href="/shop" className="hero-cta">
      <span className="roll"><span>Shop all</span></span>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

export function HeroStrips() {
  return (
    <LuminaInteractiveList slides={SLIDES} layout="centre" list={false} transition="fade">
      <Cta />
    </LuminaInteractiveList>
  );
}

/* What the hero shows if the list ever fails: the first photograph, its
   title and the button, with nothing moving. See SafeBoundary. */
export function HeroStill() {
  const first = SLIDES[0];
  return (
    <div className="lm lm--centre">
      <div className="lm-stage" aria-hidden="true">
        <picture className="lm-pic" data-on>
          {first.sources.map((s) => (
            <source key={`${s.media ?? ""}${s.type}`} media={s.media} type={s.type} srcSet={s.srcSet} sizes={s.sizes} />
          ))}
          <img src={first.src} alt="" />
        </picture>
      </div>
      <div className="lm-scrim" aria-hidden="true" />
      <div className="lm-content">
        <p className="lm-title">
          <LuminaTitle text={first.title} />
        </p>
        <div className="lm-actions">
          <Cta />
        </div>
      </div>
    </div>
  );
}
