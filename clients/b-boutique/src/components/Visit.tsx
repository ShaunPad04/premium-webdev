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

          <dl className="vx-rows">
            <div className="vx-row">
              <dt>Opening hours</dt>
              <dd>{everyDay ? `Every day, ${hoursLine}` : openingSummary()}</dd>
            </div>
            {shop.email ? (
              <div className="vx-row">
                <dt>Email</dt>
                <dd><a href={`mailto:${shop.email}`} className="vx-row-link">{shop.email}</a></dd>
              </div>
            ) : null}
            <div className="vx-row">
              <dt>Parking</dt>
              <dd>{shop.parking}</dd>
            </div>
          </dl>

          <div className="vx-ctas">
            <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="vx-btn vx-btn--solid">
              Get directions <span aria-hidden="true">&rarr;</span>
            </a>
            {shop.email ? (
              <a href={`mailto:${shop.email}`} className="vx-btn vx-btn--line">Email the shop</a>
            ) : null}
          </div>
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
