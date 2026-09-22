"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import {
  DELIVERY_IS_DEMO,
  catalogueIsDemo,
  formatPrice,
  productBySlug,
} from "@/lib/catalogue";
import { FreeDelivery } from "@/components/FreeDelivery";
import { ProductPhoto } from "@/components/ProductPhoto";
import {
  DeliveryDetails,
  EMPTY_DETAILS,
  detailsProblem,
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
    const problem = detailsProblem(details);
    if (problem) {
      setError(problem);
      return;
    }

    setBusy(true);
    setError(null);
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
            address: details.address.trim(),
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

  return (
    <div className="bag">
      <ul className="bag-lines">
        {lines.map((line) => {
          const p = productBySlug(line.slug);
          if (!p) return null;
          return (
            /* Keyed by the variant, not the product: the same coat in two
               colours is two lines and React has to be able to tell them
               apart. */
            <li
              key={`${line.slug}-${line.size}-${line.colour}`}
              className={`bag-line${leaving.includes(keyOf(line)) ? " is-leaving" : ""}`}
            >
              <Link href={`/shop/${p.slug}`} className="bag-media" aria-label={p.name}>
                {/* The real photograph, like every other product surface.
                    This one was missed when the grid, the rail and the product
                    page were switched over on 2026-09-22, so a piece the
                    customer had just LOOKED AT turned into a black marble
                    rectangle the moment it went in the bag — which reads as a
                    broken image exactly where somebody is deciding whether to
                    trust the shop with a card. The client spotted it. */}
                <ProductPhoto
                  photo={p.photo}
                  square={p.category === "Homeware"}
                  alt=""
                  sizes="120px"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </Link>

              <div className="bag-detail">
                <p className="bag-name">
                  <Link href={`/shop/${p.slug}`}>{p.name}</Link>
                </p>
                <p className="bag-meta">
                  {p.category}
                  {p.sizes.length > 1 ? ` · Size ${line.size}` : ""}
                  {/* Only when the client has confirmed one. A blank colour
                      prints nothing rather than an empty separator. */}
                  {line.colour ? ` · ${line.colour}` : ""}
                </p>
                <p className="bag-each">{formatPrice(p.priceP)}</p>
              </div>

              <div className="bag-qty">
                <label className="sr-only" htmlFor={`qty-${p.slug}-${line.size}-${line.colour}`}>
                  Quantity, {p.name}
                  {p.sizes.length > 1 ? `, size ${line.size}` : ""}
                  {line.colour ? `, ${line.colour}` : ""}
                </label>
                {/* A number input rather than plus/minus buttons: it is one
                    control instead of two, it types, and it is already
                    labelled and announced. min={0} removes the line, which is
                    what people expect typing 0 to do. */}
                <input
                  id={`qty-${p.slug}-${line.size}-${line.colour}`}
                  className="bag-qty-input"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={6}
                  value={line.qty}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    /* Typing 0 is the other way to remove a line, and it
                       should leave the same way pressing Remove does. */
                    if (n < 1) {
                      removeLine(line);
                      return;
                    }
                    setQty(line.slug, line.size, line.colour, n);
                  }}
                />
                <button
                  type="button"
                  className="bag-remove"
                  onClick={() => removeLine(line)}
                >
                  Remove
                </button>
              </div>

              <p className="bag-line-total">
                {formatPrice(p.priceP * line.qty)}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="bag-sum">
        <dl className="bag-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatPrice(subtotalP)}</dd>
          </div>
          <div>
            <dt>Delivery</dt>
            <dd>{formatPrice(deliveryP)}</dd>
          </div>
          <div className="bag-total-row">
            <dt>Total</dt>
            <dd>{formatPrice(totalP)}</dd>
          </div>
        </dl>

        {catalogueIsDemo || DELIVERY_IS_DEMO ? (
          <p className="page-pending bag-pending">
            [Some prices are not confirmed yet, and nothing can be charged on
            this build.]
          </p>
        ) : null}

        {/* How far off free delivery. In the SUMMARY panel, above the
            control — it is information that might change what somebody does
            next, and under the button it would be an explanation of a
            decision already made.
            It was briefly inserted into the line row instead, between the
            quantity box and REMOVE, because the patch that added it matched
            the first `<button` in the file. That is what it looked like:
            a progress bar wedged into the middle of a product row. */}
        <FreeDelivery subtotalP={subtotalP} />

        {/* Above the button, because it has to be filled in before the button
            means anything. */}
        <DeliveryDetails value={details} onChange={setDetails} disabled={busy} />

        <button
          type="button"
          className="cf-submit bag-checkout"
          onClick={checkout}
          disabled={busy}
        >
          {busy ? "Starting checkout…" : "Checkout"}
          {busy ? null : (
            <span className="cf-submit-arrow" aria-hidden="true">
              &rarr;
            </span>
          )}
        </button>

        <div className="cf-status" role="status" aria-live="polite">
          {error ? <p className="cf-fail">{error}</p> : null}
        </div>

        {/* Delivery and returns have to be available to the customer BEFORE
            they are bound by the order, not discovered afterwards — so they
            are linked from the last screen before payment, not only from the
            footer. next/link because both are internal routes. */}
        <p className="bag-legal">
          Prices include VAT where it applies. You will be taken to our payment
          provider to pay; your card details never reach this site. Before you
          buy, please read our{" "}
          <Link href="/delivery" className="bag-legal-link">
            delivery
          </Link>{" "}
          and{" "}
          <Link href="/returns" className="bag-legal-link">
            returns
          </Link>{" "}
          terms &mdash; including your right to change your mind within 14 days.
        </p>
      </div>
    </div>
  );
}
