import Link from "next/link";
import { footerNav, socials, directionsHref } from "@/lib/nav";
import { shop, addressLines, openingPhrase } from "@/lib/shop";
import { SocialMark } from "../SocialMark";
import { BackToTop } from "../BackToTop";

/* The 21st.dev "Animated Wave Footer", adapted (2026-09-23, Brad).
 *
 * Kept from the original: the four-column grid, the slow drifting waves
 * behind it, the round social buttons and the ruled copyright row.
 *
 * Changed from the original, each for a reason:
 * - Every fact comes from lib/shop.ts and lib/nav.ts. The original ships
 *   "123 Innovation Street", a (123) phone number, hello@example.com and
 *   four social links to "#"; none of that can go on a real shop's site.
 *   The phone stays off at the client's request (shop.phone is empty).
 * - No newsletter form. There is no mailing list to send it to, and a form
 *   that reports success while sending nowhere is worse than no form. The
 *   first column carries the visit invitation the old footer had instead.
 * - No shadcn Button/Input/Label, no lucide-react, no radix: the site has
 *   no shadcn theme tokens (bg-primary would resolve to nothing) and its
 *   buttons and icons already exist. Nothing is installed for this.
 * - A server component. The waves are CSS transform animations, so the
 *   footer ships no JavaScript beyond BackToTop.
 * - The wave SVG is two copies of the curve side by side, so translating
 *   it by -50% loops without the jump the original has at the seam. */

const WAVE_A = "M0 250C200 150 400 50 600 100C800 150 1000 350 1200 300C1400 250 1600 150 1800 250V500H0V250Z";
const WAVE_B = "M0 250C200 200 400 100 600 150C800 200 1000 350 1200 300C1400 250 1600 200 1800 250V500H0V250Z";

function Wave({ d, className }: { d: string; className: string }) {
  return (
    <div className={`wf-wave ${className}`}>
      <svg viewBox="0 0 3600 500" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d={d} fill="currentColor" />
        <path d={d} fill="currentColor" transform="translate(1800 0)" />
      </svg>
    </div>
  );
}

export default function AnimatedWaveFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="ft wf">
      <div className="wf-waves" aria-hidden="true">
        <Wave d={WAVE_A} className="wf-wave--a" />
        <Wave d={WAVE_B} className="wf-wave--b" />
      </div>

      <div className="wf-inner">
        <div className="wf-grid">
          <div className="wf-col wf-lead">
            <p className="wf-eyebrow">{shop.street}, {shop.town}</p>
            <h2 className="wf-h">
              Come and see it <em>on the rail.</em>
            </h2>
            <p className="wf-hours">Open {openingPhrase()}.</p>
            <div className="wf-acts">
              <Link href="/shop" className="hero-cta ft-cta-shop">
                <span className="roll"><span>Shop the rails</span></span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="visit-cta ft-cta-dir">
                <span className="roll"><span>Get directions</span></span> <span aria-hidden="true">&#8599;&#xFE0E;</span>
              </a>
            </div>
          </div>

          {footerNav.slice(0, 2).map((group) => (
            <nav key={group.heading} aria-label={group.heading} className="wf-col">
              <h2 className="wf-group">{group.heading}</h2>
              <ul className="wf-links">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="wf-link">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="wf-col">
            <h2 className="wf-group">Visit</h2>
            <address className="wf-address">
              {addressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
            <a href={`mailto:${shop.email}`} className="wf-link wf-email">{shop.email}</a>

            {socials.length > 0 ? (
              <ul className="wf-social" aria-label="Follow B Boutique">
                {socials.map((s) => (
                  <li key={s.name}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="wf-social-btn">
                      <SocialMark name={s.name} />
                      <span className="sr-only">{s.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {footerNav[2] ? (
          <nav aria-label={footerNav[2].heading} className="wf-legal">
            <ul>
              {footerNav[2].items.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="wf-link">{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <div className="wf-meta">
          <p>&copy; {year} B Boutique</p>
          <p className="ft-made">
            Made by{" "}
            <a href="https://blacklineagency.co.uk" target="_blank" rel="noopener noreferrer" className="ft-made-link">
              Black Line Agency
            </a>
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
