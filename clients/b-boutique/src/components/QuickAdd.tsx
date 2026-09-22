"use client";

import { useState } from "react";

import type { Product } from "@/lib/catalogue";
import { useCart } from "@/lib/useCart";
import { variantId } from "@/lib/variants";

/* Add to bag from the grid, for the pieces where that is an honest offer.
 *
 * ── Why this is NOT on every card ────────────────────────────────────────
 * The product page refuses to preselect a size, on the grounds that
 * preselecting a 10 sells a 10 to somebody who meant a 14 and did not notice.
 * A quick-add button carries exactly the same risk in a smaller space, so it
 * is only rendered where there is genuinely nothing to choose:
 *
 *   ONE size AND ONE colourway AND a confirmed price.
 *
 * That is 12 of her 32 pieces — mostly the one-size knitwear and the three
 * homeware objects. The other 20 have a real decision in them and the card
 * takes you to the page where it can be made properly. No "quick add" that
 * opens a size picker: that is a link to the product page wearing a button's
 * clothes.
 *
 * ── Stock is checked on the press, not on render ─────────────────────────
 * A grid holds up to 32 cards. Fetching availability for all of them so a
 * button can style itself is 32 requests for a decision almost nobody makes,
 * on a page whose whole design is that it is static and fast.
 *
 * So the check happens when somebody actually presses: one request, for one
 * slug, at the only moment the answer matters. It costs a few hundred
 * milliseconds of "Checking…" on a press that was going to navigate to a
 * payment eventually anyway.
 *
 * `unknown` — nobody has counted it — adds, exactly as the product page does.
 * "We have not counted it" is not "it is gone", and the site must not make
 * the second statement on the strength of the first. /api/checkout is the
 * real gate and it re-checks server-side before taking a card.
 */

type State = "idle" | "checking" | "added" | "out" | "failed";

export function QuickAdd({ product }: { product: Product }) {
  const { add } = useCart();
  const [state, setState] = useState<State>("idle");

  const size = product.sizes[0];
  const colour = product.colourways[0].colour;

  async function onClick() {
    setState("checking");
    try {
      const r = await fetch(
        `/api/availability?slug=${encodeURIComponent(product.slug)}`,
      );
      const d: { variants?: Record<string, { state: string }> } = r.ok
        ? await r.json()
        : {};
      const v = d.variants?.[variantId(product.slug, size, colour)];
      if (v?.state === "out") {
        setState("out");
        return;
      }
    } catch {
      /* A dropped request must not close the shop. The bag and the checkout
         both price and re-check this line before anybody is charged, so
         adding on a failed lookup is the same position the product page
         takes when its own availability fetch fails. */
    }
    add(product.slug, size, colour);
    setState("added");
  }

  if (state === "out") {
    return (
      <p className="qa qa-msg" role="status">
        Sold out
      </p>
    );
  }

  return (
    <button
      type="button"
      className="qa"
      onClick={onClick}
      disabled={state === "checking"}
      /* Names the piece, because out of context "Add to bag" is the label on
         all twelve of these buttons and a screen reader reading the grid
         hears the same two words twelve times with nothing to tell them
         apart. The visible label stays two words. */
      aria-label={`Add ${product.name} to bag`}
      /* The card around this is one big link. Without this the press
         bubbles up and the browser follows the link mid-request, so the
         garment lands in the bag on a page the customer did not ask for. */
      onPointerDown={(e) => e.stopPropagation()}
    >
      {state === "checking" ? "Checking…" : state === "added" ? "Added" : "Add to bag"}
    </button>
  );
}
