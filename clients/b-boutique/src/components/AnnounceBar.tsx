import Link from "next/link";

import { FREE_DELIVERY_OVER_P, formatPriceShort } from "@/lib/catalogue";

/* The announcement bar, above the header.
 *
 * Rewritten 2026-09-23. The client said the old strip (9px tracked capitals
 * on near-black) "looks cheap", and asked for three things in our own words:
 * free UK delivery over £120, limited releases, and new clothing weekly.
 * It is now Mulberry, the dark he chose for the site, set in the Bodoni
 * italic the headings use, in sentence case.
 *
 * ── Every line has to be true, because this is on every route ──────────────
 *   1. Delivery: the threshold comes from FREE_DELIVERY_OVER_P, the SAME
 *      constant /api/checkout prices the basket with, so the bar and the
 *      till cannot disagree. "Complimentary" is only wording; it is free.
 *   2. "Limited pieces, rarely restocked": her own words are "We try not to
 *      reorder items, so that we can keep the stock fresh and moving"
 *      (lib/about.ts). That supports "rarely restocked". It does NOT support
 *      "exclusive", "drops", a countdown or a number left, so none of those
 *      appear.
 *   3. "New pieces arriving regularly": her owner bio says "we regularly
 *      introduce new stock". The client asked for WEEKLY; nobody has
 *      confirmed a weekly delivery, so it says regularly.
 *      CLIENT INPUT REQUIRED: if Hayley confirms new stock every week, this
 *      line can say "New pieces every week".
 *
 * ── Layout ────────────────────────────────────────────────────────────────
 * Desktop: all three on one line, hairline between. Phone: one at a time in
 * the same slot, a slow CSS cross-fade (no JavaScript, no timer, nothing on
 * the main thread). Every line stays in the DOM, so a screen reader reads
 * all three regardless. Reduced motion: the delivery line only, still.
 *
 * Not sticky: it scrolls away and the header stays (see Nav). The strip's
 * height is kept at ~33px, which the header offsets elsewhere depend on. */
export function AnnounceBar() {
  return (
    <aside aria-label="Shop announcements" className="announce">
      <ul className="announce-list">
        <li className="announce-item">
          <Link href="/delivery" className="announce-link">
            Complimentary UK delivery on orders over{" "}
            {formatPriceShort(FREE_DELIVERY_OVER_P)}
          </Link>
        </li>
        <li className="announce-item">Limited pieces, rarely restocked</li>
        <li className="announce-item">New pieces arriving regularly</li>
      </ul>
    </aside>
  );
}
