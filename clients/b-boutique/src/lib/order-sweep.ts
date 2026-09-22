import "server-only";

import { markPaid, releaseOrder, stalePendingOrders } from "./orders";
import { confirmOrderToCustomer, notifyShopOfOrder } from "./mail";
import { checkoutStatusByReference, sumupIsConfigured } from "./sumup";

/* Settling the orders nobody came back for.
 *
 * ── The hole this fills ──────────────────────────────────────────────────
 * An order is confirmed when the customer lands back on /checkout/success and
 * that page asks SumUp. Most do. Some pay and close the tab, lose signal in
 * the SCA redirect, or wander off — and for those, nothing would ever ask.
 *
 * Two things go wrong when nobody asks:
 *
 *   A REAL SALE IS NEVER SEEN. Money has moved, the shop has no email, no
 *   order on her screen and no idea anyone bought anything.
 *   A GARMENT STAYS OFF THE SHELF. The reservation taken at checkout is
 *   never released, so a one-off coat nobody bought is unsellable forever.
 *
 * ── Why it is safe to run often ──────────────────────────────────────────
 * Every write it makes is conditional on the order still being `pending`, in
 * SQL, so two sweeps running at once settle an order once between them. The
 * emails hang off that same flag, so nobody gets told twice.
 *
 * ── Why "we could not find out" does nothing ─────────────────────────────
 * A lookup that fails, or a status that is neither paid nor refused, leaves
 * the order pending and the garment held. Releasing on an unknown answer
 * would put a piece back on the shelf that somebody has already paid for,
 * which is the one outcome worse than holding it too long.
 */

export type SweepResult = {
  looked: number;
  paid: number;
  released: number;
  unknown: number;
};

export async function sweepStaleOrders(olderThanMinutes = 30): Promise<SweepResult | null> {
  if (!sumupIsConfigured()) return null;

  const stale = await stalePendingOrders(olderThanMinutes);
  if (!stale) return null;

  const result: SweepResult = { looked: stale.length, paid: 0, released: 0, unknown: 0 };

  for (const order of stale) {
    let status: string | null = null;
    try {
      status = await checkoutStatusByReference(order.reference);
    } catch (err) {
      console.error("sweep: could not ask about", order.reference, err);
    }

    if (status === "PAID") {
      const settled = await markPaid(order.reference);
      if (settled?.changed) {
        result.paid += 1;
        /* The customer paid and never saw the confirmation page, so this is
           the first anybody hears of it — both emails matter more here than
           on the happy path, not less. */
        const [toShop, toCustomer] = await Promise.all([
          notifyShopOfOrder(settled.order),
          confirmOrderToCustomer(settled.order),
        ]);
        if (!toShop || !toCustomer) {
          console.error(
            `sweep: ${order.reference} settled but mail failed — shop:${toShop} customer:${toCustomer}`,
          );
        }
      }
      continue;
    }

    if (status === "FAILED" || status === "EXPIRED") {
      await releaseOrder(order.reference, "released", `swept: payment ${status}`);
      result.released += 1;
      continue;
    }

    /* PENDING at the provider, or we could not ask. Left alone on purpose —
       see the note above. */
    result.unknown += 1;
  }

  return result;
}
