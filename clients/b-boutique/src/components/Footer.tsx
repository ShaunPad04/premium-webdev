import { footerNav, socials, directionsHref } from "@/lib/nav";
import { SocialMark } from "./SocialMark";
import { shop, addressLines } from "@/lib/shop";
import { GiantWordmark } from "./GiantWordmark";

/* SocialMark moved to its own file on 2026-09-21 so the corner menu can use
 * the same two glyphs. See SocialMark.tsx.
 *
 * (What follows was the note that lived here. Each one is the platform's own
 * glyph, which is the only mark a customer
 * recognises at 18px and the only one permitted for linking to that platform.
 * `aria-hidden` on the svg with the name in real text beside it: a screen
 * reader gets "Instagram", not "image". */

/* The closing page of the editorial.
 *
 * A server component apart from the wordmark's observer, so almost all of
 * this ships no JavaScript.
 *
 * ── What is deliberately NOT here ─────────────────────────────────────────
 * The newsletter. There is no handler, no action, no endpoint and no list
 * provider anywhere in this project — the field submitted to nothing. A form
 * that silently swallows an address is worse than no form: the visitor
 * believes they subscribed. It returns the day there is somewhere to send it.
 *
 * The map. Visit now owns the whole location experience one section above,
 * and a second map on the same screen is repetition, not service. The
 * MapPanel component that used to draw it here was deleted in the release
 * cleanup once nothing rendered it.
 *
 * Socials. The client has asked for Facebook and Instagram, and the whole row
 * is built for them — marks, layout, external-link handling. `socials` in
 * lib/nav.ts is still empty because no handles are held anywhere in this
 * project, and a guessed URL sends her customers to somebody else's account.
 * The row renders itself, icons and all, the moment real ones are added.
 *
 * Phone and email. Both empty in shop.ts, so neither is printed — not even as
 * a marker. The FAQ carries the internal note; a customer-facing footer is
 * not the place for one.
 *
 * The registered mark. There is no evidence anywhere in this project that
 * B Boutique holds a registered trademark, and ® is a legal claim, not a
 * decoration. It was inferred from a visual reference and is now removed. */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="ft">
      <div className="ft-top">
        <div className="ft-brand ft-rise">
          <p className="ft-name">B Boutique</p>
          {/* Genuine existing project copy — the same sentence the site's
              metadata description already uses. Not a new manifesto. */}
          <p className="ft-statement">
            An independent boutique on {shop.street.replace(/^\d+\s/, "")},{" "}
            {shop.town}. Womenswear and homeware, chosen one piece
            at a time.
          </p>

          <address className="ft-address">
            {addressLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>

          <a
            className="ft-directions"
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get directions <span aria-hidden="true">&#8599;</span>
          </a>
        </div>

        <div className="ft-nav">
          {footerNav.map((group, i) => (
            <nav
              key={group.heading}
              aria-label={group.heading}
              className="ft-rise"
              /* A place in the stagger, not a delay: these columns share a
                 top edge and are revealed by a scroll timeline, which ignores
                 animation-delay outright. globals.css turns --d into scroll
                 distance. */
              style={{ "--d": i + 1 } as React.CSSProperties}
            >
              <h2 className="ft-group">{group.heading}</h2>
              <ul>
                {group.items.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="ft-link">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Renders only when real accounts exist. Nothing is invented and no
              platform homepage is linked as a stand-in — see lib/nav.ts for
              why a plausible-looking handle is worse than no link at all. */}
          {socials.length > 0 ? (
            <nav aria-label="Follow" className="ft-rise" style={{ "--d": 4 } as React.CSSProperties}>
              <h2 className="ft-group">Follow</h2>
              <ul>
                {socials.map((s) => (
                  <li key={s.name}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ft-link ft-social"
                    >
                      <SocialMark name={s.name} />
                      <span>{s.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </div>

      {/* The payoff. aria-hidden because "B Boutique" is already the first
          thing in this footer as real text, and again in the header — a third
          announcement is noise to a screen reader and adds nothing. The brand
          is not hidden, only this decorative repetition of it. */}
      <div className="ft-wordmark" aria-hidden="true">
        <GiantWordmark>B Boutique</GiantWordmark>
      </div>

      <div className="ft-meta">
        <p>&copy; {year} B Boutique</p>
        {/* Our credit. An external link, so it carries rel="noopener
            noreferrer" alongside target="_blank" — the one rule this project
            applies to every outbound link without exception. Set quieter than
            the shop's own copyright: it is a signature, not a banner on
            somebody else's shop. */}
        <p className="ft-made">
          Made by{" "}
          <a
            href="https://blacklineagency.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="ft-made-link"
          >
            Black Line Agency
          </a>
        </p>
        {/* Delivery and Returns are real pages now and are linked from the
            nav columns above, where a customer looks for them, rather than
            from this meta row. Privacy and Terms still do not exist, so they
            are still not linked — a link to a 404 is worse than none. No
            builder credit either; nobody asked for one. */}
      </div>
    </footer>
  );
}
