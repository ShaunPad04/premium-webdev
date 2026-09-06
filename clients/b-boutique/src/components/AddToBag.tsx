"use client";

import { useId, useState } from "react";
import Link from "next/link";

import type { Product } from "@/lib/catalogue";
import { useCart } from "@/lib/useCart";

/* Size, then add.
 *
 * ── Why the size is a radio group and not a <select> ──────────────────────
 * Six sizes is a set you want to see at once, and a native radio group is
 * already keyboard-operable with arrow keys, already announced as "3 of 6",
 * and already has a group label. A styled <select> gives none of that for
 * free and a div-with-onClick gives none of it at all.
 *
 * ── Why there is no size preselected ──────────────────────────────────────
 * Preselecting a 10 sells a 10 to somebody who meant to pick a 14 and did not
 * notice. Nothing is chosen until a person chooses it, and the button says so
 * rather than failing silently when they press it.
 *
 * ── The confirmation ──────────────────────────────────────────────────────
 * A polite live region that exists before the add, so it is announced when it
 * fills. It names the size, because "added to bag" is not enough information
 * to catch a mistake. */
export function AddToBag({ product }: { product: Product }) {
  const uid = useId();
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(
    product.sizes.length === 1 ? product.sizes[0] : null,
  );
  const [error, setError] = useState(false);
  const [added, setAdded] = useState<string | null>(null);

  const single = product.sizes.length === 1;

  return (
    <div className="atb">
      {!single ? (
        <fieldset className="atb-sizes" aria-describedby={error ? `${uid}-err` : undefined}>
          <legend className="cf-label">Size</legend>
          <div className="atb-size-row">
            {product.sizes.map((s) => (
              <label key={s} className={`atb-size${size === s ? " is-on" : ""}`}>
                <input
                  type="radio"
                  name={`${uid}-size`}
                  value={s}
                  checked={size === s}
                  onChange={() => {
                    setSize(s);
                    setError(false);
                  }}
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
          {error ? (
            <p className="cf-error" id={`${uid}-err`}>
              Please choose a size first.
            </p>
          ) : null}
        </fieldset>
      ) : (
        <p className="atb-onesize">One size</p>
      )}

      <button
        type="button"
        className="cf-submit atb-add"
        onClick={() => {
          if (!size) {
            setError(true);
            return;
          }
          add(product.slug, size);
          setAdded(size);
        }}
      >
        Add to bag
        <span className="cf-submit-arrow" aria-hidden="true">
          &rarr;
        </span>
      </button>

      <div className="atb-status" role="status" aria-live="polite">
        {added ? (
          <p className="atb-added">
            Added{single ? "" : `, size ${added}`}.{" "}
            <Link href="/bag" className="atb-added-link">
              View bag
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
