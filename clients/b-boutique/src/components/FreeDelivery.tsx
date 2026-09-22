"use client";

import {
  FREE_DELIVERY_OVER_P,
  awayFromFreeDelivery,
  formatPriceShort,
} from "@/lib/catalogue";

/* "You are £X away from free delivery."
 *
 * ── Why this one is allowed and "only 1 left" is not ────────────────────
 * This site refuses to print stock counts, because "only 1 left" is a
 * scarcity claim about a real business that pressures a purchase rather than
 * describing it. It would be easy to read this bar as the same trick and it
 * is not, for a reason worth writing down:
 *
 *   The threshold is a FACT ABOUT THE OFFER, not about the goods. £120 for
 *   free UK delivery is the client's own confirmed term (2026-09-20), it is
 *   already printed in the announcement bar, on the delivery page and in the
 *   bag, and a customer is entitled to rely on it. Telling somebody how far
 *   off it they are is arithmetic they could do themselves from figures the
 *   page already shows.
 *
 * Both numbers come from lib/catalogue.ts, which is where the bag and
 * /api/checkout read them, so the figure quoted here cannot drift from the
 * one charged.
 *
 * ── It never nags ───────────────────────────────────────────────────────
 * An empty basket gets nothing: telling somebody with no items that they are
 * £120 from free delivery is a sales pitch, not a service. Once the basket
 * qualifies it says so plainly and stops — no confetti, no countdown.
 */
export function FreeDelivery({ subtotalP }: { subtotalP: number }) {
  if (subtotalP <= 0) return null;

  const remaining = awayFromFreeDelivery(subtotalP);
  const qualified = remaining === 0;
  const pct = Math.min(100, Math.round((subtotalP / FREE_DELIVERY_OVER_P) * 100));

  return (
    <div className="fd" data-qualified={qualified ? "" : undefined}>
      <p className="fd-text" role="status">
        {qualified ? (
          <>
            <strong>Free UK delivery</strong> on this order.
          </>
        ) : (
          <>
            <strong>{formatPriceShort(remaining)}</strong> more for free UK
            delivery.
          </>
        )}
      </p>
      {/* The bar is decoration for the sentence above, which is why it is
          aria-hidden: a screen reader gets the words, which carry the whole
          meaning, rather than a progressbar reading out a percentage of a
          thing it cannot see. */}
      <div className="fd-track" aria-hidden="true">
        <span className="fd-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
