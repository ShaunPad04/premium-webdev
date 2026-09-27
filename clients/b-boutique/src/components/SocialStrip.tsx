import { socials } from "@/lib/nav";
import { SocialMark } from "@/components/SocialMark";

/* "Follow us" above the footer. The photograph is a generated mood image
 * (Higgsfield Soul 2.0), a cable knit and jeans on a seaside promenade. It
 * shows no piece she sells, so it links nowhere and its alt text says what
 * it shows. It is not her post, so the section does not pose as a feed.
 *
 * Full-bleed since 2026-09-27 (Brad picked it for phones, then for
   desktop too, with the label and pills centred at the foot): the promenade
   photograph fills the section and the two accounts sit on it as compact black
   pills, each with its mark and its name. */
const PHOTO = { img: "follow-casual", alt: "A woman in a cream cable-knit jumper and light jeans walking along a seaside promenade" };

export function SocialStrip() {
  const links = (["Instagram", "Facebook"] as const)
    .map((name) => socials.find((s) => s.name === name))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <section className="ss2" aria-labelledby="ss2-h">
      <picture>
        <source type="image/avif" srcSet={`/img/look/${PHOTO.img}-800.avif 800w, /img/look/${PHOTO.img}-1200.avif 1200w, /img/look/${PHOTO.img}-1600.avif 1600w`} sizes="100vw" />
        <source type="image/webp" srcSet={`/img/look/${PHOTO.img}-800.webp 800w, /img/look/${PHOTO.img}-1200.webp 1200w, /img/look/${PHOTO.img}-1600.webp 1600w`} sizes="100vw" />
        <img className="ss2-media" src={`/img/look/${PHOTO.img}-1200.jpg`} alt={PHOTO.alt} width={1200} height={1500} loading="lazy" decoding="async" />
      </picture>
      <div className="ss2-body">
        <p id="ss2-h" className="ss2-label">Follow us</p>
        <ul className="ss2-links">
          {links.map((l) => (
            <li key={l.name}>
              <a className="ss2-pill" href={l.href} target="_blank" rel="noopener noreferrer">
                <span className="ss2-mark" aria-hidden="true"><SocialMark name={l.name} /></span>
                <span className="ss2-name">{l.name}</span>
                <span className="sr-only"> (opens in a new tab)</span>
                <svg className="ss2-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
