import { socials } from "@/lib/nav";
import { SocialMark } from "@/components/SocialMark";

/* "Follow us" above the footer: FOLLOW US over two photographs, side by side
 * and edge to edge (2026-09-26, Brad: two images rather than the six-tile
 * grid and its film).
 *
 * Both are generated mood images (Higgsfield Soul 2.0): a tailored black
 * suit, and a cable knit and jeans on a seaside promenade, the dressed-up
 * and the everyday side of the shop. Neither shows a piece she sells, so
 * they link nowhere and their alt text says what they show, not a product
 * name. They are not her posts, so the section does not pose as a feed.
 *
 * 4:5, the product photographs' shape. On a desktop each is half the screen
 * wide, which at 4:5 would be taller than the screen, so there the tile's
 * height is capped and the photograph anchors near the top (heads first). */

type Photo = { img: string; alt: string };

const PHOTOS: Photo[] = [
  { img: "follow-suit", alt: "A woman in a tailored black trouser suit and white shirt against a warm plaster wall" },
  { img: "follow-casual", alt: "A woman in a cream cable-knit jumper and light jeans walking along a seaside promenade" },
];

export function SocialStrip() {
  const fb = socials.find((s) => s.name === "Facebook");

  return (
    <section className="ss" aria-label="Follow B Boutique">
      {fb ? (
        <div className="ss-head">
          <a className="ss-follow" href={fb.href} target="_blank" rel="noopener noreferrer">
            {/* A pill like "Ask us anything" (2026-09-27, Brad), inverted
                for the white ground: the footer's Facebook mark, the words
                and an arrow. The mark still lifts on hover. */}
            <span className="ss-follow-mark" aria-hidden="true">
              <SocialMark name="Facebook" />
            </span>
            <span className="ss-follow-text">Follow us</span>
            <span className="sr-only"> on Facebook (opens in a new tab)</span>
            <svg className="ss-follow-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </div>
      ) : null}
      <ul className="ss-grid ss-grid--two">
        {PHOTOS.map((p) => (
          <li key={p.img} className="ss-tile">
            <picture>
              <source type="image/avif" srcSet={`/img/look/${p.img}-800.avif 800w, /img/look/${p.img}-1200.avif 1200w, /img/look/${p.img}-1600.avif 1600w`} sizes="50vw" />
              <source type="image/webp" srcSet={`/img/look/${p.img}-800.webp 800w, /img/look/${p.img}-1200.webp 1200w, /img/look/${p.img}-1600.webp 1600w`} sizes="50vw" />
              <img className="ss-media" src={`/img/look/${p.img}-1200.jpg`} alt={p.alt} width={1200} height={1500} loading="lazy" decoding="async" />
            </picture>
          </li>
        ))}
      </ul>
    </section>
  );
}
