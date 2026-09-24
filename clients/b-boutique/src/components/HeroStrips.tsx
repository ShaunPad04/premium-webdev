import Link from "next/link";

import { openingPhrase, shop } from "@/lib/shop";

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
  { type: "image/avif", srcSet: `/img/hero/${file}-s.avif 900w, /img/hero/${file}-s1200.avif 1200w, /img/hero/${file}-m.avif 1536w, /img/hero/${file}-s1800.avif 1800w`, sizes: "max(100vw, 56svh)" },
  { type: "image/webp", srcSet: `/img/hero/${file}-s.webp 900w, /img/hero/${file}-s1200.webp 1200w, /img/hero/${file}-m.webp 1536w, /img/hero/${file}-s1800.webp 1800w`, sizes: "max(100vw, 56svh)" },
];

const SLIDES: LuminaSlide[] = [
  /* Brad's MADRID reference: one aerial frame, two horses in a
     red field (Higgsfield; campaign imagery, no shop, stock or person). One
     slide, so nothing auto-advances and no pause control is needed. */
  { file: "horses", label: "B Boutique" },
].map(({ file, ...s }) => ({ ...s, title: "B Boutique", src: `/img/hero/${file}-m.jpg`, sources: sources(file) }));

/* Is it open, and where is it: the two questions a phone visitor arrives
   with, answered on the first screen (2026-09-24, homepage critique). They
   used to appear first some thirteen screens down. Both halves derive from
   shop.ts, so this line cannot disagree with the Visit section. It sits at
   the foot of the frame, not in the centre: the client asked on 2026-09-22
   for the middle to be the name and one button, nothing else. */
function Where() {
  return (
    <p className="hero-open">
      Open {openingPhrase()} <span aria-hidden="true">·</span> {shop.street}, {shop.town}
    </p>
  );
}

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
    <>
    <LuminaInteractiveList slides={SLIDES} layout="centre" list={false}>
      <Cta />
    </LuminaInteractiveList>
    <Where />
    </>
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
      <Where />
    </div>
  );
}
