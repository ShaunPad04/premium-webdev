import Link from "@/components/Link";

import { newIn } from "@/lib/shop";
import { packshotFor } from "@/lib/packshots";
import { wasPriceP } from "@/lib/catalogue";
import { HoverPhoto } from "./HoverPhoto";
import { ProductPhoto } from "./ProductPhoto";
import { Price } from "./Price";

/* New arrivals as product cards (2026-09-29, Brad, after the Sabina and
 * Veon templates): the first NEW_ARRIVALS `newIn` pieces, three across on a
 * desktop, each on its own on a light-grey card (her packshot; the white
 * ground is multiplied into the grey) and, where a pointer can hover, the
 * model photograph on hover. Name and price under it. The badge is "£10 off"
 * only where the piece is really in her sale (wasPriceP); never "Best
 * seller", which nobody has measured. The pieces after these are the Shop
 * the collection slides below (NewInSlides.tsx). Owns #new-in, so every
 * "/#new-in" link lands here. Uses the category row's container and heading
 * classes. */
export const NEW_ARRIVALS = 6;
const SIZES = "(min-width: 1024px) 32vw, 46vw";

export function NewArrivals() {
  return (
    <section id="new-in" aria-labelledby="na-heading" className="na">
      <div className="ctab-inner">
        <div className="ctab-head">
          <h2 id="na-heading" className="ctab-h">New arrivals</h2>
          {/* No "Shop all" here (Brad, 2026-09-30): the hero's is just above. */}
        </div>
        <ul className="ccard-grid">
          {newIn.slice(0, NEW_ARRIVALS).map((p) => {
            const was = p.priced ? wasPriceP(p.priceP, p.slug) : null;
            const pack = packshotFor(p.photo);
            return (
              <li key={p.slug}>
                <Link href={`/shop/${p.slug}`} className="ccard">
                  <span className="ccard-media">
                    <ProductPhoto photo={pack ?? p.photo} alt="" sizes={SIZES} className="ccard-img" />
                    {pack ? <HoverPhoto photo={p.photo} square={false} sizes={SIZES} /> : null}
                    {was ? <span className="ccard-tag">£{(was - p.priceP) / 100} off</span> : null}
                  </span>
                  <span className="ccard-name">{p.name}</span>
                  <span className="ccard-price">{p.priced ? <Price priceP={p.priceP} slug={p.slug} /> : "Price to confirm"}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
