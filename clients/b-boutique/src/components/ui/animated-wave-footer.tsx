import Link from "@/components/Link";
import { footerNav, socials } from "@/lib/nav";
import { shop, openingPhrase } from "@/lib/shop";
import { SocialMark } from "../SocialMark";
import { BackToTop } from "../BackToTop";
import { BMark } from "../BMark";
import { PaymentMarks } from "../PaymentMarks";

/* The site footer, centred (2026-09-27, Brad picked C of three
 * 21st-ui-explore directions, after 21st.dev "Animated Footer Section"; A a
 * black sign-off with the name huge across the foot, B the email address
 * set large). The B mark, the address and hours, one line of links, the
 * email and social marks, then the buying-online links, payments and
 * credit. About half the old height on a phone.
 *
 * Every fact comes from lib/shop.ts and lib/nav.ts. No phone (shop.phone is
 * empty at the client's request) and no newsletter form (there is no list
 * to send it to). Keeps `footer.wf` and `.wf-inner`, which the desktop
 * scroll reveal in globals.css hangs off. The file name is historical: the
 * waves went with this change. */
export default function Footer() {
  const links = [...footerNav[0].items, ...footerNav[1].items];
  const legal = footerNav[2];

  return (
    <footer className="ft wf fc">
      <div className="wf-inner fc-inner">
        <Link href="/" className="fc-logo-link" aria-label="B Boutique, home">
          <BMark className="fc-logo" />
        </Link>
        <p className="fc-where">
          <span>{shop.street}, {shop.town}</span>
          <span>Open {openingPhrase()}</span>
        </p>

        <nav aria-label="Site">
          <ul className="fc-links">
            {links.map((item) => (
              <li key={item.label}><Link href={item.href} className="fc-link">{item.label}</Link></li>
            ))}
          </ul>
        </nav>

        <ul className="fc-social" aria-label="Follow or email B Boutique">
          {shop.email ? (
            <li>
              <a href={`mailto:${shop.email}`} className="fc-social-btn">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="sr-only">Email {shop.email}</span>
              </a>
            </li>
          ) : null}
          {socials.map((s) => (
            <li key={s.name}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="fc-social-btn">
                <SocialMark name={s.name} />
                <span className="sr-only">{s.name} (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="fc-meta">
          {legal ? (
            <nav aria-label={legal.heading}>
              <ul className="fc-legal">
                {legal.items.map((item) => (
                  <li key={item.label}><Link href={item.href} className="fc-link">{item.label}</Link></li>
                ))}
              </ul>
            </nav>
          ) : null}
          <p>&copy; {new Date().getFullYear()} B Boutique</p>
          <PaymentMarks className="fc-pay" />
          <p>
            Made by{" "}
            <a href="https://blacklineagency.co.uk" target="_blank" rel="noopener noreferrer" className="fc-link">Black Line Agency</a>
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
