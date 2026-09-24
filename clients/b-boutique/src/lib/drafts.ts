/* Drafted copy waiting for Hayley (2026-09-24).
 *
 * Anything written on her behalf but not yet confirmed renders on previews
 * and locally, marked as a draft, and is left out of the production build
 * automatically. So a draft cannot reach bboutiqueclee.com by being merged:
 * it has to be confirmed and moved out of the draft path. Server-side only;
 * pass the result to client components as a prop. */
export const showDrafts = process.env.VERCEL_ENV !== "production";
