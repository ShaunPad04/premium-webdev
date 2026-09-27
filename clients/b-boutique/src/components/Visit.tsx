import { shop, openingSummary } from "@/lib/shop";
import { directionsHref, mapEmbedSrc } from "@/lib/nav";
import { OpenNow } from "./OpenNow";
import { VisitMap } from "./VisitMap";

/* Visit B Boutique, redesigned 2026-09-24 (Brad's spec): the product page's
 * centred container, a 5/7 grid, details left and map right at the same
 * height; on a phone the map first at 4:3, details under it.
 *
 * Every value derives from shop.ts, so the address, hours, directions link
 * and JSON-LD cannot disagree.
 *
 * ── Email, not phone ──────────────────────────────────────────────────────
 * Email row and "Email the shop" (Brad, 2026-09-24: "change the phone
 * number to email"); the site carries no phone number at the client's
 * request. Parking (shop.parking) confirmed via Brad on 2026-09-24. */
export function Visit() {
  const hoursLine = openingSummary().replace(/\.$/, "").replace(/^Every day, /, "");
  const everyDay = openingSummary().startsWith("Every day");

  return (
    <section id="visit" aria-labelledby="visit-heading" className="vx">
      <div className="vx-inner">
        <div className="vx-info">
          <p className="visit-eyebrow">Visit B Boutique</p>
          <h2 id="visit-heading" className="visit-address">
            <span>{shop.street}</span>
            <span>{shop.town}</span>
            <span>{shop.postcode}</span>
          </h2>

          <OpenNow />

          {/* The details as three rounded cards, each with its icon
              (2026-09-27, Brad: "bland"; "in some form of shape"). Still a
              <dl>: each card is a term and its value. The email and parking
              cards are links across their whole area. */}
          <dl className="vx-cards">
            <div className="vx-cardi">
              <span className="vx-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" /><path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </span>
              <dt>Opening hours</dt>
              <dd>{everyDay ? `Every day, ${hoursLine}` : openingSummary()}</dd>
            </div>
            {shop.email ? (
              <div className="vx-cardi vx-cardi--link">
                <span className="vx-ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="m4.5 7 7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <dt>Email</dt>
                <dd><a href={`mailto:${shop.email}`} className="vx-cardi-a">{shop.email}</a></dd>
              </div>
            ) : null}
            <div className="vx-cardi vx-cardi--link">
              <span className="vx-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.5" /><path d="M10 16.5v-9h2.8a2.6 2.6 0 0 1 0 5.2H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <dt>Parking</dt>
              <dd>
                <a href={shop.parking.href} target="_blank" rel="noopener noreferrer" className="vx-cardi-a">
                  {shop.parking.name}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <span className="vx-cardi-note">{shop.parking.note}</span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="vx-map">
          <VisitMap
            name={shop.name}
            street={shop.street}
            town={shop.town}
            embedSrc={mapEmbedSrc}
            directionsHref={directionsHref}
          />
        </div>
      </div>
    </section>
  );
}
