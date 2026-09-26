/* Customer reviews for the home page (2026-09-24, Brad: "even though there's
 * only three on Google ... just a static one").
 *
 * Only reviews copied from Google, exactly as they appear: the words, the
 * name as Google shows it, and the stars. A review is the one kind of copy
 * that must never be written for someone. The section renders nothing if
 * this list is empty. No aggregate rating is marked up in JSON-LD from these:
 * three self-selected reviews on the shop's own site is not what that
 * schema is for, and Google treats it as self-serving. */
export type Review = {
  /** The review's own words. Omitted for a star rating left with no text:
   *  the card then shows the stars and the name, and no words at all. */
  quote?: string;
  name: string;
  /** The stars given on Google, 1 to 5. Omit if unknown; never guess. */
  stars?: 1 | 2 | 3 | 4 | 5;
  source: "Google";
};

/* Copied from her Google Business listing on 2026-09-24 (a screenshot
   Brad sent of https://share.google/dtmJLWZtTxzgd5CqA), word for word,
   spelling included: a correction would put words in a customer's mouth.
   The third card was Sean T.'s rating-only review (5 stars, no text); on
   2026-09-26 Brad asked for Lily's newer review in its place, copied word
   for word from his screenshot of the listing, the closing "x" included. */
export const reviews: Review[] = [
  {
    quote: "Lovely selection of ladies clothing. Friendly and helpful. Great new premises on Seaview St. Cleethorpes",
    name: "Jacqueline Beatson",
    stars: 5,
    source: "Google",
  },
  {
    quote: "Nice affordable clothing for my mothers birthday, lovely staff absolute pleasure to be around would definetely recommend to everyone!",
    name: "Shaun J",
    stars: 5,
    source: "Google",
  },
  {
    quote: "Just bought a high quality quarter zip, lovely service x",
    name: "Lily",
    stars: 5,
    source: "Google",
  },
];

/* What Google shows at the top of the listing, as of 2026-09-24. Update it
   by hand when the listing changes; it is displayed, never marked up. */
export const googleSummary = {
  rating: "5.0",
  count: 3,
  href: "https://share.google/dtmJLWZtTxzgd5CqA",
} as const;
