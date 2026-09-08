import { footerNav, socials, directionsHref } from "@/lib/nav";
import { shop, addressLines } from "@/lib/shop";
import { GiantWordmark } from "./GiantWordmark";

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
 * Socials. `socials` is empty because no handles are held anywhere in this
 * project, and a guessed URL sends customers to somebody else's account. The
 * row renders itself the moment real ones exist.
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
            {shop.town}. Womenswear, accessories and homeware, chosen one piece
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

          {/* Renders only when real accounts exist. Nothing is invented and
              no platform homepage is linked as a stand-in. */}
          {socials.length > 0 ? (
            <nav aria-label="Follow" className="ft-rise" style={{ "--d": 3 } as React.CSSProperties}>
              <h2 className="ft-group">Follow</h2>
              <ul>
                {socials.map((s) => (
                  <li key={s.name}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="ft-link">
                      {s.name}
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
        {/* Delivery and Returns are real pages now and are linked from the
            nav columns above, where a customer looks for them, rather than
            from this meta row. Privacy and Terms still do not exist, so they
            are still not linked — a link to a 404 is worse than none. No
            builder credit either; nobody asked for one. */}
      </div>
    </footer>
  );
}
