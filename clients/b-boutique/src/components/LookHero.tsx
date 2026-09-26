"use client";

import { Cta, Where } from "./HeroStrips";

/* The lookbook hero (2026-09-25, preview for Brad).
 *
 * One campaign frame: a model in two real pieces from the rail, generated
 * in Higgsfield from those pieces' own product photographs and checked
 * against them. The desktop frame is 16:9; the phone frame is the same
 * photograph with the backdrop extended to 9:16.
 *
 * The dot on each garment (a link to that piece with a preview card) was
 * removed on 2026-09-26 at Brad's request; the photograph stands alone. */

export function LookHero() {
  return (
    <div className="lk">
      <picture className="lk-pic">
        <source media="(min-width: 768px)" type="image/avif" srcSet="/img/hero/look-d1920.avif 1920w, /img/hero/look-d2560.avif 2560w, /img/hero/look-d3840.avif 3840w" sizes="100vw" />
        <source media="(min-width: 768px)" type="image/webp" srcSet="/img/hero/look-d1920.webp 1920w, /img/hero/look-d2560.webp 2560w, /img/hero/look-d3840.webp 3840w" sizes="100vw" />
        <source media="(min-width: 768px)" srcSet="/img/hero/look-d.jpg" />
        <source type="image/avif" srcSet="/img/hero/look-m900.avif 900w, /img/hero/look-m1200.avif 1200w, /img/hero/look-m1800.avif 1800w" sizes="100vw" />
        <source type="image/webp" srcSet="/img/hero/look-m900.webp 900w, /img/hero/look-m1200.webp 1200w, /img/hero/look-m1800.webp 1800w" sizes="100vw" />
        <img
          src="/img/hero/look-m.jpg"
          alt="A model seated on a black block in the Italian Knit Ribbed Cardigan in cream and the Tailored Barrel Fit Trousers in black"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <div className="lk-scrim" aria-hidden="true" />

      <div className="lk-copy">
        <p className="lk-eyebrow">The autumn edit</p>
        <p className="lk-title">Soft knit, sharp tailoring.</p>
        <p className="lk-sub">An Italian ribbed cardigan and a tailored barrel trouser. Two pieces from the rail, one easy outfit.</p>
        <div className="lk-actions">
          <Cta />
        </div>
      </div>
      <Where />
    </div>
  );
}
