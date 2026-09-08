import type { Metadata } from "next";
import Link from "next/link";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { PageMasthead } from "@/components/PageMasthead";
import { ClearBag } from "@/components/ClearBag";
import { phoneDisplay, shop } from "@/lib/shop";
import { checkoutStatusByReference, sumupIsConfigured } from "@/lib/sumup";

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
              {paid ? "Any questions, ring" : "Ring"} the shop on{" "}
              <a href={`tel:${shop.phone}`} className="cf-fail-link">
                {phoneDisplay}
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
