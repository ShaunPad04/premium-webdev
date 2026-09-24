"use client";

import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useId } from "react";

import type { Product } from "@/lib/catalogue";
import { isBuyable } from "@/lib/catalogue";
import { newIn } from "@/lib/shop";

/* Shop filters and sort (2026-09-24, Brad). Category as chips with a sliding
 * active pill (the 21st.dev animated-tabs pattern, on motion's layoutId);
 * size, price, colour and sort as native selects dressed as pills, because a
 * native select is the best dropdown a phone has. Every option list is built
 * from the catalogue, so no filter can offer something the shop does not
 * hold. When one category is chosen, its banner shows above the grid. */

export type Filters = { cat: string; size: string; price: string; colour: string; sort: string };
export const NO_FILTERS: Filters = { cat: "All", size: "", price: "", colour: "", sort: "featured" };

const PRICES: { v: string; label: string; test: (p: number) => boolean }[] = [
  { v: "u40", label: "Under £40", test: (p) => p < 4000 },
  { v: "40-60", label: "£40 to £60", test: (p) => p >= 4000 && p <= 6000 },
  { v: "60+", label: "Over £60", test: (p) => p > 6000 },
];

const SIZE_ORDER = ["XXS", "XS", "S", "S-M", "M", "M-L", "L", "L-XL", "XL", "6", "8", "10", "12", "14", "16", "18", "One size"];
const sizeRank = (s: string) => {
  const i = SIZE_ORDER.indexOf(s);
  return i === -1 ? 999 : i;
};

const NEW = new Set(newIn.map((n) => n.slug));

export function applyFilters(list: Product[], f: Filters): Product[] {
  let out = list.filter(
    (p) =>
      (f.cat === "All" || p.category === f.cat) &&
      (!f.size || p.sizes.includes(f.size)) &&
      (!f.colour || p.colourways.some((c) => c.colour === f.colour)) &&
      (!f.price || (isBuyable(p) && PRICES.find((x) => x.v === f.price)!.test(p.priceP))),
  );
  if (f.sort === "new") out = [...out].sort((a, b) => Number(NEW.has(b.slug)) - Number(NEW.has(a.slug)));
  if (f.sort === "low") out = [...out].sort((a, b) => a.priceP - b.priceP);
  if (f.sort === "high") out = [...out].sort((a, b) => b.priceP - a.priceP);
  return out;
}

const BANNER: Record<string, { tex: string; line: string }> = {
  Knitwear: { tex: "knitwear", line: "Jumpers, cardigans and vests." },
  "Coats & Jackets": { tex: "coats-jackets", line: "Coats, jackets and bombers." },
  Trousers: { tex: "trousers", line: "Trousers and jeans." },
  Tops: { tex: "tops", line: "Blouses, shirts and tops." },
  "Co-ords": { tex: "co-ords", line: "Matching sets." },
  Dresses: { tex: "dresses", line: "Dresses, on the rails now." },
  Homeware: { tex: "homeware", line: "Vases and jars for the home." },
};

export function ShopFilters({
  items,
  value,
  onChange,
  count,
}: {
  items: Product[];
  value: Filters;
  onChange: (f: Filters) => void;
  count: number;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  const cats = ["All", ...Array.from(new Set(items.map((p) => p.category)))];
  const sizes = Array.from(new Set(items.flatMap((p) => p.sizes))).sort((a, b) => sizeRank(a) - sizeRank(b));
  const colours = Array.from(new Set(items.flatMap((p) => p.colourways.map((c) => c.colour)).filter(Boolean))).sort();
  const set = (k: keyof Filters, v: string) => onChange({ ...value, [k]: v });
  const active = value.size || value.price || value.colour || value.cat !== "All";
  const banner = value.cat !== "All" ? BANNER[value.cat] : undefined;

  return (
    <div className="sf">
      <LayoutGroup id={id}>
        <ul className="sf-cats" aria-label="Category">
          {cats.map((c) => {
            const on = value.cat === c;
            return (
              <li key={c}>
                <button type="button" className="sf-cat" aria-pressed={on} onClick={() => set("cat", c)}>
                  {on ? (
                    <motion.span
                      layoutId="sf-pill"
                      className="sf-pill"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }}
                    />
                  ) : null}
                  <span className="sf-cat-t">{c}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </LayoutGroup>

      <div className="sf-row">
        <label className="sf-sel">
          <span className="sr-only">Size</span>
          <select value={value.size} onChange={(e) => set("size", e.target.value)}>
            <option value="">All sizes</option>
            {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="sf-sel">
          <span className="sr-only">Price</span>
          <select value={value.price} onChange={(e) => set("price", e.target.value)}>
            <option value="">Any price</option>
            {PRICES.map((p) => <option key={p.v} value={p.v}>{p.label}</option>)}
          </select>
        </label>
        <label className="sf-sel">
          <span className="sr-only">Colour</span>
          <select value={value.colour} onChange={(e) => set("colour", e.target.value)}>
            <option value="">All colours</option>
            {colours.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="sf-sel sf-sort">
          <span className="sf-sort-k">Sort</span>
          <select value={value.sort} onChange={(e) => set("sort", e.target.value)}>
            <option value="featured">Featured</option>
            <option value="new">New in first</option>
            <option value="low">Price, low to high</option>
            <option value="high">Price, high to low</option>
          </select>
        </label>
        <p className="sf-count" aria-live="polite">
          {count} {count === 1 ? "piece" : "pieces"}
        </p>
        {active ? (
          <button type="button" className="sf-clear" onClick={() => onChange({ ...NO_FILTERS, sort: value.sort })}>
            Clear filters
          </button>
        ) : null}
      </div>

      {banner ? (
        <div className="sf-banner" key={value.cat}>
          <picture>
            <source media="(max-width: 767px)" type="image/avif" srcSet={`/img/texture/${banner.tex}-m.avif`} />
            <source type="image/avif" srcSet={`/img/texture/${banner.tex}.avif`} />
            <source type="image/webp" srcSet={`/img/texture/${banner.tex}.webp`} />
                <img src={`/img/texture/${banner.tex}.jpg`} alt="" className="sf-banner-img" />
          </picture>
          <div className="sf-banner-t">
            <h2 className="sf-banner-h">{value.cat}</h2>
            <p className="sf-banner-p">{banner.line}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
