import Link from "next/link";

import { formatPriceShort } from "@/lib/catalogue";
import { newIn } from "@/lib/shop";
import { stocklist } from "@/lib/stocklist";
import { ProductPhoto } from "@/components/ProductPhoto";

/* Just in (2026-09-24, Brad): six pieces, no more. A swipeable row on a
 * phone (native scroll-snap, no script) and a single row on a desktop, where
 * hovering a card swaps to the piece's second colourway. Every piece has one
 * photograph today, so the swap only exists where a second colourway does;
 * nothing is faked for the rest. Server component: no JavaScript ships. */

const MAX = 6;

export function JustIn() {
  const pieces = newIn.slice(0, MAX).map((p) => {
    const second = stocklist.find((s) => s.slug === p.slug)?.colourways[1]?.image;
    return { ...p, second: second && second !== p.photo ? second : undefined };
  });

  return (
    <section id="new-in" className="ji" aria-labelledby="ji-h">
      <div className="ji-head">
        <h2 id="ji-h" className="ji-h">Just in</h2>
        <Link href="/shop" className="ji-all">
          See all <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
      <ul className="ji-row">
        {pieces.map((p) => (
          <li key={p.slug} className="ji-card">
            <Link href={`/shop/${p.slug}`} className="ji-link">
              <span className={`ji-photo${p.second ? " has-second" : ""}`}>
                <ProductPhoto
                  photo={p.photo}
                  square={p.category === "Homeware"}
                  sizes="(min-width: 1024px) 16vw, 62vw"
                  className="ji-img"
                />
                {p.second ? (
                  <ProductPhoto
                    photo={p.second}
                    sizes="(min-width: 1024px) 16vw, 62vw"
                    className="ji-img ji-img--second"
                  />
                ) : null}
              </span>
              <span className="ji-name">{p.name}</span>
              <span className="ji-price">{p.priced ? formatPriceShort(p.priceP) : "Price to confirm"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
