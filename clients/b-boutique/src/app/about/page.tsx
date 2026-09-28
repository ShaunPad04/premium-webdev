import "@/app/offhome.css";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Visit } from "@/components/Visit";
import { AboutRooms } from "@/components/AboutRooms";
import { principles, shopPhotos, type ShopPhoto } from "@/lib/about";
import { owner, shop, openingPhrase } from "@/lib/shop";

export const metadata: Metadata = pageMeta({
  path: "/about",
  title: "About us",
  description:
    "B Boutique is an independent shop at 18 Sea View Street, Cleethorpes. Womenswear and homeware, chosen a piece at a time.",
});

/* /about — 2026-09-27, in the Shop by category's own language (Brad picked
 * that section's look as the one to follow, after three rounds of About
 * directions were turned down: a story scroll, a serif "luxury" pass, and
 * five concepts after luxury houses' About pages).
 *
 *   1. The shopfront as one rounded dark panel, "About B Boutique" in white
 *      capitals over it with the glass address tag. Top-anchored so the
 *      whole fascia, "Accessories & Homeware" included, always shows.
 *   2. Hayley: her portrait as a panel with her name on it, her words beside.
 *   3. Inside the shop: her four photos as hover-open panels, exactly like
 *      the categories (components/AboutRooms.tsx); swipe cards on a phone.
 *   4. The way we work: three columns, number tag, capitals.
 *   5. Visit, unchanged.
 *
 * Everything on it is her words (owner.bio), her photographs, or derived
 * from shop.ts. */

const src = (p: ShopPhoto) => `/img/about/${p.name}-${p.name === "shopfront" ? 1024 : 1920}.webp`;
/* Every width that was built, so a phone gets the 960 and a desktop panel
   the 1440 rather than every screen the 1920 (2026-09-28). */
const widths = (p: ShopPhoto) => (p.name === "shopfront" ? [640, 960, 1024] : [960, 1440, 1920]);
const srcSet = (p: ShopPhoto, ext: string) => widths(p).map((w) => `/img/about/${p.name}-${w}.${ext} ${w}w`).join(", ");
const room = (p: ShopPhoto, caption: string, pos: string) => ({
  src: src(p), avif: srcSet(p, "avif"), webp: srcSet(p, "webp"), alt: p.alt, caption, pos,
});

export default function AboutPage() {
  const { shopfront, railWindow, back, counter } = shopPhotos;
  const where = `${shop.street}, ${shop.town}`;

  return (
    <>
      <Nav solid />
      <main id="main" className="flex-1">
        <div className="hs">
          <section className="hs-hero" aria-labelledby="hs-title">
            {/* No photo panel at any size (Brad, 2026-09-27/28): only the
                page's h1 and hours, hidden visually, stay. The shopfront is
                still the first of the rooms below. */}
            <div className="hs-hero-d">
              <span className="hs-tag">{where}</span>
              <h1 id="hs-title" className="hs-hero-t">About B Boutique</h1>
              <p className="hs-hero-p">Open {openingPhrase()}</p>
            </div>
          </section>

          <section className="hs-owner" aria-labelledby="hs-owner">
            <div className="hs-panel hs-portrait">
              <picture>
                <source type="image/avif" srcSet={`/img/owner/${owner.portrait}-640.avif 640w, /img/owner/${owner.portrait}-800.avif 800w, /img/owner/${owner.portrait}.avif 1120w`} sizes="(min-width: 1024px) 40vw, 92vw" />
                <source type="image/webp" srcSet={`/img/owner/${owner.portrait}-640.webp 640w, /img/owner/${owner.portrait}-800.webp 800w, /img/owner/${owner.portrait}.webp 1120w`} sizes="(min-width: 1024px) 40vw, 92vw" />
                <img
                  src={`/img/owner/${owner.portrait}.webp`}
                  alt={`${owner.firstName} ${owner.lastName}, who owns B Boutique.`}
                  /* Eager and first in the queue: with the hero photo gone
                     she is the largest thing on a phone's first screen. */
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
              <div className="hs-over">
                <span className="hs-tag">{owner.role}</span>
                <h2 id="hs-owner" className="hs-over-t">
                  {owner.firstName} {owner.lastName}
                </h2>
              </div>
            </div>
            <div className="hs-bio">
              <p className="hs-label">In her words</p>
              {owner.bio.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>
          </section>

          <section className="hs-inside" aria-labelledby="hs-inside">
            <div className="hs-head">
              <h2 id="hs-inside" className="hs-h">Inside the shop</h2>
            </div>
            <AboutRooms
              rooms={[
                room(shopfront, shopfront.caption, "50% 0%"),
                room(railWindow, "The rails", "50% 50%"),
                room(back, "Fitting rooms", "50% 50%"),
                room(counter, counter.caption, "50% 50%"),
              ]}
            />
          </section>

          <section className="hs-way" aria-labelledby="hs-way">
            <div className="hs-head">
              <h2 id="hs-way" className="hs-h">The way we work</h2>
            </div>
            <ol className="hs-way-list">
              {principles.map((p) => (
                <li key={p.n}>
                  <span className="hs-tag hs-tag--ink" aria-hidden="true">{p.n}</span>
                  <h3 className="hs-way-t">{p.title.replace(/\.$/, "")}</h3>
                  <p>{p.body}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <Visit />
      </main>
      <Footer />
    </>
  );
}
