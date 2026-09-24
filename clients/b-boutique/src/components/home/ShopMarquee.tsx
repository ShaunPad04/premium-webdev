/* An infinite marquee of her own shop photographs (2026-09-24, Brad). Real
 * photographs only (assets/about): the rails, the window, the back room, the
 * counter and the shopfront. CSS transform loop over two copies of the set;
 * pauses on hover, stops for reduced motion. Decorative in the sense that
 * nothing here is a control, so the second copy is hidden from assistive
 * technology and the first carries the alt text. */
const SHOTS = [
  { name: "rails", alt: "Rails of clothes inside B Boutique" },
  { name: "rail-window", alt: "The rail by the front window" },
  { name: "shopfront", alt: "The B Boutique shopfront on Sea View Street" },
  { name: "counter", alt: "The counter and homeware shelves" },
  { name: "back", alt: "The back of the shop" },
];

function Set({ hidden }: { hidden?: boolean }) {
  return (
    <ul className="smq-set" aria-hidden={hidden || undefined}>
      {SHOTS.map((s) => (
        <li key={s.name} className="smq-item">
          <picture>
            <source type="image/avif" srcSet={`/img/about/${s.name}-640.avif`} />
            <source type="image/webp" srcSet={`/img/about/${s.name}-640.webp`} />
            <img src={`/img/about/${s.name}-640.jpg`} alt={hidden ? "" : s.alt} loading="lazy" decoding="async" className="smq-img" />
          </picture>
        </li>
      ))}
    </ul>
  );
}

export function ShopMarquee() {
  return (
    <section className="smq" aria-label="Inside the shop">
      <div className="smq-track">
        <Set />
        <Set hidden />
      </div>
    </section>
  );
}
