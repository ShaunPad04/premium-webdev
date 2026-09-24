/* Customer reviews for the home page (2026-09-24, Brad: "even though there's
 * only three on Google ... just a static one").
 *
 * EMPTY ON PURPOSE. The shop has three real Google reviews, but their words
 * are not in this project yet: Google shows them only to a signed-in
 * browser, and a review is the one kind of copy that must never be written
 * for someone. Add each exactly as it appears on Google: the words, the name
 * as Google shows it, and the star rating she was given. The section renders
 * nothing until this list has an entry, so nothing is ever shown in place of
 * a real review.
 *
 * CLIENT INPUT REQUIRED: the three Google reviews (text, reviewer name as
 * shown, stars). No aggregate rating is marked up in JSON-LD from these:
 * three self-selected reviews on the shop's own site is not what that
 * schema is for, and Google treats it as self-serving. */
export type Review = {
  quote: string;
  name: string;
  /** The stars given on Google, 1 to 5. Omit if unknown; never guess. */
  stars?: 1 | 2 | 3 | 4 | 5;
  source: "Google";
};

export const reviews: Review[] = [];
