import { footerNav, socials, directionsHref } from "@/lib/nav";
import { shop, addressLines } from "@/lib/shop";
import { GiantWordmark } from "./GiantWordmark";

/* The two marks, as SVG paths — never an icon font and never an emoji.
 *
 * Each one is the platform's own glyph, which is the only mark a customer
 * recognises at 18px and the only one permitted for linking to that platform.
 * `aria-hidden` on the svg with the name in real text beside it: a screen
 * reader gets "Instagram", not "image". */
function SocialMark({ name }: { name: string }) {
  if (name === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.81-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.07.36-2.24.41-1.27.06-1.65.07-4.86.07s-3.59-.01-4.86-.07c-1.17-.06-1.82-.26-2.24-.42-.57-.22-.96-.48-1.38-.9-.42-.42-.69-.82-.9-1.38-.16-.42-.36-1.07-.42-2.24-.04-1.26-.06-1.65-.06-4.84s.02-3.59.06-4.86c.06-1.17.26-1.81.42-2.23.21-.57.48-.96.9-1.38.42-.42.81-.69 1.38-.9.42-.17 1.05-.36 2.22-.42 1.27-.05 1.65-.06 4.86-.06Zm0-2.16C8.74 0 8.33.02 7.05.07 5.78.13 4.91.33 4.14.63c-.79.31-1.46.72-2.13 1.38C1.35 2.68.94 3.35.63 4.14.33 4.9.13 5.78.07 7.05.02 8.33 0 8.74 0 12s.02 3.67.07 4.95c.06 1.28.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13.67.67 1.34 1.08 2.13 1.38.77.3 1.64.5 2.91.56 1.28.06 1.69.07 4.95.07s3.67-.02 4.95-.07c1.28-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.38.67-.67 1.08-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.02-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.38-2.13C21.32 1.35 20.65.94 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.02 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z" />
      </svg>
    );
  }
  if (name === "Facebook") {
    return (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
        <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
      </svg>
    );
  }
  return null;
}

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
