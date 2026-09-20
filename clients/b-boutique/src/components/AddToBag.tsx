"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";

import type { Product } from "@/lib/catalogue";
import { useCart } from "@/lib/useCart";
import { phoneDisplay, shop } from "@/lib/shop";
import { colourIsKnown, coloursFor, variantId } from "@/lib/variants";

/* Colour, size, then add.
 *
 * ── Why the size is a radio group and not a <select> ──────────────────────
 * Six sizes is a set you want to see at once, and a native radio group is
 * already keyboard-operable with arrow keys, already announced as "3 of 6",
 * and already has a group label. A styled <select> gives none of that for
 * free and a div-with-onClick gives none of it at all. Colour is the same
 * control for the same reasons.
 *
 * ── Why there is no size preselected ──────────────────────────────────────
 * Preselecting a 10 sells a 10 to somebody who meant to pick a 14 and did not
 * notice. Nothing is chosen until a person chooses it, and the button says so
 * rather than failing silently when they press it. A piece sold in exactly
 * one size, or one colour, is not a choice and is not presented as one.
 *
 * ── Colour ────────────────────────────────────────────────────────────────
 * Three cases, and the difference between the second and third matters:
 *   several colours  — a choice, and part of what goes in the bag.
 *   one known colour — a fact about the garment, stated, not asked.
 *   none confirmed   — NOTHING is shown. Not "colour: n/a", not a guess read
 *                      off the photograph. `lib/variants.ts` has an empty
 *                      colour table today, so this is every piece in the shop
 *                      until the client answers.
 *
 * ── Stock ─────────────────────────────────────────────────────────────────
 * Fetched after the page loads, because the page is static and stock is not.
 * A size the shop has counted to zero cannot be selected or added. A size
 * NOBODY has counted behaves exactly as it did before any of this existed —
 * addable, no claim made either way — because "we have not counted it" is not
 * the same statement as "it is in stock", and the site must not make the
 * second one on the strength of the first.
 *
 * None of this is the real gate. /api/checkout checks the count again,
 * server-side, immediately before a payment is created; a browser can ignore
 * anything it is told. This is here so a customer finds out before the card,
 * not after it. */

type State = "in" | "out" | "unknown";
type Availability = Record<string, { state: State; restockable: boolean }>;

export function AddToBag({ product }: { product: Product }) {
  const uid = useId();
  const { add } = useCart();

  const colours = coloursFor(product.slug);
  const colourChoice = colours.length > 1;
  const colourKnown = colourIsKnown(product.slug);
  const singleSize = product.sizes.length === 1;

  const [colour, setColour] = useState<string | null>(
    colourChoice ? null : colours[0],
  );
  const [size, setSize] = useState<string | null>(
    singleSize ? product.sizes[0] : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<{ size: string; colour: string } | null>(null);
  const [stock, setStock] = useState<Availability>({});

  useEffect(() => {
    const ac = new AbortController();
    fetch(`/api/availability?slug=${encodeURIComponent(product.slug)}`, {
      signal: ac.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { variants?: Availability } | null) => {
        if (d?.variants) setStock(d.variants);
      })
      /* A failed lookup leaves every variant unknown, which is the state the
         shop was in before stock existed. It must never fail closed and tell
         a customer a garment is gone on the strength of a dropped request. */
      .catch(() => {});
    return () => ac.abort();
  }, [product.slug]);

  const stateOf = (s: string, c: string): State =>
    stock[variantId(product.slug, s, c)]?.state ?? "unknown";

  /* Sold out only counts as sold out for a colour that has been chosen. With
     two colours and nothing picked, no size is out — it depends which one. */
  const sizeOut = (s: string) => colour !== null && stateOf(s, colour) === "out";
  const allOut =
    colour !== null && product.sizes.every((s) => stateOf(s, colour) === "out");
  const restockable =
    colour !== null &&
    product.sizes.some(
      (s) => stock[variantId(product.slug, s, colour)]?.restockable,
    );

  const chosenOut = size !== null && sizeOut(size);

  return (
    <div className="atb">
      {colourChoice ? (
        <fieldset className="atb-sizes">
          <legend className="cf-label">Colour</legend>
          <div className="atb-size-row">
            {colours.map((c) => (
              <label key={c} className={`atb-size${colour === c ? " is-on" : ""}`}>
                <input
                  type="radio"
                  name={`${uid}-colour`}
                  value={c}
                  checked={colour === c}
                  onChange={() => {
                    setColour(c);
                    setError(null);
                  }}
                />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : colourKnown ? (
        /* One colour is a fact, not a question. Stated, so the bag and the
           confirmation are not saying something the page never said. */
        <p className="atb-onecolour">
          Colour <span>{colours[0]}</span>
        </p>
      ) : null}

      {!singleSize ? (
        <fieldset
          className="atb-sizes"
          aria-describedby={error ? `${uid}-err` : undefined}
        >
          <legend className="cf-label">Size</legend>
          <div className="atb-size-row">
            {product.sizes.map((s) => {
              const out = sizeOut(s);
              return (
                <label
                  key={s}
                  className={`atb-size${size === s ? " is-on" : ""}${out ? " is-out" : ""}`}
                >
                  <input
                    type="radio"
                    name={`${uid}-size`}
                    value={s}
                    checked={size === s}
                    disabled={out}
                    onChange={() => {
                      setSize(s);
                      setError(null);
                    }}
                  />
                  <span>
                    {s}
                    {out ? <em> sold out</em> : null}
                  </span>
                </label>
              );
            })}
          </div>
          {error ? (
            <p className="cf-error" id={`${uid}-err`}>
              {error}
            </p>
          ) : null}
        </fieldset>
      ) : (
        <p className="atb-onesize">One size</p>
      )}

      {allOut ? (
        /* The number is not typed in here. It comes from `shop.ts`, which is
           the one place the confirmed phone number lives — a second copy is a
           second thing to get wrong the day it changes. */
        <p className="atb-out" role="status">
          Sold out{colourChoice ? ` in ${colour}` : ""}.{" "}
          {restockable
            ? "This one can be re-ordered — call the shop on "
            : "Call the shop on "}
          <a href={`tel:${shop.phone}`} className="atb-out-tel">
            {phoneDisplay}
          </a>
          {restockable ? "." : " to ask what else has come in."}
        </p>
      ) : (
        <button
          type="button"
          className="cf-submit atb-add"
          disabled={chosenOut}
          onClick={() => {
            if (colourChoice && colour === null) {
              setError("Please choose a colour first.");
              return;
            }
            if (!size) {
              setError("Please choose a size first.");
              return;
            }
            const c = colour ?? "";
            add(product.slug, size, c);
            setAdded({ size, colour: c });
          }}
        >
          {chosenOut ? "Sold out" : "Add to bag"}
          {chosenOut ? null : (
            <span className="cf-submit-arrow" aria-hidden="true">
              &rarr;
            </span>
          )}
        </button>
      )}

      {/* A polite live region that exists before the add, so it is announced
          when it fills. It names the size and the colour, because "added to
          bag" is not enough information to catch a mistake. */}
      <div className="atb-status" role="status" aria-live="polite">
        {added ? (
          <p className="atb-added">
            Added
            {singleSize ? "" : `, size ${added.size}`}
            {added.colour ? `, ${added.colour}` : ""}.{" "}
            <Link href="/bag" className="atb-added-link">
              View bag
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
