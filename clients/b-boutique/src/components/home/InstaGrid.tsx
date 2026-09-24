import { socials } from "@/lib/nav";
import { products } from "@/lib/catalogue";

/* "On Instagram" (2026-09-24, Brad). The site cannot show her real posts
 * without loading Instagram's scripts, which /privacy says the page never
 * does. So this is an Instagram-shaped grid of the shop's own photographs,
 * captioned as an invitation, and every tile goes to her real profile. It
 * does not claim these are her posts. */
const HANDLE = "@bboutiquecleethorpes";

export function InstaGrid() {
  const ig = socials.find((s) => s.name === "Instagram");
  if (!ig) return null;
  const tiles = [
    { src: "/img/about/rails-640", alt: "Rails inside the shop" },
    ...products.filter((p) => p.category !== "Homeware").slice(4, 7).map((p) => ({ src: `/img/product/${p.photo}-640`, alt: p.name })),
    { src: "/img/about/shopfront-640", alt: "The shopfront" },
    { src: "/img/product/bb-vase-tomato-640", alt: "Tomato Vase" },
  ];
  return (
    <section className="ig" aria-labelledby="ig-h">
      <div className="ig-head">
        <p className="ig-eyebrow">On Instagram</p>
        <h2 id="ig-h" className="ig-h">
          Follow the <em>rails.</em>
        </h2>
        <a href={ig.href} target="_blank" rel="noopener noreferrer" className="visit-cta ig-cta">
          <span className="roll"><span>Follow {HANDLE}</span></span> <span aria-hidden="true">&#8599;</span>
        </a>
      </div>
      <ul className="ig-grid">
        {tiles.map((t) => (
          <li key={t.src}>
            <a href={ig.href} target="_blank" rel="noopener noreferrer" className="ig-tile" aria-label={`${t.alt}, on Instagram (opens in a new tab)`}>
              <picture>
                <source type="image/avif" srcSet={`${t.src}.avif`} />
                <source type="image/webp" srcSet={`${t.src}.webp`} />
                <img src={`${t.src}.jpg`} alt="" loading="lazy" decoding="async" className="ig-img" />
              </picture>
              <span className="ig-over" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" /><circle cx="17.3" cy="6.7" r="1" fill="currentColor" /></svg>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
