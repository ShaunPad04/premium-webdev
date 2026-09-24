import Link from "next/link";

import { products } from "@/lib/catalogue";
import { featured } from "@/lib/shop";

/* Categories as a bento grid (2026-09-24, Brad), replacing the five equal
 * columns. One large tile, the rest arranged around it, and a "Shop all"
 * tile to close the set. Counts come from the catalogue at build time, so a
 * tile never promises a rail that is empty. Images and alt text are the
 * featured set's own (lib/shop.ts). Hover: the photograph settles in and the
 * arrow moves; transform only. */

const COUNT_FOR: Record<string, string> = {
  jackets: "Coats & Jackets",
  trousers: "Trousers",
  dresses: "Dresses",
  knitwear: "Knitwear",
  homeware: "Homeware",
};

export function CategoryBento() {
  const tiles = featured.map((f) => {
    const cat = COUNT_FOR[f.slug];
    const n = cat ? products.filter((p) => p.category === cat).length : 0;
    return { ...f, n };
  });
  const order = ["knitwear", "jackets", "trousers", "dresses", "homeware"];
  const sorted = order.map((s) => tiles.find((t) => t.slug === s)).filter((t): t is (typeof tiles)[number] => Boolean(t));

  return (
    <section className="bento" aria-labelledby="bento-h">
      <div className="bento-head">
        <p className="bento-eyebrow">Shop by category</p>
        <h2 id="bento-h" className="bento-h">
          Find your <em>rail.</em>
        </h2>
      </div>
      <ul className="bento-grid">
        {sorted.map((t, i) => (
          <li key={t.slug} className={`bento-t bento-t--${i}`}>
            <Link href={t.href} className="bento-link">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.image} alt={t.alt} loading="lazy" decoding="async" className="bento-img" />
              <span className="bento-scrim" aria-hidden="true" />
              <span className="bento-t-body">
                <span className="bento-name">{t.name}</span>
                {t.n > 0 ? <span className="bento-n">{t.n} {t.n === 1 ? "piece" : "pieces"}</span> : null}
              </span>
              <span className="bento-arrow" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 12 12 4M6 4h6v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
              </span>
            </Link>
          </li>
        ))}
        <li className="bento-t bento-t--all">
          <Link href="/shop" className="bento-link bento-link--all">
            <span className="bento-all-k">Everything in</span>
            <span className="bento-all-h">Shop all <span aria-hidden="true">&rarr;</span></span>
            <span className="bento-n">{products.length} pieces</span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
