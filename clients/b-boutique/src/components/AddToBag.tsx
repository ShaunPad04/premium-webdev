"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { Product } from "@/lib/catalogue";
import { MAX_QTY, useCart } from "@/lib/useCart";
import { shop } from "@/lib/shop";
import { colourIsKnown, coloursFor, variantId } from "@/lib/variants";
import { useColour } from "./ColourChoice";

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

/* ── A size chosen elsewhere ───────────────────────────────────────────────
 * The home page's statement pieces link here as /shop/<slug>?size=M, so a
 * size clicked there arrives already chosen. That is not a preselect in the
 * sense above: the customer picked it. Read from the URL without state or an
 * effect, and only honoured when it is one of this piece's real sizes. Any
 * size picked on this page wins over it. */
const noSubscribe = () => () => {};
const urlSize = () => new URLSearchParams(window.location.search).get("size");

type State = "in" | "out" | "unknown";
type Availability = Record<string, { state: State; restockable: boolean }>;

/* `compact` (the home page's New In carousel): colour, size and Add to bag
   only. Buy now and the secure-checkout line stay on the product page. */
export function AddToBag({ product, compact = false }: { product: Product; compact?: boolean }) {
  const uid = useId();
  const { add, lines } = useCart();
  const router = useRouter();

  const colours = coloursFor(product.slug);
  const colourChoice = colours.length > 1;
  const colourKnown = colourIsKnown(product.slug);
  const singleSize = product.sizes.length === 1;

  /* Shared with the photograph, so picking a colour here swaps the picture.
     This used to be local state and the gallery had its own; two controls for
     one decision is how somebody ends up looking at the camel coat with the
     burgundy one in their bag. See ColourChoice.tsx. */
  const { colour, setColour } = useColour();
  const [picked, setSize] = useState<string | null>(
    singleSize ? product.sizes[0] : null,
  );
  const fromUrl = useSyncExternalStore(noSubscribe, urlSize, () => null);
  const size =
    picked ?? (fromUrl && product.sizes.includes(fromUrl) ? fromUrl : null);
  const [error, setError] = useState<string | null>(null);
  /* `n` counts the adds. It is the element's key, so adding the same size
     twice replays the confirmation instead of quietly rewriting text that is
     already on screen — which looks identical to nothing having happened. */
  const [added, setAdded] = useState<{ size: string; colour: string; n: number; qty: number } | null>(null);
  const [stock, setStock] = useState<Availability>({});
  /* The most one bag may hold of each variant (see /api/availability): the
     shop's count, or the list's colour total where no size count exists yet.
     Never printed, only used to stop the + button. */
  const [limits, setLimits] = useState<Record<string, number>>({});
  /* Quantity (2026-09-24, Brad). 1 to the bag's own cap; the checkout still
     reserves against counted stock, so this cannot oversell a piece. */
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const ac = new AbortController();
    fetch(`/api/availability?slug=${encodeURIComponent(product.slug)}`, {
      signal: ac.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { variants?: Availability; limits?: Record<string, number> } | null) => {
        if (d?.variants) setStock(d.variants);
        if (d?.limits) setLimits(d.limits);
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

  /* Where in the photograph the swatch crops: the garment's own fabric, off
     the zip line. Measured on the catalogue's photos: chest-left for tops,
     knits and coats; the thigh for trousers; the object's centre for
     homeware. */
  const swatchAt =
    product.category === "Homeware" ? "50% 50%" : product.category === "Trousers" ? "44% 64%" : product.category === "Skirts" ? "47% 52%" : "44% 32%";

  /* The one add both buttons use: refuses, with a message, until a colour
     (where there is a choice) and a size are chosen. */
  /* How many more of the chosen variant this bag can take: its limit, less
     what is already in the bag. Until a size (and colour) is chosen there is
     no variant, so the bag's own cap stands. */
  const vid = size !== null && (colour !== null || !colourChoice) ? variantId(product.slug, size, colour ?? "") : null;
  const inBag = vid ? lines.find((l) => variantId(l.slug, l.size, l.colour) === vid)?.qty ?? 0 : 0;
  const room = vid ? Math.max(0, Math.min(MAX_QTY, limits[vid] ?? MAX_QTY) - inBag) : MAX_QTY;
  const shownQty = Math.max(1, Math.min(qty, room));
  const full = vid !== null && room === 0 && !chosenOut;

  const addChosen = () => {
    if (colourChoice && colour === null) {
      setError("Please choose a colour first.");
      return false;
    }
    if (!size) {
      setError("Please choose a size first.");
      return false;
    }
    if (full) {
      setError("Everything we have in this size is already in your bag.");
      return false;
    }
    add(product.slug, size, colour ?? "", compact ? 1 : shownQty);
    return true;
  };

  return (
    <div className="atb">
      {/* Colour, as swatches. Each swatch is filled with a close crop of
          that colourway's OWN photograph (the garment's body), so "Denim
          Blue" shows her denim and "Leopard Print" shows the print — not a
          hex somebody guessed. The name stays beside the legend, because a
          swatch alone is not a label. One colourway: the one swatch, chosen,
          stated rather than asked. */}
      {colourKnown || colourChoice ? (
        <fieldset className="atb-sizes">
          <legend className="cf-label">
            Colour <span className="atb-colour-name">{colour ?? (colourChoice ? "Choose" : colours[0])}</span>
          </legend>
          <div className="atb-swatch-row">
            {colours.map((c) => {
              const img = product.colourways.find((w) => w.colour === c)?.image ?? product.photo;
              return (
                <label
                  key={c}
                  className={`atb-swatch${(colour ?? (colourChoice ? null : colours[0])) === c ? " is-on" : ""}`}
                  style={{ backgroundImage: `url(/img/product/${img}-640.jpg)`, backgroundPosition: swatchAt }}
                >
                  <input
                    type="radio"
                    name={`${uid}-colour`}
                    value={c}
                    checked={(colour ?? (colourChoice ? null : colours[0])) === c}
                    onChange={() => {
                      setColour(c);
                      setError(null);
                    }}
                  />
                  <span className="sr-only">{c}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
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
        /* "One size" on its own answers nothing — one size to WHAT? The
           client asked, and the qualifier was already in the data: the stock
           dashboard gives "fits up to 14" / "fits up to 16" / "fits up to 12"
           per piece, and lib/stocklist.ts keeps it in `sizeNote` precisely so
           it can be shown beside the size rather than mistaken for one.
           It was simply never rendered. */
        <p className="atb-onesize">
          {product.sizes[0]}
          {product.sizeNote ? (
            <span className="atb-onesize-note"> &mdash; {product.sizeNote}</span>
          ) : null}
        </p>
      )}

      {allOut ? (
        /* The address is not typed in here. It comes from `shop.ts`, the one
           place the shop's contact details live — a second copy is a second
           thing to get wrong the day it changes. "Email … at" since
           2026-09-22: this said "call the shop on" in front of an email
           address, left over from when phone numbers came off the site. */
        <p className="atb-out" role="status">
          Sold out{colourChoice ? ` in ${colour}` : ""}.{" "}
          {restockable
            ? "This one can be re-ordered — email the shop at "
            : "Email the shop at "}
          <a href={`mailto:${shop.email}`} className="atb-out-tel">
            {shop.email}
          </a>
          {restockable ? "." : " to ask what else has come in."}
        </p>
      ) : (
        <>
        {compact ? null : (
          <div className="atb-qty">
            <span className="cf-label" id={`${uid}-qty`}>Quantity</span>
            <div className="atb-qty-box" role="group" aria-labelledby={`${uid}-qty`}>
              <button type="button" className="atb-qty-btn" aria-label="One fewer" disabled={shownQty <= 1} onClick={() => setQty(Math.max(1, shownQty - 1))}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 7h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
              </button>
              <output className="atb-qty-n" aria-live="polite">{shownQty}</output>
              <button type="button" className="atb-qty-btn" aria-label="One more" disabled={shownQty >= Math.min(MAX_QTY, room)} onClick={() => setQty(Math.min(MAX_QTY, room, shownQty + 1))}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 7h10M7 2v10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
              </button>
            </div>
          </div>
        )}
        <button
          type="button"
          className="cf-submit atb-add"
          disabled={chosenOut}
          onClick={() => {
            if (!addChosen()) return;
            setAdded((prev) => ({ size: size!, colour: colour ?? "", n: (prev?.n ?? 0) + 1, qty: compact ? 1 : shownQty }));
          }}
        >
          <span className="roll"><span>{chosenOut ? "Sold out" : "Add to bag"}</span></span>
          {chosenOut ? null : (
            <span className="cf-submit-arrow" aria-hidden="true">
              &rarr;
            </span>
          )}
        </button>
        </>
      )}

      {/* Buy now: the same add, then straight to the bag, where delivery
          details and payment are. Same checks, same stock gate; it is a
          shortcut past "View bag", not a separate way to pay. */}
      {compact || allOut || chosenOut ? null : (
        <button
          type="button"
          className="cf-submit atb-buy"
          onClick={() => {
            if (addChosen()) router.push("/bag");
          }}
        >
          <span className="roll"><span>Buy now</span></span>
        </button>
      )}

      {/* True as stated: payment is taken on SumUp's hosted checkout over
          HTTPS (lib/sumup.ts), never on a form on this site. */}
      {compact ? null : <p className="atb-secure">
        <svg width="11" height="13" viewBox="0 0 11 13" fill="none" aria-hidden="true">
          <rect x="0.75" y="5.75" width="9.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <path d="M2.75 5.75V3.9a2.75 2.75 0 0 1 5.5 0v1.85" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        Secure checkout
      </p>}

      {/* A polite live region that exists before the add, so it is announced
          when it fills. It names the size and the colour, because "added to
          bag" is not enough information to catch a mistake. */}
      <div className="atb-status" role="status" aria-live="polite">
        {added ? (
          <p className="atb-added" key={added.n}>
            Added{!compact && added.qty > 1 ? ` ${added.qty}` : ""}
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
