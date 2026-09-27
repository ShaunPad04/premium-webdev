import type { Metadata } from "next";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Visit } from "@/components/Visit";
import { AboutRooms } from "@/components/AboutRooms";
import { principles, shopPhotos, type ShopPhoto } from "@/lib/about";
import { owner, shop, openingPhrase } from "@/lib/shop";

export const metadata: Metadata = {
  title: "About us",
  description:
    "B Boutique is an independent shop at 18 Sea View Street, Cleethorpes. Womenswear and homeware, chosen a piece at a time.",
  alternates: { canonical: "/about" },
};

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

export default function AboutPage() {
  const { shopfront, railWindow, back, counter } = shopPhotos;
  const where = `${shop.street}, ${shop.town}`;

  return (
    <>
      <Nav solid />
      <main id="main" className="flex-1">
        <div className="hs">
          <section className="hs-hero" aria-labelledby="hs-title">
            <picture>
              {/* Phones: no hero panel (Brad, 2026-09-27: "looks odd"), so no download either. */}
              <source media="(max-width: 767px)" srcSet="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
              <source type="image/avif" srcSet="/img/about/shopfront-640.avif 640w, /img/about/shopfront-1024.avif 1024w" sizes="100vw" />
              <img src={src(shopfront)} alt={shopfront.alt} fetchPriority="high" />
            </picture>
            <div className="hs-hero-d">
              <span className="hs-tag">{where}</span>
              <h1 id="hs-title" className="hs-hero-t">About B Boutique</h1>
              <p className="hs-hero-p">Open {openingPhrase()}</p>
            </div>
          </section>

          <section className="hs-owner" aria-labelledby="hs-owner">
            <div className="hs-panel hs-portrait">
              <img
                src={`/img/owner/${owner.portrait}.webp`}
                alt={`${owner.firstName} ${owner.lastName}, who owns B Boutique.`}
                loading="lazy"
              />
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
                { src: src(shopfront), alt: shopfront.alt, caption: shopfront.caption, pos: "50% 0%" },
                { src: src(railWindow), alt: railWindow.alt, caption: "The rails", pos: "50% 50%" },
                { src: src(back), alt: back.alt, caption: "Fitting rooms", pos: "50% 50%" },
                { src: src(counter), alt: counter.alt, caption: counter.caption, pos: "50% 50%" },
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
