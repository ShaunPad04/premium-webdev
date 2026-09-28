import type { Metadata } from "next";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ClearBag } from "@/components/ClearBag";
import { checkoutStatusByReference, sumupIsConfigured } from "@/lib/sumup";
import { markPaid, orderByReference, releaseOrder } from "@/lib/orders";
import { confirmOrderToCustomer, notifyShopOfOrder } from "@/lib/mail";
import { ResultCard } from "@/components/CheckoutResult";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

/* Where SumUp sends the customer back to (the checkout's `redirect_url`).
 *
 * ── The rule this page exists to keep ─────────────────────────────────────
 * Landing here means a browser followed a URL. Anybody can type it, and
 * anybody who abandons the payment page and presses Back can reach it by
 * accident. It is not proof that money moved, and this page must never say
 * that it is.
 *
 * So the page does not read the URL and congratulate the customer. It asks
 * SumUp, from the server, with our own key, for the status of the reference
 * we generated — see lib/sumup.ts, including why that is a query rather than
 * the webhook this originally promised. Three outcomes, three different
 * pages — paid, refused, and don't know — and the last two say so plainly and
 * give out the phone number rather than implying an order exists.
 *
 * The bag is emptied on PAID and on nothing else. Clearing it on an
 * abandoned payment would take a customer's basket away for changing their
 * mind at the card screen. */
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  const configured = sumupIsConfigured();
  const status = ref && configured ? await checkoutStatusByReference(ref) : null;

  const paid = status === "PAID";

  /* ── Settling the order ────────────────────────────────────────────────
   *
   * This is the moment the order stops being a held basket and becomes a
   * sale, and it is the only authoritative one available: SumUp publishes no
   * payment webhook, so nothing tells this shop a payment succeeded except
   * asking, which is what `checkoutStatusByReference` just did.
   *
   * ── Why side effects in a page render are safe HERE ────────────────────
   * Normally they are not — a render can happen more than once, and this URL
   * is one a customer can reload all afternoon. The guard is not a hope that
   * it renders once; it is `markPaid`, whose UPDATE carries
   * `WHERE status = 'pending'`. Postgres settles that atomically, so exactly
   * one caller is ever told `changed: true`, no matter how many render at
   * once. The emails hang off that flag rather than off the render.
   *
   * ── Stock is NOT touched here ──────────────────────────────────────────
   * The pieces came off the shelf when the order was created. Payment
   * confirms that reservation; it does not repeat it. Decrementing again
   * here would take two garments off the rail for one sale.
   *
   * ── A failed email is not a failed order ───────────────────────────────
   * `sendMail` returns false rather than throwing. A customer whose money has
   * gone through must never see an error page because an inbox was
   * unreachable, and the order is on her Orders screen either way — the email
   * is the nudge, the database is the record.
   */
  if (ref && paid) {
    try {
      const settled = await markPaid(ref);
      if (settled?.changed) {
        const [toShop, toCustomer] = await Promise.all([
          notifyShopOfOrder(settled.order),
          confirmOrderToCustomer(settled.order),
        ]);
        if (!toShop || !toCustomer) {
          console.error(
            `checkout: ${ref} paid but mail failed — shop:${toShop} customer:${toCustomer}`,
          );
        }
      }
    } catch (err) {
      /* Logged loudly and swallowed. The customer has paid; the sweep over
         stale pending orders will find this one and settle it. */
      console.error("checkout: could not settle paid order", ref, err);
    }
  }

  /* A refusal we were told about releases the garment straight away rather
     than waiting on the sweep. Idempotent, and it only touches an order that
     is still pending. */
  if (ref && (status === "FAILED" || status === "EXPIRED")) {
    await releaseOrder(ref, "failed", `payment ${status}`).catch((err) =>
      console.error("checkout: could not release refused order", ref, err),
    );
  }
  /* "We asked and were told it has not been paid" — a different thing from
     "we could not ask", and the customer is told which. Anything that is
     neither is the third case, handled by the else branches below. */
  const refused = status === "FAILED" || status === "EXPIRED";

  /* Click & collect orders get the shop's address instead of "we will be in
     touch about getting it to you". A lookup that fails says the posted
     version, which is still true of every order in spirit. */
  const collect = paid && ref
    ? (await orderByReference(ref).catch(() => null))?.method === "collect"
    : false;

  return (
    <>
      <Nav solid />
      {/* Only on a confirmed payment. */}
      {paid ? <ClearBag /> : null}
      <main id="main" className="flex-1">
        <ResultCard state={paid ? "paid" : refused ? "refused" : "unknown"} reference={ref} configured={configured} collect={collect} />
      </main>
      <Footer />
    </>
  );
}
