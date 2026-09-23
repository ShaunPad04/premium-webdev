"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import {
  DELIVERY_IS_DEMO,
  FREE_DELIVERY_OVER_P,
  formatPrice,
  formatPriceShort,
  productBySlug,
} from "@/lib/catalogue";
import { FreeDelivery } from "@/components/FreeDelivery";
import { ProductPhoto } from "@/components/ProductPhoto";
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

  function removeLine(line: { slug: string; size: string; colour: string }) {
    const key = keyOf(line);
    if (timers.current[key]) return;
    setLeaving((v) => [...v, key]);
    timers.current[key] = setTimeout(() => {
      delete timers.current[key];
      setLeaving((v) => v.filter((k) => k !== key));
      remove(line.slug, line.size, line.colour);
    }, 220);
  }

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

  if (count === 0) {
    return (
      <div className="bag-empty">
        <p className="page-body">Your bag is empty.</p>
        <Link href="/shop" className="btn-solid bag-empty-cta">
          Go to the shop <span aria-hidden="true">&rarr;</span>
        </Link>
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
                      <p className="bk-each">{p.demo ? "Price to confirm" : `${formatPrice(p.priceP)} each`}</p>
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
                        <output aria-live="polite">{line.qty}</output>
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
                        formatPrice(p.priceP * line.qty)
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
              <dd>{formatPrice(subtotalP)}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{deliveryP === 0 ? "Free" : formatPrice(deliveryP)}</dd>
            </div>
            <div className="bk-grand">
              <dt>Total</dt>
              <dd>{formatPrice(totalP)}</dd>
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

          <button type="button" className="bk-pay" onClick={checkout} disabled={busy}>
            <svg width="13" height="15" viewBox="0 0 11 13" fill="none" aria-hidden="true">
              <rect x="0.75" y="5.75" width="9.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <path d="M2.75 5.75V3.9a2.75 2.75 0 0 1 5.5 0v1.85" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            {busy ? "Starting secure checkout…" : "Continue to secure payment"}
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
    </div>
  );
}
