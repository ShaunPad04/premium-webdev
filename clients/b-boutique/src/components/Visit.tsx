import { shop, openingSummary } from "@/lib/shop";
import { directionsHref, mapEmbedSrc } from "@/lib/nav";
import { OpenNow } from "./OpenNow";
import { VisitMap } from "./VisitMap";
import { Arrow } from "./Arrow";

/* Visit B Boutique (2026-09-28). Brad picked C of three 21st.dev directions
 * (A "Location Card" with her shopfront, B "Contact Page" boxes): the
 * "Expanded Map" set into one listing card, like a shop in Google Maps. The
 * map on top (open on every screen, loading as Visit nears the screen), then the address
 * with open-now, the hours / parking / email as one-line rows, and Get
 * directions across the foot. It replaced a framed details box beside a
 * separate map card, which repeated the address and wrapped awkwardly on
 * a phone.
 *
 * Every value derives from shop.ts, so the address, hours, directions link
 * and JSON-LD cannot disagree. Email, not phone: the site carries no phone
 * number at the client's request. Parking (shop.parking) confirmed via Brad
 * on 2026-09-24. */
export function Visit() {
  const hours = openingSummary().replace(/\.$/, "");
  return (
    <section id="visit" aria-labelledby="visit-heading" className="vsc">
      <h2 id="visit-heading" className="vsc-h">Come in and see it</h2>
      <div className="vsc-card">
        <VisitMap src={mapEmbedSrc} label={shop.name} />
        <div className="vsc-body">
          <div className="vsc-top">
            <p className="vsc-addr">
              {shop.street}, {shop.town} <span className="vsc-pc">{shop.postcode}</span>
            </p>
            <OpenNow />
          </div>
          <dl className="vsc-rows">
            <div>
              <dt>Hours</dt>
              <dd>{hours}</dd>
            </div>
            <div>
              <dt>Parking</dt>
              <dd>
                <a href={shop.parking.href} target="_blank" rel="noopener noreferrer">
                  {shop.parking.name}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </dd>
            </div>
            {shop.email ? (
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${shop.email}`}>{shop.email}</a>
                </dd>
              </div>
            ) : null}
          </dl>
          <a className="vsc-go" href={directionsHref} target="_blank" rel="noopener noreferrer">
            Get directions <Arrow />
            <span className="sr-only"> (opens Google Maps in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
