"use client";

import { useState } from "react";

import type { Product } from "@/lib/catalogue";
import { ProductPhoto } from "./ProductPhoto";

/* The colourway gallery.
 *
 * ── Why this is the biggest thing missing from the product page ─────────
 * Every piece in the shop has between one and three colourways, and the
 * client's stock dashboard supplied a SEPARATE PHOTOGRAPH OF EACH ONE — 54
 * photographs across 32 pieces. Until now the page showed the first and the
 * other 22 sat unused in public/img/product. A customer looking at the Long
 * Trench could read the word "Camel" in a list and had no way to see it.
 *
 * On a clothing site that is not a nicety. Colour is the single thing people
 * most want to look at before buying, and a list of colour NAMES with one
 * picture is the layout of a shop that does not have the pictures. This one
 * does.
 *
 * ── Why a client component, in a codebase that avoids them ──────────────
 * Swapping the main image on click is state, and there are only two honest
 * ways to do it without JavaScript: a link per colour that reloads the page,
 * or the CSS radio-and-sibling-selector trick. The reload is worse UX than
 * the thing it is saving; the CSS trick needs every image in the DOM anyway
 * and produces markup nobody can read six months later.
 *
 * So: one small client component, and the cost is contained deliberately.
 * Every colourway image is rendered — they are `loading="lazy"` except the
 * first, so a piece with three colours does not fetch three photographs
 * before the customer has asked for one — and the SERVER still renders the
 * whole page around it. Nothing else on the route becomes client.
 *
 * ── Single-colourway pieces ─────────────────────────────────────────────
 * Render no swatches at all. A row of one button is a control that cannot do
 * anything, and an inert control is worse than no control: it is announced
 * to a screen reader as if it worked.
 */
export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const many = product.colourways.length > 1;
  const square = product.category === "Homeware";

  return (
    <div className="pdp-media">
      {/* All colourways stay mounted and are switched with opacity rather
          than swapped in the DOM. Remounting an <img> on every click refetches
          nothing on a warm cache but DOES re-decode, which shows as a flash of
          empty frame on a slower machine — the one moment the customer is
          concentrating on the picture. */}
      {product.colourways.map((c, i) => (
        <div
          key={c.sku}
          className="pdp-frame"
          data-active={i === active ? "" : undefined}
          aria-hidden={i === active ? undefined : "true"}
        >
          <ProductPhoto
            photo={c.image}
            square={square}
            /* Names the piece and the colour, and stops. The colour is the
               supplier's own name off the supplier's own reference code, so
               it is a fact rather than a reading of the picture. Nothing about
               the cut, the length or the fit — those would be claims sourced
               from a generated image. */
            alt={`${product.name} in ${c.colour}`}
            sizes="(min-width: 1024px) 52vw, 100vw"
            priority={i === 0}
            className="absolute inset-0 h-full w-full"
          />
        </div>
      ))}

      {many ? (
        /* A radiogroup, not a list of buttons. "Burgundy, selected, 1 of 3"
           is what a screen reader should say here, and arrow keys should move
           between them — which is what radio semantics give for free and what
           a row of <button>s does not. */
        <div
          role="radiogroup"
          aria-label={`Colour — ${product.name}`}
          className="pdp-swatches"
        >
          {product.colourways.map((c, i) => (
            <button
              key={c.sku}
              type="button"
              role="radio"
              aria-checked={i === active}
              onClick={() => setActive(i)}
              className="pdp-swatch"
              data-active={i === active ? "" : undefined}
            >
              {/* The thumbnail IS the swatch. A coloured dot would mean
                  deciding what "Zebra Print" or "Red check" looks like as a
                  single hex value, which is a guess about a garment — and the
                  photograph is both honest and more useful. */}
              <ProductPhoto
                photo={c.image}
                square={square}
                alt=""
                sizes="72px"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="sr-only">{c.colour}</span>
            </button>
          ))}
        </div>
      ) : null}

      {/* The colour of the frame on screen, in words, for everyone. On a
          single-colourway piece this is the only place the colour is stated
          at all, which is why it renders either way. */}
      <p className="pdp-colour-now" aria-live="polite">
        {product.colourways[active].colour}
      </p>
    </div>
  );
}
