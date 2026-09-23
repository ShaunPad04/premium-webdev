import Link from "next/link";
import { RevealText } from "@/components/RevealText";

/* Homeware on the home page (rebuilt 2026-09-23).
 *
 * The client found the three-product collage cheap and cluttered: three
 * catalogue photographs at three sizes reads as a shelf, not a brand. It is
 * now one wide photograph with the words set over its dark side. The picture
 * is the Higgsfield ceramics still life from the /homeware masthead (atmosphere,
 * not her stock, so it is decorative and says nothing about what is for sale);
 * her actual pieces are one click away on /homeware.
 *
 * Wide screens get the 21:9 frame; phones get the square crop made for the
 * masthead (scripts/build-texture.mjs), so neither downloads the other. */
export function Homeware() {
  return (
    <section id="homeware" aria-labelledby="homeware-heading" className="hwb">
      <div className="hwb-media" aria-hidden="true">
        <picture>
          <source media="(max-width: 899px)" type="image/avif" srcSet="/img/texture/homeware-m.avif" />
          <source media="(max-width: 899px)" type="image/webp" srcSet="/img/texture/homeware-m.webp" />
          <source media="(max-width: 899px)" srcSet="/img/texture/homeware-m.jpg" />
          <source type="image/avif" srcSet="/img/texture/homeware.avif" />
          <source type="image/webp" srcSet="/img/texture/homeware.webp" />
          <img src="/img/texture/homeware.jpg" alt="" loading="lazy" decoding="async" />
        </picture>
      </div>

      <div className="hwb-copy">
        <p className="hwb-eyebrow">Homeware</p>
        <RevealText id="homeware-heading" className="hwb-h2">
          Things for the house, chosen the <em>same</em> way.
        </RevealText>
        <p className="hwb-body">
          Glazed ceramic, and things worth wrapping. A small shelf of it,
          chosen a piece at a time, like everything on the rails.
        </p>
        <Link href="/homeware" className="hero-cta hwb-cta">
          <span className="roll"><span>Explore homeware</span></span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
