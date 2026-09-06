/** ⚠ TEMPORARY DEMO CONTENT — NOT CUSTOMER TESTIMONY ⚠
 *
 *  Every quote below is INVENTED. B Boutique has no reviews: the shop has not
 *  opened, nobody has written one, and none exist anywhere in this project.
 *  These were written to fill the section for a client demo, at the client's
 *  explicit request, and they are fiction.
 *
 *  They used to read REPLACE WITH GENUINE REVIEW in shouting caps, which made
 *  the demo look broken. Prose that reads naturally is what was asked for and
 *  is what is here — which makes this file MORE dangerous than the version it
 *  replaced, not less, because nothing about the words themselves signals that
 *  they are made up. Three things stand between them and being published as
 *  fact, and none of them may be removed casually:
 *
 *    1. `pending: true` on every entry. The component reads it and renders a
 *       visible on-screen marker. Delete it from an entry only when that entry
 *       is a real review with a real author.
 *    2. The site is noindex until ALLOW_INDEXING is set, so search engines
 *       cannot attach any of this to the real business. See layout.tsx.
 *    3. This comment.
 *
 *  The names are deliberately first-name-plus-initial and the sources are
 *  generic rather than "Google" or "Facebook": a fabricated review attributed
 *  to a named platform is a false statement about that platform as well as
 *  about the shop.
 *
 *  Ratings are deliberately absent. A star count is a numeric claim about what
 *  somebody scored; inventing one is the same class of error as inventing the
 *  sentence, and unlike the prose it would flow into any future aggregateRating
 *  markup. Add `rating` per entry when the real reviews arrive.
 *
 *  THIS SECTION IS NOT FIT TO SHIP until every entry is replaced. */
export type Testimonial = {
  quote: string;
  name: string;
  source: string;
  /** Star rating, 1-5. Absent means no rating is known — show no stars. */
  rating?: number;
  /** True while this is invented placeholder rather than a real review. */
  pending?: boolean;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "I went in for a birthday present and came out with a coat for myself. That is entirely their fault and I have no regrets.",
    name: "Hannah W.",
    source: "Temporary demo content",
    pending: true,
  },
  {
    quote:
      "They remembered what I bought in the spring and put something aside they thought would go with it. You do not get that online.",
    name: "Denise M.",
    source: "Temporary demo content",
    pending: true,
  },
  {
    quote:
      "Proper wool, proper linings, things that actually fit across the shoulders. Everything I own from here still looks new.",
    name: "Priya R.",
    source: "Temporary demo content",
    pending: true,
  },
  {
    quote:
      "I never feel rushed. She let me take three things away to try and told me honestly which one was right.",
    name: "Claire T.",
    source: "Temporary demo content",
    pending: true,
  },
  {
    quote:
      "Worth the drive from Grimsby. It is the only place near here where I do not see the same jacket on somebody else that week.",
    name: "Sofia B.",
    source: "Temporary demo content",
    pending: true,
  },
  {
    quote:
      "Small shop, big taste. I have stopped bothering with the retail parks.",
    name: "Nicola F.",
    source: "Temporary demo content",
    pending: true,
  },
];

/** The photographs beside the quotes. Deliberately the boutique's own room —
 *  rails, shelves, marble, brass — and never a portrait: a face next to a
 *  named quote reads as the person who said it, and there is no customer
 *  photography. Keep it that way when the real reviews land. */
export const testimonialShots: { slot: string; alt: string }[] = [
  {
    slot: "panel-all",
    alt: "A rail of womenswear against the boutique's black marble wall",
  },
  {
    slot: "panel-knitwear",
    alt: "Folded knitwear on a brass and smoked-glass shelf in the boutique",
  },
  {
    slot: "panel-trousers",
    alt: "Tailored trousers hanging on a polished brass rail in the boutique",
  },
];

/** True while any entry is still invented. The component uses this to show the
 *  on-screen marker, and it is the one thing to check before launch. */
export const testimonialsPending = testimonials.some((t) => t.pending);
