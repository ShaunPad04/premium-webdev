import { directionsHref } from "@/lib/nav";
import { openingPhrase, shop } from "@/lib/shop";

/* One compact Visit block (2026-09-24, Brad): the only place on the home
 * page that states the address and the hours. The full week and the map
 * live on /contact. No map embed here, so nothing third-party loads. */
export function VisitCompact() {
  return (
    <section id="visit" className="vc" aria-labelledby="vc-h">
      <h2 id="vc-h" className="vc-h">Visit the shop</h2>
      <p className="vc-addr">
        {shop.street}, {shop.town} {shop.postcode}
      </p>
      <p className="vc-hours">Open {openingPhrase()}.</p>
      <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="vc-link">
        Get directions <span aria-hidden="true">&#8599;</span>
      </a>
    </section>
  );
}
