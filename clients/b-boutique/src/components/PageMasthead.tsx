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
 * ── 2026-09-22: it can carry a texture, and only a texture ──────────────
 * This used to end "Deliberately not a photograph. Five of these across the
 * site would turn every page into the same hero." The reasoning still holds
 * for PHOTOGRAPHS OF THINGS — a second full-bleed garment shot on every
 * category page would be the home page repeated seven times, and the client
 * has already said two images down the same edge reads as a template.
 *
 * What is allowed instead is a MATERIAL: an extreme macro of cloth, dark,
 * shallow, mostly shadow. It is not a second hero because it is not a picture
 * of anything — nobody looks at it, they read the word on top of it. It
 * solves the real complaint, which is that a flat black band under a big
 * serif is bland on a clothing site.
 *
 * ── Why a texture and not a rail of coats ──────────────────────────────
 * These images are generated. A generated shop interior or a generated rail
 * of garments on a real shop's category page implies it is HER shop and HER
 * rail, and this project has already been burned by generative work
 * inventing doorways and signage that the client spotted immediately. A
 * macro of knitted wool asserts nothing about anything: there is no stock
 * claim available in a photograph of a stitch.
 *
 * The prompts carry an explicit ban on people, hands, text, lettering, logos
 * and labels — gibberish typography and malformed hands are the two defects
 * this project has shipped before (see lib/images.ts on the `panel-*` set)
 * and both are excluded at the source rather than checked for afterwards.
 *
 * `texture` is optional. A page without one renders exactly as before. */
export function PageMasthead({
  eyebrow,
  title,
  lede,
  aside,
  texture,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  /** Optional right-hand column — a fact, a short list. */
  aside?: ReactNode;
  /** Basename in /img/texture, no extension. Decorative only. */
  texture?: string;
}) {
  return (
    <section
      className="pm"
      aria-labelledby="pm-heading"
      data-textured={texture ? "" : undefined}
    >
      {texture ? (
        /* aria-hidden and empty alt: it is a material, not information. A
           screen reader announcing "close-up of knitted wool" before the
           category name would be noise, and describing it any further would
           be narrating a generated image as though it were the stock. */
        <div aria-hidden="true" className="pm-texture">
          <picture>
            {/* Phones get the square phone crop (scripts/build-texture.mjs),
                not the 2000px frame they only ever showed a slice of. */}
            <source media="(max-width: 899px)" type="image/avif" srcSet={`/img/texture/${texture}-m.avif`} />
            <source media="(max-width: 899px)" type="image/webp" srcSet={`/img/texture/${texture}-m.webp`} />
            <source media="(max-width: 899px)" srcSet={`/img/texture/${texture}-m.jpg`} />
            <source type="image/avif" srcSet={`/img/texture/${texture}.avif`} />
            <source type="image/webp" srcSet={`/img/texture/${texture}.webp`} />
            {/* `fetchpriority="high"`, and it is read out of a trace rather
                than assumed.

                Lighthouse names this element as the LCP on /shop —
                `section.pm > div.pm-texture > picture > img` — and scored
                `lcp-discovery-insight` 0 for exactly one reason:
                "fetchpriority=high should be applied: false". The other two
                boxes were already ticked; it is discoverable in the initial
                document and it is not lazy.

                This is the ONE image on these pages that deserves it. Marking
                everything priority is how a preload queue ends up competing
                with itself, and on the HOME page the LCP is the header
                wordmark rather than a picture, which is why this sits on the
                masthead component and not in ProductPhoto. */}
            <img
              src={`/img/texture/${texture}.jpg`}
              alt=""
              decoding="async"
              fetchPriority="high"
            />
          </picture>
        </div>
      ) : null}
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
