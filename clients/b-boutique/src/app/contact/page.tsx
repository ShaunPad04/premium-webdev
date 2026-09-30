import "@/app/offhome.css";
import type { Metadata } from "next";
import Link from "@/components/Link";
import { pageMeta } from "@/lib/site";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
import { Visit } from "@/components/Visit";
import { addressLines, openingPhrase, shop } from "@/lib/shop";
import { socials } from "@/lib/nav";

const instagram = socials.find((x) => x.name === "Instagram");

export const metadata: Metadata = pageMeta({
  path: "/contact",
  title: "Contact",
  description:
    /* Derived, for the same reason as the site description: this said
       "open Tuesday to Sunday" while the shop opened seven days. It also said
       "Call" long after phone numbers came off the site. */
    `Email B Boutique or send a message. ${addressLines.join(", ")}, open ${openingPhrase()}.`,
});

/* /contact — 2026-09-27, Brad picked A "Split panel" of three directions (B
 * three framed cards, C the email address set huge), after 21st.dev "Contact
 * Card", in the Shop by category's language: her letter-and-flowers photo as
 * a tall rounded panel with the title on it, the form beside, and the three
 * ways to reach the shop as pills above the form. Only confirmed details:
 * the email, Instagram, the address. No phone (the client's instruction).
 *
 * The form's copy deliberately does not promise where messages go: it has no
 * inbox until CONTACT_TO / CONTACT_FROM / RESEND_API_KEY are set, and it
 * reports failure plainly rather than faking a thank-you (locked decision 11). */
export default function ContactPage() {
  return (
    <>
      <Nav solid light />
      <main id="main" className="flex-1">
        <section className="ct" aria-labelledby="ct-title">
          <div className="ct-photo">
            <picture>
              <source media="(max-width: 767px)" type="image/avif" srcSet="/img/texture/contact-m.avif" />
              <source media="(max-width: 767px)" srcSet="/img/texture/contact-m.webp" />
              <source type="image/avif" srcSet="/img/texture/contact.avif" />
              <img src="/img/texture/contact.webp" alt="" fetchPriority="high" />
            </picture>
            <div className="ct-over">
              <span className="hs-tag">We reply by email</span>
              <h1 id="ct-title" className="ct-title">Get in touch</h1>
              <p className="ct-sub">
                Sizes, whether something is still in, or anything you would rather ask before making the trip.
              </p>
            </div>
          </div>

          <div>
            <ul className="ct-pills" aria-label="Other ways to reach the shop">
              <li>
                <a href={`mailto:${shop.email}`}>{shop.email}</a>
              </li>
              {instagram ? (
                <li>
                  <a href={instagram.href} target="_blank" rel="noopener noreferrer">
                    Instagram<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ) : null}
              <li>
                <a href="#visit">Visit the shop</a>
              </li>
            </ul>
            <h2 className="ct-h">Send a message</h2>
            <ContactForm />
            <p className="ct-small">
              We reply to the address you give and nothing else. Your details are used to answer you and are not added
              to a mailing list. See our <Link href="/privacy">privacy notice</Link>.
            </p>
          </div>
        </section>

        {/* No moving band between the form and Visit (2026-09-29, Brad: "dont
            have a marquee"). RibbonBand and its three versions are kept. */}
        <Visit />
      </main>
      <Footer />
    </>
  );
}
