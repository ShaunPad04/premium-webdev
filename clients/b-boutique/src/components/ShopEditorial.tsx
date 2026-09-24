import { philosophy } from "@/lib/about";

/* A break in the shop grid every twelve pieces (2026-09-24, Brad), so a long
 * scroll reads as a shop window rather than a spreadsheet. Two kinds, in
 * turn: her own photograph of the shop, and the shop's own line set as a
 * pull quote. Both decorative to the grid's purpose; the photographs are real
 * (assets/about) and the quote is the site's philosophy line, unattributed. */
const PHOTOS = [
  { name: "rail-window", alt: "The rails by the front window at B Boutique" },
  { name: "counter", alt: "The counter at B Boutique" },
  { name: "back", alt: "The back of the shop at B Boutique" },
];

export function ShopEditorial({ n }: { n: number }) {
  if (n % 2 === 1) {
    return (
      <figure className="se se--quote">
        <blockquote className="se-q">{philosophy.statement}</blockquote>
        <figcaption className="se-c">B Boutique, Cleethorpes</figcaption>
      </figure>
    );
  }
  const ph = PHOTOS[(n / 2) % PHOTOS.length];
  return (
    <figure className="se se--photo">
      <picture>
        <source type="image/avif" srcSet={`/img/about/${ph.name}-960.avif 960w, /img/about/${ph.name}-1440.avif 1440w`} sizes="100vw" />
        <source type="image/webp" srcSet={`/img/about/${ph.name}-960.webp 960w, /img/about/${ph.name}-1440.webp 1440w`} sizes="100vw" />
        <img src={`/img/about/${ph.name}-960.jpg`} alt={ph.alt} loading="lazy" decoding="async" className="se-img" />
      </picture>
      <figcaption className="se-cap">Everything here is on the rail at 18 Sea View Street.</figcaption>
    </figure>
  );
}
