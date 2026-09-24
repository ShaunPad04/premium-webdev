"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import {
  DELIVERY_IS_DEMO,
  FREE_DELIVERY_OVER_P,
  formatPrice,
  formatPriceShort,
  productBySlug,
  wasPriceP,
} from "@/lib/catalogue";
import { newIn } from "@/lib/shop";
import { FreeDelivery } from "@/components/FreeDelivery";
import { ProductPhoto } from "@/components/ProductPhoto";
import { Price } from "@/components/Price";
import {
  DeliveryDetails,
  EMPTY_DETAILS,
  firstProblem,
  fullAddress,
  type DetailsField,
  type Details,
} from "@/components/DeliveryDetails";
import { useCart } from "@/lib/useCart";

/* The bag, and the button that starts a payment.
 *
 * ── What it sends ─────────────────────────────────────────────────────────
 * Slugs, sizes, colours and quantities. Never a price and never a total: a total sent
 * from the browser is a total the browser can change, which is the oldest
 * hole in online retail. The server prices the bag again from its own
 * catalogue and charges that. The figure below is for the customer to read,
 * not for the till.
 *
 * ── What it promises ──────────────────────────────────────────────────────
 * Nothing it has not been told. It only leaves this page when the server
 * returns a real checkout URL from the payment provider; every other outcome
 * is a plainly worded failure that names what happened and leaves the bag
 * exactly as it was. There is no payment provider configured today, so the
 * honest outcome right now is a message saying so. */
export function Bag() {
  const { lines, count, subtotalP, deliveryP, totalP, setQty, remove } =
    useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /* The delivery field that stopped the last attempt, shown on the field. */
  const [invalid, setInvalid] = useState<{ field: DetailsField; message: string } | null>(null);
  /* Deliberately NOT persisted to localStorage alongside the bag. The bag is
     a list of garments; this is somebody's name and home address, and keeping
     it in the browser of a shared or family computer is a different kind of
     thing entirely. It lives for one checkout and goes when the tab does. */
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);

  /* Lines on their way out.
   *
   * Removing a line used to delete it from the store on the click, so the row
   * vanished between two frames and everything below it jumped up by its
   * height. That is the one thing an animation is unambiguously for: not
   * decoration, but stopping a change being jarring — and on a page where the
   * rows look alike, a row that disappears instantly leaves real doubt about
   * WHICH one went.
   *
   * The row is marked leaving, collapses over 220ms, and only then leaves the
   * store. If the same line is removed twice the second call is ignored,
   * because the timeout from the first is already going to remove it. */
  const [leaving, setLeaving] = useState<string[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const keyOf = (l: { slug: string; size: string; colour: string }) =>
    `${l.slug}|${l.size}|${l.colour}`;

  /* Removing a piece (2026-09-24, Brad): the row slides away, then the
     list closes up over it, instead of everything below jumping. Height is
     measured and pinned first so it can ease to zero; reduced motion skips
     straight to the removal. */
  function removeLine(line: { slug: string; size: string; colour: string }) {
    const key = keyOf(line);
    if (timers.current[key]) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const row = document.querySelector<HTMLElement>(`[data-line="${CSS.escape(key)}"]`);
    if (row && !reduce) row.style.height = `${row.offsetHeight}px`;
    setLeaving((v) => [...v, key]);
    timers.current[key] = setTimeout(() => {
      delete timers.current[key];
      setLeaving((v) => v.filter((k) => k !== key));
      remove(line.slug, line.size, line.colour);
    }, reduce ? 0 : 420);
  }

  /* On a phone the pay button sits a long way down, under the delivery
     form. A bar pinned to the bottom carries the total and the same button
     whenever the real one is out of view (CSS shows it under 768px only). */
  const payRef = useRef<HTMLButtonElement>(null);
  const [payVisible, setPayVisible] = useState(true);
  useEffect(() => {
    const el = payRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setPayVisible(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [count]);

  /* What the sale takes off this bag (lib/catalogue.ts SALE): her usual
     price less the price charged, per piece. Zero once the sale ends. */
  const savingsP = lines.reduce((sum, l) => {
    const p = productBySlug(l.slug);
    if (!p || p.demo) return sum;
    const was = wasPriceP(p.priceP);
    return was === null ? sum : sum + (was - p.priceP) * l.qty;
  }, 0);

  /* The pieces in THIS bag that cannot be bought yet.
   *
   * The notice used to read the whole catalogue: any unpriced piece anywhere
   * on the site put "[Some prices are not confirmed yet, and nothing can be
   * charged on this build.]" into every customer's bag, including a bag
   * holding only pieces with confirmed prices. It told them nothing about
   * their own order and blamed the wrong thing — what stops a charge before
   * launch is the unset NEXT_PUBLIC_SITE_URL, not the price of a jumper they
   * never picked up.
   *
   * It can genuinely happen to a customer, which is why this is not simply
   * deleted: a bag lives in localStorage, and a piece added while it was
   * priced stays in the bag after its price is withdrawn. The Striped Fuzzy
   * Zip Up Jumper was buyable until 2026-09-22. /api/checkout refuses such a
   * line with 409 price_unconfirmed; this says so first, by name. */
  const unpriced = [
    ...new Set(
      lines.map((l) => productBySlug(l.slug)).filter((p) => p?.demo).map((p) => p!.name),
    ),
  ];
  const unpricedMessage =
    unpriced.length === 0
      ? null
      : `${unpriced.join(" and ")} ${unpriced.length === 1 ? "does" : "do"} not have a confirmed price yet, so ${unpriced.length === 1 ? "it cannot" : "they cannot"} be bought. Remove ${unpriced.length === 1 ? "it" : "them"} to check out.`;

  /* The empty bag (2026-09-24, Brad): not a dead end. A line, the way
     back, and three real pieces from New In to start from. */
  if (count === 0) {
    const picks = newIn.filter((n) => n.priced).slice(0, 3);
    return (
      <div className="bag-empty">
        <p className="bag-empty-h">Nothing in here yet.</p>
        <p className="page-body">Every piece is chosen by hand, and most are one of one.</p>
        <div className="bag-empty-ctas">
          <Link href="/#new-in" className="btn-solid bag-empty-cta">
            <span className="roll"><span>See what&rsquo;s new</span></span> <span aria-hidden="true">&rarr;</span>
          </Link>
          <Link href="/shop" className="bag-empty-all">Shop everything</Link>
        </div>
        {picks.length ? (
          <section className="bag-empty-new" aria-labelledby="bag-empty-new-h">
            <div className="bag-empty-new-head">
              <h2 id="bag-empty-new-h" className="bag-empty-new-h">Just in</h2>
              <Link href="/#new-in" className="bag-empty-new-all">View all</Link>
            </div>
            <ul className="bag-empty-picks">
              {picks.map((n) => (
                <li key={n.slug}>
                  <Link href={`/shop/${n.slug}`} className="bag-empty-pick">
                    <span className="bag-empty-media">
                      <ProductPhoto photo={n.photo} alt="" sizes="(min-width: 768px) 240px, 62vw" className="absolute inset-0 h-full w-full object-cover" square={n.category === "Homeware"} />
                    </span>
                    <span className="bag-empty-meta">{n.category}</span>
                    <span className="bag-empty-name">{n.name}</span>
                    <span className="bag-empty-price"><Price priceP={n.priceP} /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    );
  }

  async function checkout() {
    if (busy) return;

    /* Checked here so somebody is told before the button does anything, and
       checked again on the server because this one can be skipped. */
    if (unpricedMessage) {
      setError(unpricedMessage);
      return;
    }
    const problem = firstProblem(details);
    if (problem) {
      /* Said on the field itself, and the customer is taken to it: on a
         phone the button is a screen away from the form. The summary only
         points back to it. */
      setInvalid(problem);
      setError("Check your delivery details. One of them needs finishing before you can pay.");
      const el = document.querySelector<HTMLElement>(`#bk-delivery-card [name="${problem.field}"]`);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setBusy(true);
    setError(null);
    setInvalid(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lines.map((l) => ({
            slug: l.slug,
            size: l.size,
            colour: l.colour,
            qty: l.qty,
          })),
          customer: {
            name: details.name.trim(),
            email: details.email.trim(),
            address: fullAddress(details),
            postcode: details.postcode.trim(),
            phone: details.phone.trim(),
          },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        url?: string;
        error?: string;
      };
      if (res.ok && data.ok && typeof data.url === "string") {
        window.location.assign(data.url);
        return;
      }
      setError(data.error ?? "Checkout could not be started just now.");
    } catch {
      setError(
        "Checkout could not be started — there may be a problem with your connection.",
      );
    } finally {
      setBusy(false);
    }
  }

  /* Where a swatch crops its photograph: the same rule AddToBag uses. */
  const swatchAt = (category: string) =>
    category === "Homeware" ? "50% 50%" : category === "Trousers" ? "44% 64%" : "44% 32%";

  /* ── Layout, rebuilt 2026-09-23 ─────────────────────────────────────────
   * The client called the old bag "extremely generic and unorganised": one
   * long row per piece across the full width, and a narrow column on the
   * right holding the totals, the whole delivery form and the button, so
   * the form ran on below the fold beside empty space.
   *
   * Now it reads as the checkout it is. A three-step marker (Bag, Delivery,
   * Secure payment — the last is SumUp's page, and is labelled as such).
   * On the left, two numbered sections: the pieces, then where they are
   * going. On the right, an order summary that stays in view on a desktop:
   * totals, the free-delivery bar, one button, and what happens next.
   * Nothing about how the order is priced, checked or paid has changed. */
  return (
    <div className="bk">
      <ol className="bk-steps" aria-label="Checkout steps">
        <li className="is-current" aria-current="step"><span>1</span>Bag</li>
        <li><span>2</span>Delivery</li>
        <li><span>3</span><span className="bk-hide-xs">Secure&nbsp;</span>payment</li>
      </ol>

      <div className="bk-grid">
        <div className="bk-main">
          <section className="bk-card" aria-labelledby="bk-pieces">
            <h2 id="bk-pieces" className="bk-card-h">
              <span className="bk-num">01</span>Your pieces
              <span className="bk-count">
                {count} {count === 1 ? "item" : "items"}
              </span>
            </h2>
            <ul className="bk-lines">
              {lines.map((line) => {
                const p = productBySlug(line.slug);
                if (!p) return null;
                const img = p.colourways.find((c) => c.colour === line.colour)?.image ?? p.photo;
                const label = `${p.name}${p.sizes.length > 1 ? `, size ${line.size}` : ""}${line.colour ? `, ${line.colour}` : ""}`;
                return (
                  /* Keyed by the variant, not the product: the same coat in
                     two colours is two lines. */
                  <li
                    key={`${line.slug}-${line.size}-${line.colour}`}
                    data-line={keyOf(line)}
                    className={`bk-line${leaving.includes(keyOf(line)) ? " is-leaving" : ""}`}
                  >
                    <Link href={`/shop/${p.slug}`} className="bk-media" aria-label={p.name}>
                      {/* The photograph of the colour in the BAG, not the
                          piece's first colourway. */}
                      <ProductPhoto
                        photo={img}
                        square={p.category === "Homeware"}
                        alt=""
                        sizes="120px"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </Link>

                    <div className="bk-info">
                      <p className="bk-cat">{p.category}</p>
                      <p className="bk-name">
                        <Link href={`/shop/${p.slug}`}>{p.name}</Link>
                      </p>
                      <p className="bk-meta">
                        {line.colour ? (
                          <span className="bk-chip">
                            <span
                              className="bk-dot"
                              aria-hidden="true"
                              style={{ backgroundImage: `url(/img/product/${img}-640.jpg)`, backgroundPosition: swatchAt(p.category) }}
                            />
                            {line.colour}
                          </span>
                        ) : null}
                        {p.sizes.length > 1 ? <span className="bk-chip">Size {line.size}</span> : null}
                      </p>
                      {/* "Price to confirm", the same words the grid and
                          product page use, for a piece whose price was
                          withdrawn after it went in the bag. */}
                      <p className="bk-each">
                        {p.demo ? "Price to confirm" : `${formatPrice(p.priceP)} each`}
                        {!p.demo && wasPriceP(p.priceP) !== null ? (
                          <s className="bk-was"><span className="sr-only">, usually </span>{formatPrice(wasPriceP(p.priceP)!)}</s>
                        ) : null}
                      </p>
                    </div>

                    <div className="bk-controls">
                      {/* A stepper: one tap each way, labelled with the
                          piece, and the number announced as it changes. At 1
                          the minus stops; Remove is the way out, so a
                          mis-tap never empties a line. */}
                      <div className="bk-stepper" role="group" aria-label={`Quantity, ${label}`}>
                        <button
                          type="button"
                          aria-label={`One fewer, ${label}`}
                          disabled={line.qty <= 1}
                          onClick={() => setQty(line.slug, line.size, line.colour, line.qty - 1)}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                        </button>
                        <output aria-live="polite"><span key={line.qty} className="bk-roll">{line.qty}</span></output>
                        <button
                          type="button"
                          aria-label={`One more, ${label}`}
                          disabled={line.qty >= 6}
                          onClick={() => setQty(line.slug, line.size, line.colour, line.qty + 1)}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8M6 2v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                        </button>
                      </div>
                      <button type="button" className="bk-remove" onClick={() => removeLine(line)} aria-label={`Remove ${label}`}>
                        Remove
                      </button>
                    </div>

                    <p className="bk-total">
                      {p.demo ? (
                        <>
                          <span aria-hidden="true">&mdash;</span>
                          <span className="sr-only">No price yet</span>
                        </>
                      ) : (
                        <span key={line.qty} className="bk-roll">{formatPrice(p.priceP * line.qty)}</span>
                      )}
                    </p>
                  </li>
                );
              })}
            </ul>
            <Link href="/shop" className="bk-continue">
              <span aria-hidden="true">&larr;</span> Continue shopping
            </Link>
          </section>

          <section id="bk-delivery-card" className="bk-card" aria-labelledby="bk-delivery">
            <h2 id="bk-delivery" className="bk-card-h">
              <span className="bk-num">02</span>Delivery details
            </h2>
            <p className="bk-lede">We post within the UK only, by Royal Mail, next working day.</p>
            <DeliveryDetails
              value={details}
              onChange={(next) => {
                setDetails(next);
                /* Once the flagged field passes, stop flagging it. */
                if (invalid && firstProblem(next)?.field !== invalid.field) {
                  setInvalid(null);
                  setError(null);
                }
              }}
              disabled={busy}
              invalid={invalid}
            />
          </section>
        </div>

        <aside className="bk-summary" aria-labelledby="bk-summary-h">
          <h2 id="bk-summary-h" className="bk-summary-h">Order summary</h2>
          <dl className="bk-totals">
            <div>
              <dt>Subtotal ({count} {count === 1 ? "item" : "items"})</dt>
              <dd><span key={subtotalP} className="bk-roll">{formatPrice(subtotalP)}</span></dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd><span key={deliveryP} className="bk-roll">{deliveryP === 0 ? "Free" : formatPrice(deliveryP)}</span></dd>
            </div>
            {savingsP > 0 ? (
              <div className="bk-saving">
                <dt>Sale saving</dt>
                <dd><span key={savingsP} className="bk-roll">&minus;{formatPrice(savingsP)}</span></dd>
              </div>
            ) : null}
            <div className="bk-grand">
              <dt>Total</dt>
              <dd><span key={totalP} className="bk-roll">{formatPrice(totalP)}</span></dd>
            </div>
          </dl>

          {unpricedMessage ? (
            <p className="bag-pending bag-unpriced">{unpricedMessage}</p>
          ) : DELIVERY_IS_DEMO ? (
            <p className="page-pending bag-pending">
              [Delivery charges are not confirmed yet, and nothing can be charged
              on this build.]
            </p>
          ) : null}

          {/* How far off free delivery: information that might change what
              somebody does next, so above the button. */}
          <FreeDelivery subtotalP={subtotalP} />

          <button ref={payRef} type="button" className="bk-pay" onClick={checkout} disabled={busy} aria-busy={busy || undefined}>
            {busy ? (
              <span className="bk-spin" aria-hidden="true" />
            ) : (
              <svg width="13" height="15" viewBox="0 0 11 13" fill="none" aria-hidden="true">
                <rect x="0.75" y="5.75" width="9.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M2.75 5.75V3.9a2.75 2.75 0 0 1 5.5 0v1.85" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            )}
            <span className="roll"><span>{busy ? "Taking you to SumUp…" : "Continue to secure payment"}</span></span>
          </button>

          <div className="bk-alert-live" role="status" aria-live="polite">
            {error ? (
              <p className="bk-alert">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M10 5.8v5.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="10" cy="14" r="0.95" fill="currentColor" />
                </svg>
                <span>{error}</span>
              </p>
            ) : null}
          </div>

          {/* What happens next, stated as fact: the card is taken on SumUp's
              hosted page (lib/sumup.ts), never on this site. */}
          <ul className="bk-trust">
            <li>Payment is taken on SumUp&rsquo;s secure page. Your card details never reach this site.</li>
            <li>Royal Mail, next working day. Free over {formatPriceShort(FREE_DELIVERY_OVER_P)}.</li>
            <li>14 days to change your mind.</li>
          </ul>

          {/* The cards SumUp's online checkout takes in the UK (checked
              2026-09-24): Visa, Mastercard and American Express. Apple Pay
              and Google Pay are left off: SumUp only offers them once the
              merchant profile is verified for wallets, which is not
              confirmed for this account. */}
          <ul className="bk-cards" aria-label="Cards accepted">
            <li className="bk-cc bk-cc--visa"><span aria-hidden="true">VISA</span><span className="sr-only">Visa</span></li>
            <li className="bk-cc bk-cc--mc">
              <svg viewBox="0 0 32 20" width="30" height="19" aria-hidden="true"><circle cx="12" cy="10" r="8" fill="#EB001B" /><circle cx="20" cy="10" r="8" fill="#F79E1B" /><path d="M16 3.1a8 8 0 0 1 0 13.8 8 8 0 0 1 0-13.8Z" fill="#FF5F00" /></svg>
              <span className="sr-only">Mastercard</span>
            </li>
            <li className="bk-cc bk-cc--amex"><span aria-hidden="true">AMEX</span><span className="sr-only">American Express</span></li>
          </ul>

          {/* Delivery and returns are linked from the last screen before
              payment, not discovered afterwards. */}
          <p className="bag-legal">
            B Boutique is not VAT registered, so there is no VAT to add. Before
            you buy, please read our{" "}
            <Link href="/delivery" className="bag-legal-link">delivery</Link>{" "}
            and{" "}
            <Link href="/returns" className="bag-legal-link">returns</Link>{" "}
            terms.
          </p>
        </aside>
      </div>

      {/* The phone checkout bar. aria-hidden and out of the tab order while
          the real button is on screen, so it is never a second stop. */}
      <div className="bk-dock" data-show={payVisible ? undefined : ""} aria-hidden={payVisible || undefined}>
        <div className="bk-dock-total">
          <span className="bk-dock-label">Total</span>
          <span key={totalP} className="bk-roll bk-dock-sum">{formatPrice(totalP)}</span>
        </div>
        <button type="button" className="bk-pay bk-dock-pay" onClick={checkout} disabled={busy} tabIndex={payVisible ? -1 : 0}>
          {busy ? <span className="bk-spin" aria-hidden="true" /> : null}
          <span>{busy ? "Taking you to SumUp…" : "Secure checkout"}</span>
        </button>
      </div>
    </div>
  );
}
