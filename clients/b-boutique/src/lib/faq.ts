import { sizeSummary } from "./stocklist";
import { openingSummary, shop } from "./shop";

/** Questions for the homepage FAQ.
 *
 *  ─────────────────────────────────────────────────────────────────────────
 *  RULE: nothing in here may state a policy the client has confirmed nothing
 *  about — and where a temporary answer is written to fill the demo, it is
 *  marked `temporary: true` so it cannot be mistaken for a settled policy.
 *
 *  A returns window, a delivery charge or a gift-card term invented to fill a
 *  gap is not placeholder copy: published on a real shop's site it is a
 *  promise the shop then has to honour, and a customer who reads it is
 *  entitled to hold them to it. So an answer is one of two things:
 *
 *    - DERIVED, from confirmed data in this repository (the address and the
 *      opening hours both come out of shop.ts and cannot drift from the hours
 *      table further down the page). Safe to publish.
 *    - TEMPORARY, written for the client demo at their request, carrying
 *      `temporary: true`. The component renders one notice for the section
 *      while any of these remain. NOT safe to publish.
 *
 *  The previous version left every unconfirmed answer blank behind a
 *  CLIENT TO CONFIRM marker, which was safer still but made the section read
 *  as unfinished in a client demo. These read as finished, which is precisely
 *  why the flag and the notice matter more now, not less.
 *
 *  The questions themselves are the ones a clothing boutique actually gets:
 *  sizes, alterations, holding an item, gift cards, returns, whether you can
 *  buy online. They are not invented from nothing — they are the standard
 *  questions for this kind of shop — but every ANSWER to them below that is
 *  not derived from shop.ts is fiction until the client says otherwise.
 *  ─────────────────────────────────────────────────────────────────────────
 */
export type FaqItem = {
  q: string;
  /** The answer. Derived from confirmed data, or temporary — see `temporary`. */
  a: string;
  /** True while this answer is demo copy rather than confirmed policy. */
  temporary?: boolean;
};

export const faq: FaqItem[] = [
  {
    q: "Where is B Boutique?",
    /* Derived. The address lives in shop.ts and nowhere else, so this cannot
       disagree with Visit, the footer, the menu or the JSON-LD. */
    a: `${shop.street}, ${shop.town}, ${shop.postcode}.`,
  },
  {
    q: "What are your opening hours?",
    // Derived from the hours table. Never written out by hand.
    a: openingSummary(),
  },
  {
    q: "What sizes do you stock?",
    /* DERIVED, and no longer temporary. This read "Most pieces run from a
       size 8 to a size 18" until 2026-09-22 — written before anybody knew
       what the shop held, and false against her real stock: not one of the 32
       pieces offers an 18, and not one uses a numeric run at all. See
       `sizeSummary` in lib/stocklist.ts for why that is the most expensive
       sentence that was on this site. */
    a: sizeSummary(),
  },
  /* The next three were demo copy until 2026-09-22, when the client answered
     each one. Two of the three were WRONG: the demo offered an alterations
     service she does not run, and a two-day hold with no deposit where hers
     is four days with one. Both would have been promises made to customers
     in her name. */
  {
    q: "Do you offer alterations?",
    /* Her words: "I do not do alterations." */
    a: "No, we do not do alterations.",
  },
  {
    q: "Can you hold an item for me?",
    /* Her words: "Items are kept for 4 days with a deposit paid." The deposit
       amount was not given and is deliberately not stated — a number here
       would be a price, and nobody has named one. */
    a: "Yes. Items are kept for four days with a deposit paid.",
  },
  {
    q: "Do you sell gift cards?",
    /* Confirmed as written — she answered "Yes, that is right" with no
       correction. */
    a: "Yes, in any amount, and they can be used against anything in the shop. They are bought and redeemed in person.",
  },
  {
    q: "Can I return or exchange something?",
    /* ── This answer CONTRADICTED her own policy and is corrected ─────────
       It read: "Unworn pieces can be exchanged or credited within 14 days
       with your receipt. Sale items and earrings are the usual exceptions."

       Two of those are wrong against what the client confirmed on
       2026-09-20, and both in the direction that costs her:

         "Sale items and earrings are the usual exceptions" — she confirmed
         NO EXCLUSIONS. Publishing an exclusion the shop does not apply can
         talk a customer out of a return she is legally entitled to make,
         which is a consumer-rights problem and a bad look besides. It also
         directly contradicts /returns, two clicks away on the same site.

         "can be exchanged" — she confirmed NO EXCHANGES on online orders.
         Most pieces here are one of one, so there is usually nothing to
         exchange into; the shop refunds instead.

       Written from lib/policies.ts, which holds what she actually said, so
       the FAQ and the returns page can no longer disagree. No longer
       `temporary`, because it is no longer invented. */
    a:
      "Online, send it back for a refund within 14 days — there are no " +
      "exclusions, and the return postage is yours if you have simply " +
      "changed your mind. We do not do exchanges on online orders, because " +
      "most pieces are one of one and there is usually nothing to exchange " +
      "into. In the shop we will offer an exchange or a credit note as our " +
      "own goodwill. The returns page has it in full.",
  },
  {
    q: "Do you sell online?",
    /* Rewritten 2026-09-06, when the shop was built. This answer used to say
       "No", and it was correct then — there was no shop route, no basket and
       no checkout in the codebase, and an answer is a description of what
       exists. There is now, so it says so. Still not marked temporary: it
       describes the site rather than a policy nobody has confirmed. */
    a: "Yes. There is an online shop, and everything on it is a piece that is physically on the rail in Cleethorpes. Stock changes weekly, so what is listed is what is in — and if you would rather see something in person first, it is on the rail.",
  },
];

/** True while any answer is demo copy. The component uses this to show one
 *  notice for the section, and it is the one thing to check before launch. */
export const faqTemporary = faq.some((item) => item.temporary);
