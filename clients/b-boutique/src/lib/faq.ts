import { formatHour, hours, shop } from "./shop";

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

/** Derived from `hours` rather than written out, so the answer cannot drift
 *  away from the hours table and the opening times further down the page. */
function openingSummary(): string {
  const open = hours.filter((d) => d.hours);
  const closed = hours.filter((d) => !d.hours);
  if (open.length === 0) return "";

  const first = open[0].hours!;
  const uniform = open.every(
    (d) => d.hours!.open === first.open && d.hours!.close === first.close,
  );
  const span =
    open.length > 1 && uniform
      ? `${open[0].day} to ${open[open.length - 1].day}`
      : open.map((d) => d.day).join(", ");
  const time = `${formatHour(first.open)} — ${formatHour(first.close)}`;
  const shut =
    closed.length === 0
      ? ""
      : ` Closed ${closed.map((d) => d.day).join(" and ")}.`;

  return uniform ? `${span}, ${time}.${shut}` : `${shut}`;
}

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
    a: "Most pieces run from a size 8 to a size 18, though it varies by label and by cut. If you are between sizes it is worth coming in — the fit differs more between brands than the number on the label suggests.",
    temporary: true,
  },
  {
    q: "Do you offer alterations?",
    a: "Yes, for pieces bought in the shop. Hems and simple adjustments are usually turned around within the week, and we will tell you honestly if a garment is not worth altering.",
    temporary: true,
  },
  {
    q: "Can you hold an item for me?",
    a: "We can put something aside for a couple of days while you think about it. Ask in the shop and we will keep it behind the counter with your name on it.",
    temporary: true,
  },
  {
    q: "Do you sell gift cards?",
    a: "Yes, in any amount, and they can be used against anything in the shop. They are bought and redeemed in person.",
    temporary: true,
  },
  {
    q: "Can I return or exchange something?",
    a: "Unworn pieces can be exchanged or credited within 14 days with your receipt. Sale items and earrings are the usual exceptions.",
    temporary: true,
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
