import type { Metadata } from "next";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { PageMasthead } from "@/components/PageMasthead";
import { ContactForm } from "@/components/ContactForm";
import { PathBand } from "@/components/PathBand";
import { Visit } from "@/components/Visit";
import { addressLines, openingPhrase, shop } from "@/lib/shop";

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
        texture="plaster"
        />

        <section aria-labelledby="contact-form-h" className="page-section">
          <div className="page-inner contact-grid">
            <div className="contact-copy">
              <h2 id="contact-form-h" className="page-h2">
                Send a message.
              </h2>
              <p className="page-body">
                Sizes, whether something is still in, or anything you would
                rather ask before making the trip — write it here and we will
                come back to you.
              </p>
              <p className="page-body-small">
                We reply to the address you give and nothing else. Your details
                are used to answer you and are not added to a mailing list.
              </p>
            </div>

            <div className="contact-form-col">
              <div className="cf-tray">
                <ContactForm />
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
