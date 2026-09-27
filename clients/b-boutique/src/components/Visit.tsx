import { shop, openingSummary } from "@/lib/shop";
import { directionsHref, mapEmbedSrc } from "@/lib/nav";
import { OpenNow } from "./OpenNow";
import { ExpandedMap } from "./ui/expanded-map";

/* Visit B Boutique (2026-09-27). Brad picked B, "Map", of three
 * 21st-ui-explore directions, then asked for a map from 21st.dev: the
 * details on the left (the address, open now, the hours, email, parking,
 * Get directions) and the Expanded Map card on the right, which opens into
 * the greyscale Google map. On a phone the card comes first.
 *
 * Every value derives from shop.ts, so the address, hours, directions link
 * and JSON-LD cannot disagree. Email, not phone: the site carries no phone
 * number at the client's request. Parking (shop.parking) confirmed via Brad
 * on 2026-09-24. */
const Arrow = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export function Visit() {
  const hoursLine = openingSummary().replace(/\.$/, "").replace(/^Every day, /, "");
  const everyDay = openingSummary().startsWith("Every day");

  return (
    <section id="visit" aria-labelledby="visit-heading" className="vxb">
      <div className="vxb-info">
        <p className="label vxb-eyebrow">Visit B Boutique</p>
        <h2 id="visit-heading" className="vxb-address">
          <span>{shop.street}</span>
          <span>{shop.town} <span className="vxb-pc">{shop.postcode}</span></span>
        </h2>
        <OpenNow />
        <p className="vxb-hours">{everyDay ? `Every day, ${hoursLine}` : openingSummary()}</p>
        <dl className="vxb-list">
          {shop.email ? (
            <div>
              <dt>Email</dt>
              <dd><a href={`mailto:${shop.email}`}>{shop.email}</a></dd>
            </div>
          ) : null}
          <div>
            <dt>Parking</dt>
            <dd>
              <a href={shop.parking.href} target="_blank" rel="noopener noreferrer">
                {shop.parking.name}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </dd>
          </div>
        </dl>
        <a className="vxb-go" href={directionsHref} target="_blank" rel="noopener noreferrer">
          Get directions <Arrow />
          <span className="sr-only"> (opens Google Maps in a new tab)</span>
        </a>
      </div>
      <div className="vxb-map">
        <ExpandedMap location={shop.name} sub={`${shop.street}, ${shop.town}`} latitude={shop.lat} longitude={shop.lng} embedSrc={mapEmbedSrc} />
      </div>
    </section>
  );
}
