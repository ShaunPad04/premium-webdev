import type { Metadata } from "next";
import Link from "next/link";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { PageMasthead } from "@/components/PageMasthead";
import { ClearBag } from "@/components/ClearBag";
import { shop } from "@/lib/shop";
import { checkoutStatusByReference, sumupIsConfigured } from "@/lib/sumup";
import { markPaid, releaseOrder } from "@/lib/orders";
import { confirmOrderToCustomer, notifyShopOfOrder } from "@/lib/mail";

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

  const title = paid ? "Thank you." : refused ? "Not paid." : "One moment.";

  const lede = paid
    ? "Your payment has gone through. Everything is picked by hand in the shop, so we will be in touch about getting it to you."
    : refused
      ? "SumUp tells us this payment did not go through, so nothing has been charged and nothing has been ordered. Your bag is still here if you would like to try again."
      : "We cannot confirm this payment yet. Nothing on this page means you have been charged — if you have, it will show on your statement, and the shop can check it against your reference.";

  return (
    <>
      <MotionLayer />
      <Nav />
      {/* Only on a confirmed payment. */}
      {paid ? <ClearBag /> : null}
      <main id="main" className="flex-1">
        <PageMasthead
          eyebrow="Checkout"
          title={title}
          lede={lede}
          aside={
            ref ? (
              <p className="pm-phone">
                <span className="pm-phone-label">Your reference</span>
                <span className="pm-phone-number">{ref}</span>
              </p>
            ) : null
          }
        />

        <section className="page-section" aria-labelledby="next">
          <div className="page-inner">
            <div className="page-head">
              <h2 id="next" className="page-h2">
                {paid ? "What happens next." : "What to do now."}
              </h2>
            </div>

            {paid ? (
              <p className="page-body">
                Orders go out in the order they arrive rather than
                automatically, because every piece is picked off the rail by
                hand. If anything in your bag has gone since you added it, we
                will ring you rather than substitute it.
              </p>
            ) : refused ? (
              <p className="page-body">
                Nothing was taken. Card payments are declined for ordinary
                reasons far more often than for alarming ones — a bank check, a
                daily limit, a mistyped digit. Your bag has not been emptied.
              </p>
            ) : (
              <p className="page-body">
                {configured
                  ? "The payment page may still be settling, or the connection to our payment provider dropped while we were checking. Either way we would rather say so than guess."
                  : "This shop is not connected to its payment provider yet, so no payment can have been taken."}{" "}
                Your bag has been left exactly as it was.
              </p>
            )}

            <p className="page-body">
              {/* "email … at", not "ring … on". This read "ring the shop on"
                  followed by an email address — left behind when phone
                  numbers came off the site on 2026-09-21 and the link was
                  swapped from tel: to mailto: without the verb. */}
              {paid ? "Any questions, email" : "Email"} the shop at{" "}
              <a href={`mailto:${shop.email}`} className="cf-fail-link">
                {shop.email}
              </a>
              {ref ? <> and quote {ref}.</> : "."}
            </p>

            <p className="page-body">
              <Link href={paid ? "/shop" : "/bag"} className="btn-solid">
                {paid ? "Back to the shop" : "Back to your bag"}{" "}
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
