import { FaqSection } from "@/components/ui/faq-section";
import { faq, faqTemporary } from "@/lib/faq";
import { shop } from "@/lib/shop";

/* The practical questions.
 *
 * This file is only the data. The section itself is the supplied FaqSection
 * component, vendored into components/ui and adapted to this project's type,
 * colour and motion — every deviation from the original is recorded in that
 * file's header, including the one that matters: the answers stay in the
 * HTML whether or not their row is open.
 *
 * Still a server component. Only the row that has to toggle is a client one.
 *
 * ── Honesty ───────────────────────────────────────────────────────────────
 * Two of these answers are derived from confirmed data — the address and the
 * opening hours both come out of shop.ts and cannot drift from the hours
 * table further down the page. The other six are demo copy written for the
 * client, and `faqTemporary` drives one notice covering the section for as
 * long as any of them remain. See the rule at the top of lib/faq.ts: a
 * returns window or a delivery charge invented to fill a gap is not
 * placeholder text on a real shop's site, it is a promise a customer can
 * hold them to.
 *
 * ── The contact block ─────────────────────────────────────────────────────
 * Both details are client-confirmed and both live in shop.ts: the phone on
 * 2026-09-06, the email on 2026-09-20 with an explicit request that it be
 * shown rather than kept behind the form. Nothing here is invented, and the
 * `tel:` link is built from the raw digits while the visible number is
 * grouped for reading.
 *
 * The supplied component's wording for this block was "Still have questions?
 * / We're here to help you / Contact Support", which is a software support
 * desk. This is a shop with a phone on the counter, so it says so. */
export function Faq() {
  return (
    <FaqSection
      id="faq"
      eyebrow="Questions"
      title="A few things worth knowing."
      description="Everything you might want to know before visiting."
      notice={
        faqTemporary
          ? "[Some answers below are placeholder copy for this demo — not confirmed shop policy]"
          : undefined
      }
      items={faq.map((item) => ({ question: item.q, answer: item.a }))}
      /* The first row opens on arrival. An index whose first answer is shut
         is a section that says nothing until it is clicked — and with
         JavaScript off it is the only one that opens at all. */
      defaultOpen={0}
      contactInfo={{
        title: "Anything we have not covered?",
        /* Email only since 2026-09-21 — the client asked for phone numbers
           to come off the site, so the primary action here is the address
           rather than a number. The copy changed with it: "ring the shop
           and someone will actually pick up" is a promise the site can no
           longer keep. */
        description:
          "Send an email and we will come back to you, or come into the shop and ask.",
        buttonText: shop.email,
        href: `mailto:${shop.email}`,
      }}
    />
  );
}
