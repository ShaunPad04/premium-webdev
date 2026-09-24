import Link from "next/link";

import { shop } from "@/lib/shop";

/* The home hero (2026-09-24, Brad's editorial rebuild): one full-screen
 * photograph, one line in Anton, one button. It replaced the five-slide
 * Lumina slideshow, which kept a WebGL context and five full-width frames
 * alive for a hero that only ever shows one at a time.
 *
 * No JavaScript: a server component, a <picture> and a CSS settle. The
 * photograph is the horses in the red field (Higgsfield campaign imagery, no
 * shop, stock or person). Sources are the ones scripts/build-hero.mjs makes. */

const H = "/img/hero/horses";

export function HomeHero() {
  return (
    <section id="top" className="hh" aria-labelledby="hh-h">
      <picture className="hh-pic">
        <source media="(min-width: 1024px)" type="image/avif" srcSet={`${H}-d1920.avif 1920w, ${H}-d2560.avif 2560w, ${H}-d.avif 3840w`} sizes="100vw" />
        <source media="(min-width: 1024px)" type="image/webp" srcSet={`${H}-d1920.webp 1920w, ${H}-d2560.webp 2560w, ${H}-d.webp 3840w`} sizes="100vw" />
        <source type="image/avif" srcSet={`${H}-s.avif 900w, ${H}-s1200.avif 1200w, ${H}-m.avif 1536w`} sizes="max(100vw, 56svh)" />
        <source type="image/webp" srcSet={`${H}-s.webp 900w, ${H}-s1200.webp 1200w, ${H}-m.webp 1536w`} sizes="max(100vw, 56svh)" />
        <img src={`${H}-m.jpg`} alt="" fetchPriority="high" decoding="async" className="hh-img" />
      </picture>
      <div className="hh-scrim" aria-hidden="true" />
      <div className="hh-body">
        <h1 id="hh-h" className="hh-h">
          <span className="sr-only">{shop.name}, {shop.street}, {shop.town}. </span>
          For every woman who walks in.
        </h1>
        <Link href="/shop" className="hero-cta">
          <span className="roll"><span>Shop new in</span></span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
