import type { ReactNode } from "react";

/* The top of every page that is not the home page.
 *
 * The home page opens on a full-bleed photograph, and the header is drawn
 * straight onto it: transparent, white type, no bar. That header is fixed and
 * shared, so every other route has to give it something dark to sit on or the
 * navigation renders white-on-white for the first 72 pixels of the page.
 *
 * Hence a black band rather than, say, a white page with a heading. It is not
 * decoration — it is what makes the shared header legible, and it doubles as
 * the editorial opening the rest of the site has trained the reader to expect:
 * a number, a line of Bodoni, a short lede, a rule.
 *
 * Deliberately not a photograph. Five of these across the site would turn
 * every page into the same hero and cost a large image on each one; the home
 * page's photograph stays the only one of its kind. */
export function PageMasthead({
  eyebrow,
  title,
  lede,
  aside,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  /** Optional right-hand column — a fact, a phone number, a short list. */
  aside?: ReactNode;
}) {
  return (
    <section className="pm" aria-labelledby="pm-heading">
      <div className="pm-inner">
        <div className="pm-main">
          <p className="pm-eyebrow">{eyebrow}</p>
          {/* The page's h1. Every route needs exactly one, and on these pages
              it can be visible — unlike the home page, where the approved hero
              carries no type at all and its h1 is screen-reader only. */}
          <h1 id="pm-heading" className="pm-h1">
            {title}
          </h1>
          {lede ? <p className="pm-lede">{lede}</p> : null}
        </div>
        {aside ? <div className="pm-aside">{aside}</div> : null}
      </div>
    </section>
  );
}
