import Link from "next/link";

import { formatPriceShort } from "@/lib/catalogue";
import { showDrafts } from "@/lib/drafts";
import { looks } from "@/lib/edit";
import { stocklist } from "@/lib/stocklist";

/* The Edit (2026-09-24, Brad): three looks, each one large photograph with
 * numbered hotspots on the pieces and a "Shop the look" list under it. On a
 * phone the three looks are a swipeable row, so the section costs one screen
 * rather than three.
 *
 * The images are generated drafts awaiting Hayley's approval (see
 * lib/edit.ts), so the whole section renders on previews only. It needs no
 * JavaScript: the hotspots are links, and "Shop the look" is a native
 * <details>. */

function piece(slug: string) {
  const p = stocklist.find((s) => s.slug === slug);
  if (!p) throw new Error(`The Edit names a piece that is not in the stocklist: ${slug}`);
  return {
    slug,
    name: p.name,
    price: p.colourways.every((c) => c.priceConfirmed) ? formatPriceShort(p.colourways[0].priceP) : "Price to confirm",
  };
}

export function TheEdit() {
  if (!showDrafts) return null;

  return (
    <section className="edit" aria-labelledby="edit-h">
      <div className="edit-head">
        <h2 id="edit-h" className="edit-h">The Edit</h2>
        <p className="edit-sub">Three ways to wear what is on the rail now.</p>
        <p className="draft-flag">Draft: generated images, Hayley to approve before this goes live</p>
      </div>
      <ul className="edit-row">
        {looks.map((look) => {
          const items = look.pieces.map((x) => ({ ...piece(x.slug), at: x.at }));
          return (
            <li key={look.id} className="edit-look">
              <div className="edit-frame">
                <picture>
                  <source type="image/avif" srcSet={`/img/edit/${look.image}-900.avif 900w, /img/edit/${look.image}-1400.avif 1400w`} sizes="(min-width: 1024px) 33vw, 84vw" />
                  <source type="image/webp" srcSet={`/img/edit/${look.image}-900.webp 900w, /img/edit/${look.image}-1400.webp 1400w`} sizes="(min-width: 1024px) 33vw, 84vw" />
                  <img src={`/img/edit/${look.image}-900.jpg`} alt={look.alt} width={900} height={1200} loading="lazy" decoding="async" className="edit-img" />
                </picture>
                {items.map((it, i) => (
                  <Link
                    key={it.slug}
                    href={`/shop/${it.slug}`}
                    className="edit-dot"
                    style={{ left: `${it.at[0]}%`, top: `${it.at[1]}%` }}
                    aria-label={`${it.name}, ${it.price}`}
                  >
                    {i + 1}
                  </Link>
                ))}
              </div>
              <h3 className="edit-title">{look.title}</h3>
              <details className="edit-shop">
                <summary className="edit-btn">Shop the look</summary>
                <ol className="edit-list">
                  {items.map((it) => (
                    <li key={it.slug}>
                      <Link href={`/shop/${it.slug}`} className="edit-item">
                        <span>{it.name}</span>
                        <span className="edit-price">{it.price}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </details>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
