import type { NextRequest } from "next/server";

import { productBySlug } from "@/lib/catalogue";
import { listedTotal } from "@/lib/opening-stock";
import { availabilityForSlug, stockIsConfigured } from "@/lib/stock";
import { variantsFor } from "@/lib/variants";

/* The bag's own cap; nobody is ever offered more than this of one variant. */
const MAX_QTY = 6;

/* What is left of one piece — yes or no, never a number.
 *
 * ── Why this is a request and not part of the page ────────────────────────
 * `/shop/[slug]` is statically generated: twenty-six pages built once and
 * served from the edge, which is most of why this site is fast. Stock changes
 * every time she taps Sold, so it cannot be baked into them. Making the whole
 * product page dynamic to carry one boolean per size would trade the page's
 * speed for a fact that fits in a fetch.
 *
 * ── The three states, and why not two ─────────────────────────────────────
 *   in      — counted, at least one on the rail.
 *   out     — counted, none left. The size cannot be added to a bag.
 *   unknown — nobody has counted it. This is the state EVERY variant is in
 *             today, and it behaves exactly as the site did before stock
 *             existed: addable, with the shop ringing to confirm.
 *
 * A two-state version would have to call "never counted" either in stock or
 * out of stock, and both are statements about a real shop's rail that nobody
 * has made. Absent from this response means unknown, and the page says
 * nothing about it.
 *
 * ── No counts, ever ───────────────────────────────────────────────────────
 * "Only 1 left" is a scarcity claim, it falls under the same regulations as a
 * price, and it is arguably worse because it pressures the purchase rather
 * than describing it. The shop floor gets numbers. The shop front does not.
 *
 * ── Except one: how many can go in a bag (2026-09-25, Brad) ────────────────
 * The quantity picker allowed six of anything, including a size with one on
 * the rail. So each variant now carries `limits[id]`: the most one bag may
 * hold. It is the count where one exists, otherwise the master list's total
 * for that colour (no size can hold more than its colour does), capped at
 * the bag's six, so a count above six is never revealed. The page uses it to
 * stop the + button; it never prints it.
 *
 * ── This is a courtesy, not the gate ──────────────────────────────────────
 * Anything a browser is told, a browser can ignore. The real check is in
 * /api/checkout, server-side, immediately before the payment is created.
 */

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") ?? "";
  if (!productBySlug(slug)) {
    return Response.json({ ok: false, error: "Unknown piece." }, { status: 404 });
  }

  const product = productBySlug(slug)!;
  const limitsFrom = (counted: Record<string, { qty: number }>) =>
    Object.fromEntries(
      variantsFor(product).map((v) => {
        const n = counted[v.id]?.qty ?? listedTotal(slug, v.colour, v.size);
        return [v.id, n === null ? MAX_QTY : Math.max(0, Math.min(MAX_QTY, n))];
      }),
    );

  if (!stockIsConfigured()) {
    /* No database. Not an error and not "everything is sold out" — it is the
       shop as it was before stock existed, and the page carries on. */
    return Response.json({ ok: true, configured: false, variants: {}, limits: limitsFrom({}) });
  }

  try {
    const counted = (await availabilityForSlug(slug)) ?? {};
    /* The states go out without their numbers, as before. */
    const variants = Object.fromEntries(
      Object.entries(counted).map(([id, v]) => [id, { state: v.state, restockable: v.restockable }]),
    );
    return Response.json({ ok: true, configured: true, variants, limits: limitsFrom(counted) });
  } catch (err) {
    /* A database that is down must not close the shop. Log it, answer as if
       nothing is counted, and let the checkout — which cannot proceed without
       a real answer — be the one that refuses. */
    console.error("availability: query failed", err);
    return Response.json({ ok: true, configured: false, variants: {}, limits: limitsFrom({}) });
  }
}
