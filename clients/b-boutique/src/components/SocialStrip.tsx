import { socials } from "@/lib/nav";
import { SocialMark } from "@/components/SocialMark";

/* "Follow us" above the footer, as two tiles (2026-09-27, Brad picked B of
 * three 21st-ui-explore directions, after 21st.dev "Reveal on hover"): one
 * photograph per account, the whole tile the link.
 *
 * Both photographs are generated mood images (Higgsfield Soul 2.0). Neither
 * shows a piece she sells or is her post, so the section does not pose as a
 * feed. They are decoration inside the links (alt=""), so each link is
 * named by its account alone: the promenade in a cable knit for Instagram,
 * a black trouser suit against a brown wall for Facebook. */
const PHOTOS = { Instagram: "follow-casual", Facebook: "follow-suit" } as const;

export function SocialStrip() {
  const links = (["Instagram", "Facebook"] as const)
    .map((name) => ({ name, href: socials.find((s) => s.name === name)?.href }))
    .filter((l): l is { name: "Instagram" | "Facebook"; href: string } => Boolean(l.href));

  return (
    <section className="ss2" aria-labelledby="ss2-h">
      <p id="ss2-h" className="ss2-label">Follow us</p>
      <ul className="ss2-grid">
        {links.map((l) => {
          const img = PHOTOS[l.name];
          return (
            <li key={l.name}>
              <a className="ss2-tile" href={l.href} target="_blank" rel="noopener noreferrer">
                <picture>
                  <source type="image/avif" srcSet={`/img/look/${img}-800.avif 800w, /img/look/${img}-1200.avif 1200w`} sizes="(min-width: 1024px) 45vw, 46vw" />
                  <source type="image/webp" srcSet={`/img/look/${img}-800.webp 800w, /img/look/${img}-1200.webp 1200w`} sizes="(min-width: 1024px) 45vw, 46vw" />
                  <img className="ss2-media" src={`/img/look/${img}-1200.jpg`} alt="" width={1200} height={1500} loading="lazy" decoding="async" />
                </picture>
                <span className="ss2-cap">
                  <span className="ss2-mark" aria-hidden="true"><SocialMark name={l.name} /></span>
                  <span className="ss2-name">{l.name}</span>
                  <span className="ss2-go" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                </span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
