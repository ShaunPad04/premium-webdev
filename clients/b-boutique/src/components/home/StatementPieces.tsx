import Link from "next/link";

import { isBuyable, products, type Product } from "@/lib/catalogue";
import { ProductPhoto } from "@/components/ProductPhoto";
import { Price } from "@/components/Price";
import { RevealText } from "@/components/RevealText";

/* The statement pieces, each shown once (2026-09-24, Brad, after the
 * homepage critique). This replaced the cinematic scroll scene, which ran to
 * ~7,100px on desktop for three garments: every piece appeared three times
 * (greyscale, colour with a full buy block, then again in an "All three"
 * strip), which put four complete product pages inside the home page.
 *
 * Now: one editorial row. A large photograph, the piece's number and
 * category, its name, its price, and a link to its own page, where the
 * colour, size and Add to bag live. Three across on a desktop; on a phone a
 * swipeable row that shows the next piece peeking in, so the section stays
 * about one screen tall.
 *
 * The pieces are DERIVED, as before: the three most expensive buyable
 * garments by the same priceP the checkout charges, so the selection follows
 * the stock. A server component; nothing here needs JavaScript. */
const PIECES: Product[] = [...products]
  .filter((p) => isBuyable(p) && p.category !== "Homeware")
  .sort((a, b) => b.priceP - a.priceP)
  .slice(0, 3);

const pad = (n: number) => String(n).padStart(2, "0");

export function StatementPieces() {
  if (PIECES.length === 0) return null;
  return (
    <section aria-labelledby="spx-h" className="cps spx">
      <div className="cps-intro">
        <p className="label cps-eyebrow">Treat yourself</p>
        <RevealText id="spx-h" className="cps-h">
          The <em>statement</em> pieces.
        </RevealText>
        {/* Her words, from the owner bio in shop.ts. */}
        <p className="cps-lede">
          Carefully selected pieces that are stylish, affordable and perfect for treating yourself.
        </p>
      </div>

      <ul className="spx-row">
        {PIECES.map((p, i) => (
          <li key={p.slug} className="spx-item">
            <Link href={`/shop/${p.slug}`} className="spx-card">
              <span className="spx-media">
                <ProductPhoto
                  photo={p.photo}
                  alt=""
                  sizes="(min-width: 1024px) 31vw, (min-width: 768px) 45vw, 78vw"
                  className="spx-img"
                />
              </span>
              <span className="spx-meta">
                {pad(i + 1)} / {pad(PIECES.length)} · {p.category}
              </span>
              <span className="spx-name">{p.name}</span>
              <span className="spx-price"><Price priceP={p.priceP} /></span>
              <span className="spx-view" aria-hidden="true">View piece <span className="spx-arrow">&rarr;</span></span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="spx-all">
        <Link href="/shop" className="spx-all-link">Shop everything <span aria-hidden="true">&rarr;</span></Link>
      </p>
    </section>
  );
}
