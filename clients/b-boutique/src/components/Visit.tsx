import { shop, hours, formatHour, phoneDisplay } from "@/lib/shop";
import { directionsHref, mapEmbedSrc } from "@/lib/nav";
import { VisitMap } from "./VisitMap";

/* The conversion point. Not a basket — a postcode.
 *
 * Every value here derives from shop.ts: the address, the coordinates behind
 * the map, the directions link and the hours table. There is no second copy
 * of any of it, so a change there changes this and the JSON-LD together.
 *
 * ── Two things deliberately absent ────────────────────────────────────────
 * The parking sentence is gone. "On-street parking at the top, and the Market
 * Place car park is a two-minute walk" is a checkable local claim that nobody
 * has confirmed, and the address confirmation does not cover it. It is not
 * softened or hedged here — it is simply not asserted.
 *
 * The live "open now" badge is gone too. openState() read the VISITOR's clock,
 * not the shop's, so the badge told anyone outside UK time the wrong thing;
 * the table below says the same thing without ever being wrong. OpenBadge and
 * openState were deleted in the release cleanup — reinstate them together, and
 * timezone-aware, if the badge is ever wanted back. */
export function Visit() {
  return (
    <section id="visit" aria-labelledby="visit-heading" className="visit">
      <div className="visit-inner">
        <div className="visit-info">
          <p className="visit-eyebrow">Visit B Boutique</p>

          <h2 id="visit-heading" className="visit-address">
            <span>{shop.street}</span>
            <span>{shop.town}</span>
            <span>{shop.postcode}</span>
          </h2>

          <a
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="visit-cta"
          >
            Get directions <span className="visit-cta-arrow" aria-hidden="true">&rarr;</span>
          </a>

          {/* The phone number, now that there is one. Client-confirmed
              2026-09-06; before that this block did not exist, because the
              only honest thing to print was nothing. `tel:` with the spaces
              stripped so a phone dials it, the readable form on screen. */}
          {shop.phone ? (
            <p className="visit-phone">
              <span className="visit-phone-label">Call the shop</span>
              <a href={`tel:${shop.phone.replace(/\s+/g, "")}`} className="visit-phone-link">
                {phoneDisplay}
              </a>
            </p>
          ) : null}

          <div className="visit-hours">
            <h3 className="visit-hours-label">Opening hours</h3>
            <dl className="visit-hours-list">
              {hours.map((d) => (
                <div key={d.day} className="visit-hours-row">
                  <dt>{d.day}</dt>
                  <dd className={d.hours ? "" : "is-closed"}>
                    {d.hours
                      ? `${formatHour(d.hours.open)} — ${formatHour(d.hours.close)}`
                      : "Closed"}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="visit-map">
          <VisitMap
            street={shop.street}
            town={shop.town}
            postcode={shop.postcode}
            embedSrc={mapEmbedSrc}
            directionsHref={directionsHref}
            title={`Map showing ${shop.name}, ${shop.street}, ${shop.town} ${shop.postcode}`}
          />
        </div>
      </div>
    </section>
  );
}
