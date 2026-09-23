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

  /* Restyled 2026-09-23 (Brad: the thin line read as generic). A quiet card:
     a delivery mark, the sentence, the running total against the threshold,
     and a track whose fill grows by transform and ends at a marker that
     turns into a tick once the order qualifies. */
  return (
    <div className="fd" data-qualified={qualified ? "" : undefined}>
      <div className="fd-head">
        <span className="fd-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M1.5 4.5h9v7.5h-9zM10.5 7.5h3.2l2.8 2.8V12h-6z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            <circle cx="4.5" cy="13.2" r="1.4" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="13" cy="13.2" r="1.4" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </span>
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
      </div>
      {/* The bar is decoration for the sentence above, which is why it is
          aria-hidden: a screen reader gets the words, which carry the whole
          meaning, rather than a progressbar reading out a percentage of a
          thing it cannot see. */}
      <div className="fd-bar" aria-hidden="true">
        <div className="fd-track">
          <span className="fd-fill" style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
        <span className="fd-goal">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5.2 4.1 7.2 8 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      <p className="fd-scale" aria-hidden="true">
        <span>{formatPriceShort(Math.min(subtotalP, FREE_DELIVERY_OVER_P))}</span>
        <span>{formatPriceShort(FREE_DELIVERY_OVER_P)}</span>
      </p>
    </div>
  );
}
