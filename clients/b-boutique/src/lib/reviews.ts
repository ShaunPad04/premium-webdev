/* Customer reviews for the home page carousel (2026-09-24).
 *
 * EMPTY ON PURPOSE. The shop has real reviews (three, per the client in
 * September) but their words are not in this project, and a review is the
 * one kind of copy that must never be written for someone. Add each one
 * exactly as it appears where it was left, with where it came from. The
 * section renders nothing until this list has at least two entries.
 * CLIENT INPUT REQUIRED: Hayley to supply the reviews (text, first name or
 * initial as shown, and source: Google, Facebook). */
export type Review = { quote: string; name: string; source: "Google" | "Facebook" | "In person" };

export const reviews: Review[] = [];
