"use client";

import type { Product } from "@/lib/catalogue";
import { useColour } from "./ColourChoice";
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
 * ── The swatches are NOT here any more ──────────────────────────────────
 * They were, for a few hours, laid over the photograph. That gave the page
 * two controls for one decision — swatches that moved the picture and a
 * Colour radio group beside the size that decided what went in the bag —
 * which could disagree: camel on screen, burgundy in the bag.
 *
 * The client asked for the selector to sit "near the sizing like an ecommerce
 * store", which is the same fix from the other side. AddToBag owns the
 * control; this component is its output. The state is shared through
 * ColourChoice.tsx.
 */
export function ProductGallery({ product }: { product: Product }) {
  /* Shared with the buy panel. The swatch row that used to live over this
     photograph is gone: the Colour control beside the size is the one
     control, and this is its output. See ColourChoice.tsx. */
  const { index: active } = useColour();
  const square = product.category === "Homeware";

  return (
    <div className="pdp-media" data-square={square ? "" : undefined}>
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

      {/* The colour of the frame on screen, in words, for everyone. On a
          single-colourway piece this is the only place the colour is stated
          at all, which is why it renders either way. */}
      <p className="pdp-colour-now" aria-live="polite">
        {product.colourways[active].colour}
      </p>
    </div>
  );
}
