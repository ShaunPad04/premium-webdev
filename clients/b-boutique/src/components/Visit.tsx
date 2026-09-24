import { shop, phoneDisplay, openingSummary } from "@/lib/shop";
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
 * ── Rows that are only shown when there is something true to show ───────
 * Phone and "Call the shop" read shop.phone, which is empty: the client
 * asked for phone numbers to come off the site (see shop.ts). Put a number
 * back there and both appear. Parking is not shown at all: no parking
 * detail has been confirmed, and "a two-minute walk to the car park" is a
 * checkable claim about a real street. CLIENT INPUT REQUIRED if wanted. */
export function Visit() {
  const tel = shop.phone ? `tel:${shop.phone.replace(/\s+/g, "")}` : "";
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
            {shop.phone ? (
              <div className="vx-row">
                <dt>Phone</dt>
                <dd><a href={tel} className="vx-row-link">{phoneDisplay}</a></dd>
              </div>
            ) : null}
          </dl>

          <div className="vx-ctas">
            <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="vx-btn vx-btn--solid">
              Get directions <span aria-hidden="true">&rarr;</span>
            </a>
            {shop.phone ? (
              <a href={tel} className="vx-btn vx-btn--line">Call the shop</a>
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
