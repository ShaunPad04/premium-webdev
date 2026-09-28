import Link from "@/components/Link";

import { openingPhrase, shop } from "@/lib/shop";

export type CheckoutState = "paid" | "refused" | "unknown";

/* The words for /checkout/success, one place for all three outcomes. The
   page decides the state (it asks SumUp; it never trusts the URL); this only
   says it. Nothing here shows an amount or a barcode: the page knows the
   reference and the status, and says nothing it cannot back. */
export function checkoutCopy(state: CheckoutState, configured: boolean, collect = false) {
  /* Click & collect (2026-09-28): the same card, saying where to come. */
  if (state === "paid" && collect)
    return {
      title: "Thank you.",
      lede: `Your payment has gone through. Your order is set aside for you at ${shop.street}, ${shop.town}, ready the same day during opening hours.`,
      status: "Paid, to collect",
      nextH: "Collecting it",
      next: `Come to ${shop.street}, ${shop.town} ${shop.postcode}, open ${openingPhrase()}, and give your name or the reference below. If anything in your order has gone since you added it, we will refund it straight away and get in touch, rather than substitute it.`,
      cta: { href: "/clothing", label: "Back to the shop" },
    };
  if (state === "paid")
    return {
      title: "Thank you.",
      lede: "Your payment has gone through. Everything is picked by hand in the shop, so we will be in touch about getting it to you.",
      status: "Paid",
      nextH: "What happens next",
      next: "Orders go out in the order they arrive, because every piece is picked off the rail by hand. If anything in your bag has gone since you added it, we will refund it straight away and get in touch, rather than substitute it.",
      cta: { href: "/clothing", label: "Back to the shop" },
    };
  if (state === "refused")
    return {
      title: "Not paid.",
      lede: "SumUp tells us this payment did not go through, so nothing has been charged and nothing has been ordered.",
      status: "Not paid",
      nextH: "What to do now",
      next: "Card payments are declined for ordinary reasons far more often than for alarming ones: a bank check, a daily limit, a mistyped digit. Your bag has not been emptied.",
      cta: { href: "/bag", label: "Back to your bag" },
    };
  return {
    title: "One moment.",
    lede: "We cannot confirm this payment yet. Nothing on this page means you have been charged. If you have, it will show on your statement, and the shop can check it against your reference.",
    status: "Not confirmed yet",
    nextH: "What to do now",
    next: `${
      configured
        ? "The payment page may still be settling, or the connection to our payment provider dropped while we were checking. Either way we would rather say so than guess."
        : "This shop is not connected to its payment provider yet, so no payment can have been taken."
    } Your bag has been left exactly as it was.`,
    cta: { href: "/bag", label: "Back to your bag" },
  };
}

const Icon = ({ state }: { state: CheckoutState }) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    {state === "paid" ? <path d="m8 12.5 2.8 2.8L16.5 9.5" /> : state === "refused" ? <path d="m9 9 6 6M15 9l-6 6" /> : <path d="M12 7v5l3 2" />}
  </svg>
);

const Email = ({ reference }: { reference?: string }) => (
  <>
    <a href={`mailto:${shop.email}`}>{shop.email}</a>
    {reference ? <> and quote {reference}</> : null}
  </>
);

/* The result page, after 21st.dev "Order Confirmation Card" (kavikatiyar):
   Brad's pick of three on 2026-09-27 (B a ticket, C an alert box). */
export function ResultCard({ state, reference, configured, collect = false }: { state: CheckoutState; reference?: string; configured: boolean; collect?: boolean }) {
  const c = checkoutCopy(state, configured, collect);
  return (
    <div className="cr-a">
      <div className="cr-a-card" data-state={state} aria-live="polite">
        <span className="cr-icon"><Icon state={state} /></span>
        <h1 className="cr-a-h">{c.title}</h1>
        <p className="cr-a-lede">{c.lede}</p>
        <dl className="cr-a-rows">
          {reference ? <div><dt>Reference</dt><dd className="cr-mono">{reference}</dd></div> : null}
          <div><dt>Status</dt><dd>{c.status}</dd></div>
          {state === "paid" && collect ? (
            <div><dt>Collect from</dt><dd>{shop.street}, {shop.town} {shop.postcode}</dd></div>
          ) : null}
          <div><dt>Questions</dt><dd><a href={`mailto:${shop.email}`}>Email the shop</a></dd></div>
        </dl>
        <Link href={c.cta.href} className="cr-btn cr-btn--full">{c.cta.label}</Link>
      </div>
      <section className="cr-a-next" aria-labelledby="cr-next">
        <h2 id="cr-next" className="cr-small-h">{c.nextH}</h2>
        <p>{c.next}</p>
        <p>Email the shop at <Email reference={reference} />.</p>
      </section>
    </div>
  );
}
