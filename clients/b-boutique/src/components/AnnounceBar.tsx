import Link from "next/link";

import { FREE_DELIVERY_OVER_P, formatPriceShort } from "@/lib/catalogue";

/* The announcement bar, above the header.
 *
 * Rewritten 2026-09-23. The client said the old strip (9px tracked capitals
 * on near-black) "looks cheap", and asked for three things in our own words:
 * free UK delivery over £120, limited releases, and new clothing weekly.
 * It is now set in the display face's italic (Playfair Display), in sentence case, on
 * the site's ink. (Briefly Mulberry; the client rejected the purple.)
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
            {/* Shorter on phones (2026-09-24, Brad: the £120 was cut off at
                390px). One of the two spans is display:none per breakpoint,
                so it is never read twice. */}
            <span className="announce-long">Complimentary UK delivery on orders over </span>
            <span className="announce-short">Free UK delivery over </span>
            {formatPriceShort(FREE_DELIVERY_OVER_P)}
          </Link>
        </li>
        {/* 2026-09-24, Brad: stop saying what the page says again. "Rarely
            restocked" and "new pieces regularly" are now the marquee's and
            the newsletter's lines; these two are facts said nowhere else in
            this strip's position. 14 days is the confirmed returns window
            (lib/policies.ts); reserving is the product page's new option. */}
        <li className="announce-item">Returns within 14 days</li>
        <li className="announce-item">Reserve a piece to try on in the shop</li>
      </ul>
    </aside>
  );
}
