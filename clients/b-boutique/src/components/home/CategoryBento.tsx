import Image from "next/image";
import Link from "next/link";

import { products } from "@/lib/catalogue";
import { featured } from "@/lib/shop";

/* Shop by category (2026-09-24, Brad's editorial rebuild): four clothing
 * tiles in a 2x2 and one wide homeware tile under them. It replaced the
 * bento with its "Shop all" tile. Counts come from the catalogue at build time, so a
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
        <h2 id="bento-h" className="bento-h">Shop by category</h2>
      </div>
      <ul className="bento-grid">
        {sorted.map((t) => (
          <li key={t.slug} className={`bento-t${t.slug === "homeware" ? " bento-t--wide" : ""}`}>
            <Link href={t.href} className="bento-link">
              {/* next/image, so each tile gets a file its own size. Raw <img>
                  here sent the full 700 KB originals and measurably slowed
                  the phone's first paint (2026-09-24). */}
              <Image
                src={t.image}
                alt={t.alt}
                fill
                sizes={t.slug === "homeware" ? "100vw" : "50vw"}
                quality={70}
                className="bento-img"
              />
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
</ul>
    </section>
  );
}
