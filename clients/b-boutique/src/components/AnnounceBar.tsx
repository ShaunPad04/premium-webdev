import Link from "next/link";

import {
  DELIVERY_P,
  FREE_DELIVERY_OVER_P,
  formatPriceShort,
} from "@/lib/catalogue";
import { openingSummary, shop } from "@/lib/shop";

/* The announcement bar, above the header.
 *
 * The client asked for the free-delivery threshold up here, in our own words,
 * with a couple of other things suited to the shop.
 *
 * ── Every line is a confirmed fact, and derived rather than typed ──────────
 * This is the single most prominent piece of copy on the site — it is above
 * everything, on every route — so it is also the worst possible place for an
 * unverified claim. Nothing here is written as a literal:
 *
 *   1. The threshold and the postage both come from FREE_DELIVERY_OVER_P and
 *      DELIVERY_P, the SAME constants /api/checkout prices the basket with.
 *      A bar promising free delivery over £120 while the checkout charged at
 *      a different figure would be a term of the contract of sale that the
 *      shop then broke. It cannot drift, because there is one number.
 *   2. The hours come from `openingSummary()`, so this bar changed format
 *      with the rest of the site when the client asked for 10:00 - 16:00 and
 *      nobody had to remember it existed.
 *   3. The street and town come from `shop`.
 *
 * `formatPriceShort` exists for line 1: "over £120" is how a shop writes it,
 * "over £120.00" is how a spreadsheet does, and the two pence that are never
 * there read as a price that might change.
 *
 * ── No JavaScript, and no rotation ────────────────────────────────────────
 * The obvious build is a rotating carousel of the three. It is not here, and
 * the reason is worth stating rather than discovering later: a rotator makes
 * this a client component, puts a timer on every route, and asks a reader to
 * wait to find out what the shop's delivery costs. Three short lines fit
 * side by side on a desktop at once.
 *
 * On a phone only the delivery line survives — it is the one that changes a
 * purchase decision, and the other two are answered in full by the Service
 * band and by Visit further down. That is the COS/Arket treatment and it
 * costs nothing to render.
 *
 * ── Not sticky ────────────────────────────────────────────────────────────
 * It sits above the fixed header and scrolls away with the page; the header
 * itself stays. An announcement that follows a reader down forty screens has
 * stopped being an announcement and become furniture, and on a phone it
 * would be permanently eating a line of a 100svh hero. */
export function AnnounceBar() {
  return (
    <aside aria-label="Shop announcements" className="announce">
      <ul className="announce-list">
        <li className="announce-item">
          {/* The one line that changes a decision, so it is the one line a
              phone keeps, and the only one that is a link — somebody reading
              it is asking what delivery costs, and /delivery answers in
              full. */}
          <Link href="/delivery" className="announce-link">
            Free UK delivery on orders over{" "}
            {formatPriceShort(FREE_DELIVERY_OVER_P)}
          </Link>
        </li>

        <li className="announce-item announce-item--wide">
          Royal Mail next working day, {formatPriceShort(DELIVERY_P)}
        </li>

        <li className="announce-item announce-item--wide">
          {/* Trailing full stop removed — openingSummary owns its own
              punctuation for a sentence, and this is a label. */}
          {openingSummary().replace(/\.$/, "")} on {shop.street}
        </li>
      </ul>
    </aside>
  );
}
