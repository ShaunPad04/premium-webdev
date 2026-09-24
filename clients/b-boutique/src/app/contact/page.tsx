import type { Metadata } from "next";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { PageMasthead } from "@/components/PageMasthead";
import { showDrafts } from "@/lib/drafts";
import { ContactForm } from "@/components/ContactForm";
import { PathBand } from "@/components/PathBand";
import { Visit } from "@/components/Visit";
import { addressLines, openingPhrase, shop } from "@/lib/shop";
import { socials } from "@/lib/nav";
import { RevealText } from "@/components/RevealText";

const instagram = socials.find((x) => x.name === "Instagram");

export const metadata: Metadata = {
  title: "Contact",
  description:
    /* Derived, for the same reason as the site description: this said
       "open Tuesday to Sunday" while the shop opened seven days. */
    `Call B Boutique or send a message. ${addressLines.join(", ")} — open ${openingPhrase()}.`,
  alternates: { canonical: "/contact" },
};

/* /contact.
 *
 * The phone number is the primary channel and is placed first, because it is
 * the one that definitely works: it was confirmed by the client on 2026-09-06
 * and a phone rings whether or not anybody has wired up an inbox.
 *
 * The form is second, and it is honest about its own state — see ContactForm
 * and app/api/contact/route.ts. Until CONTACT_TO, CONTACT_FROM and
 * RESEND_API_KEY exist in the environment, submitting it produces a plainly
 * worded failure and the phone number rather than a false thank-you. That is
 * a launch blocker by design.
 *
 * No email address is printed anywhere on this page. shop.email is empty and
 * nothing may be guessed into it. */
export default function ContactPage() {

  return (
    <>
      <MotionLayer />
      <Nav />
      <main id="main" className="flex-1">
        <PageMasthead
          eyebrow="Get in touch"
          title="Contact."
          /* Deliberately does not promise where the form goes. It has no
             inbox configured yet, and a masthead claiming otherwise would be
             the exact thing the form itself is built not to do. */
          lede="Email the shop, or come in and ask. If it is easier to write, there is a form below."
          aside={
            /* Was the phone number until 2026-09-21, when the client asked
               for numbers to come off the site. Email is now the only route,
               which is why it is promoted to the masthead rather than left
               to the form below it. */
            shop.email ? (
              <p className="pm-phone">
                <span className="pm-phone-label">Email the shop</span>
                <a href={`mailto:${shop.email}`} className="pm-phone-number pm-phone-number--email">
                  {shop.email}
                </a>
              </p>
            ) : null
          }
        texture="contact"
        />

        {/* One card, two panes (2026-09-23; layout after the "Contact
            Card" on 21st.dev, the client's pick): how to reach the shop on
            the left, the message on the right. Only confirmed details: the
            shop's email, its Instagram and its address. The phone number came
            off the site at the client's instruction and stays off. */}
        <section aria-labelledby="contact-form-h" className="page-section">
          <div className="page-inner">
            <div className="ccard">
              <div className="ccard-info">
                <p className="ccard-eyebrow">Get in touch</p>
                <RevealText id="contact-form-h" className="ccard-h">
                  Send a <em>message.</em>
                </RevealText>
                <p className="ccard-lede">
                  Sizes, whether something is still in, or anything you would
                  rather ask before making the trip. Write it here and we will
                  come back to you.
                </p>

                <ul className="ccard-tiles">
                  <li className="ccard-tile">
                    <span className="ccard-icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="5.5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M3.5 7l8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
                    </span>
                    <span className="ccard-tile-label">Email</span>
                    <a className="ccard-tile-value" href={`mailto:${shop.email}`}>
                      {/* If it has to wrap on a small phone, at the @. */}
                      {shop.email.split("@")[0]}<wbr />@{shop.email.split("@")[1]}
                    </a>
                  </li>
                  {instagram ? (
                    <li className="ccard-tile">
                      <span className="ccard-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" /></svg>
                      </span>
                      <span className="ccard-tile-label">Instagram</span>
                      <a className="ccard-tile-value" href={instagram.href} target="_blank" rel="noopener noreferrer">
                        @bboutique<wbr />cleethorpes
                      </a>
                      {/* Instagram's own direct-message link (2026-09-24,
                          Brad: WhatsApp/Instagram). No phone number: the
                          client asked for numbers to stay off the site. */}
                      <a className="ccard-dm" href="https://ig.me/m/bboutiquecleethorpes" target="_blank" rel="noopener noreferrer">
                        Message us on Instagram <span aria-hidden="true">&#8599;</span>
                      </a>
                    </li>
                  ) : null}
                  <li className="ccard-tile">
                    <span className="ccard-icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><circle cx="12" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.5" /></svg>
                    </span>
                    <span className="ccard-tile-label">The shop</span>
                    <a className="ccard-tile-value" href="#visit">{addressLines.join(", ")}</a>
                  </li>
                </ul>

                <p className="ccard-small">
                  We reply to the address you give and nothing else. Your
                  details are used to answer you and are not added to a mailing
                  list.
                </p>
              </div>

              <div className="ccard-form">
                <ContactForm replyNote={showDrafts ? "We usually reply the same day." : undefined} />
              </div>
            </div>
          </div>
        </section>

        <PathBand />

        <Visit />
      </main>
      <Footer />
    </>
  );
}
