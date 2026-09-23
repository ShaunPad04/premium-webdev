import Link from "next/link";

import { LuminaInteractiveList, LuminaTitle, type LuminaSlide } from "@/components/ui/lumina-interactive-list";
import { openingPhrase, openingSummary, shop } from "@/lib/shop";

/* The home hero's slides (2026-09-23: the Lumina interactive list, Brad's
 * pick from 21st.dev, replacing the strip slider). Same five photographs,
 * same titles. Every description is either the shop describing itself in
 * words the site already carries (lib/about.ts, lib/statements.ts) or is
 * derived from shop.ts, so nothing here can drift from the rest of the site. */
const everyDay = openingSummary().toLowerCase().startsWith("every day");

const sources = (file: string) => [
  { media: "(min-width: 1024px)", type: "image/avif", srcSet: `/img/hero/${file}-d.avif` },
  { media: "(min-width: 1024px)", type: "image/webp", srcSet: `/img/hero/${file}-d.webp` },
  { media: "(min-width: 1024px)", type: "image/jpeg", srcSet: `/img/hero/${file}-d.jpg` },
  /* Cover-cropped from a 9:16 portrait, so on a phone the frame is as wide
     as the screen or 0.56 of its height, whichever is larger. */
  { type: "image/avif", srcSet: `/img/hero/${file}-s.avif 900w, /img/hero/${file}-m.avif 1536w`, sizes: "max(100vw, 56svh)" },
  { type: "image/webp", srcSet: `/img/hero/${file}-s.webp 900w, /img/hero/${file}-m.webp 1536w`, sizes: "max(100vw, 56svh)" },
];

const SLIDES: LuminaSlide[] = [
  {
    file: "1-paris",
    label: "Walk in",
    title: "For every woman|who walks *in*.",
    description: `Independent womenswear and homeware on ${shop.street}, ${shop.town}.`,
  },
  {
    file: "2-street",
    label: "Womenswear",
    title: "Independent|*womenswear*.",
    description: "One shop, one street, every piece chosen by hand.",
  },
  {
    file: "3-terrace",
    label: "Homeware",
    title: "Homeware|and *gifts*.",
    description: "Browse online, or come in and see it first.",
  },
  {
    file: "4-flowers",
    label: "The shop",
    title: `${shop.street},|${shop.town}.`,
    description: "Not a chain. One shop, on one street.",
  },
  {
    file: "5-sea",
    label: everyDay ? "Every day" : "Opening",
    title: everyDay ? "Open|*every* day." : "Come|*in*.",
    description: `Open ${openingPhrase()}.`,
  },
].map(({ file, ...s }) => ({ ...s, src: `/img/hero/${file}-m.jpg`, sources: sources(file) }));

function Cta() {
  return (
    <Link href="/shop" className="hero-cta">
      <span className="roll"><span>See what is in</span></span>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

export function HeroStrips() {
  return (
    <LuminaInteractiveList slides={SLIDES}>
      <Cta />
    </LuminaInteractiveList>
  );
}

/* What the hero shows if the list ever fails: the first photograph, its
   title and the button, with nothing moving. See SafeBoundary. */
export function HeroStill() {
  const first = SLIDES[0];
  return (
    <div className="lm">
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
        <p className="lm-desc">{first.description}</p>
        <div className="lm-actions">
          <Cta />
        </div>
      </div>
    </div>
  );
}
