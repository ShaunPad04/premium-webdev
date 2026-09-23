import Link from "next/link";

import { LuminaInteractiveList, LuminaTitle, type LuminaSlide } from "@/components/ui/lumina-interactive-list";

/* The home hero's slides (2026-09-23: the Lumina interactive list, Brad's
 * pick from 21st.dev, in its centred layout). The photographs are
 * pre-encoded by scripts/build-hero.mjs from assets/hero. */

const sources = (file: string) => [
  { media: "(min-width: 1024px)", type: "image/avif", srcSet: `/img/hero/${file}-d.avif` },
  { media: "(min-width: 1024px)", type: "image/webp", srcSet: `/img/hero/${file}-d.webp` },
  { media: "(min-width: 1024px)", type: "image/jpeg", srcSet: `/img/hero/${file}-d.jpg` },
  /* Cover-cropped from a 9:16 portrait, so on a phone the frame is as wide
     as the screen or 0.56 of its height, whichever is larger. */
  { type: "image/avif", srcSet: `/img/hero/${file}-s.avif 900w, /img/hero/${file}-m.avif 1536w`, sizes: "max(100vw, 56svh)" },
  { type: "image/webp", srcSet: `/img/hero/${file}-s.webp 900w, /img/hero/${file}-m.webp 1536w`, sizes: "max(100vw, 56svh)" },
];

/* 2026-09-23, Brad: blurred editorial frames (Higgsfield; campaign imagery,
   not the shop, her stock or anyone real) with the name in the middle. The
   list along the foot names the frames by mood, which asserts nothing
   about the business. */
const SLIDES: LuminaSlide[] = [
  { file: "blur-1", label: "In motion" },
  { file: "blur-2", label: "Golden hour" },
  { file: "blur-3", label: "Soft knit" },
  { file: "blur-4", label: "Evening" },
  { file: "blur-5", label: "Out and about" },
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
    <LuminaInteractiveList slides={SLIDES} layout="centre" list={false}>
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
