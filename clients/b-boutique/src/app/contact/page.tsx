import type { Metadata } from "next";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { PageMasthead } from "@/components/PageMasthead";
import { ContactForm } from "@/components/ContactForm";
import { Visit } from "@/components/Visit";
import { phoneDisplay, shop } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Call B Boutique or send a message. 18 Sea View Street, Cleethorpes, DN35 8EZ — open Tuesday to Sunday.",
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
  const tel = shop.phone.replace(/\s+/g, "");

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
          lede="The quickest way to reach the shop is to ring it. If it is easier to write, there is a form below."
          aside={
            shop.phone ? (
              <p className="pm-phone">
                <span className="pm-phone-label">Call the shop</span>
                <a href={`tel:${tel}`} className="pm-phone-number">
                  {phoneDisplay}
                </a>
              </p>
            ) : null
          }
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
              <ContactForm />
            </div>
          </div>
        </section>

        <Visit />
      </main>
      <Footer />
    </>
  );
}
