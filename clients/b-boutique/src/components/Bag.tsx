"use client";

import { useState } from "react";
import Link from "next/link";

import {
  DELIVERY_IS_DEMO,
  catalogueIsDemo,
  formatPrice,
  productBySlug,
} from "@/lib/catalogue";
import { ImageSlot, type Tone } from "@/components/ImageSlot";
import { useCart } from "@/lib/useCart";

/* The bag, and the button that starts a payment.
 *
 * ── What it sends ─────────────────────────────────────────────────────────
 * Slugs, sizes and quantities. Never a price and never a total: a total sent
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
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lines.map((l) => ({ slug: l.slug, size: l.size, qty: l.qty })),
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
        {lines.map((line, i) => {
          const p = productBySlug(line.slug);
          if (!p) return null;
          return (
            <li key={`${line.slug}-${line.size}`} className="bag-line">
              <Link href={`/shop/${p.slug}`} className="bag-media" aria-label={p.name}>
                <ImageSlot
                  tone={p.tone as Tone}
                  seed={i + 11}
                  uid={`bag-${i}`}
                  slot={p.slot}
                  alt=""
                  sizes="120px"
                  className="absolute inset-0 h-full w-full"
                />
              </Link>

              <div className="bag-detail">
                <p className="bag-name">
                  <Link href={`/shop/${p.slug}`}>{p.name}</Link>
                </p>
                <p className="bag-meta">
                  {p.category}
                  {p.sizes.length > 1 ? ` · Size ${line.size}` : ""}
                </p>
                <p className="bag-each">{formatPrice(p.priceP)}</p>
              </div>

              <div className="bag-qty">
                <label className="sr-only" htmlFor={`qty-${p.slug}-${line.size}`}>
                  Quantity, {p.name}
                  {p.sizes.length > 1 ? `, size ${line.size}` : ""}
                </label>
                {/* A number input rather than plus/minus buttons: it is one
                    control instead of two, it types, and it is already
                    labelled and announced. min={0} removes the line, which is
                    what people expect typing 0 to do. */}
                <input
                  id={`qty-${p.slug}-${line.size}`}
                  className="bag-qty-input"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={10}
                  value={line.qty}
                  onChange={(e) =>
                    setQty(line.slug, line.size, Number(e.target.value))
                  }
                />
                <button
                  type="button"
                  className="bag-remove"
                  onClick={() => remove(line.slug, line.size)}
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
            [Demo prices and delivery rate — invented for this build. Nothing
            can be charged]
          </p>
        ) : null}

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

        <p className="bag-legal">
          Prices include VAT where it applies. You will be taken to our payment
          provider to pay; your card details never reach this site.
        </p>
      </div>
    </div>
  );
}
