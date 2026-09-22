import type { Metadata } from "next";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { Visit } from "@/components/Visit";
import { philosophy, principles, shopPhotos, type ShopPhoto } from "@/lib/about";
import { owner, shop } from "@/lib/shop";

export const metadata: Metadata = {
  title: "About us",
  description:
    "B Boutique is an independent shop at 18 Sea View Street, Cleethorpes. Womenswear and homeware, chosen a piece at a time.",
  alternates: { canonical: "/about" },
};

/* /about — rebuilt 2026-09-22.
 *
 * The client called the old page "generic and bland" and said it read like an
 * FAQ. It was a dark masthead, a statement, and three numbered question-and-
 * answer rows under "How it works." — an FAQ in all but name, with no
 * photograph of the shop anywhere on the page about the shop.
 *
 * It is now an editorial story told mostly in HER photographs:
 *
 *   1. The rails, full-bleed, with the title set over them.
 *   2. The statement, on black and gold marble — the one AI image in the
 *      page's upper half, an abstract texture that echoes her real walls.
 *   3. Hayley, in her own words (owner.bio — the same copy the home page's
 *      owner card reads).
 *   4. Inside the shop: five of her photographs, captioned with what is in
 *      the frame and nothing else.
 *   5. Three principles, beside a boucle macro (the second AI texture).
 *   6. Visit, unchanged.
 *
 * The rule for the two generated images is recorded in
 * scripts/build-about.mjs: neither shows a shop, a product or a person, so
 * neither can say anything untrue about the business. Both carry alt="":
 * they are decoration, and describing them would announce a picture that
 * tells a screen-reader user nothing about B Boutique. */

function Pic({
  photo,
  sizes,
  className,
  priority = false,
}: {
  photo: ShopPhoto;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const set = (ext: string) =>
    photo.widths.map((w) => `/img/about/${photo.name}-${w}.${ext} ${Math.min(w, photo.w)}w`).join(", ");
  return (
    <picture>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      <img
        src={`/img/about/${photo.name}-${photo.widths[1] ?? photo.widths[0]}.jpg`}
        srcSet={set("jpg")}
        sizes={sizes}
        width={photo.w}
        height={photo.h}
        alt={photo.alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
      />
    </picture>
  );
}

const rails: ShopPhoto = {
  name: "rails",
  widths: [1280, 1920, 2560],
  w: 3840,
  h: 2160,
  alt: "Inside B Boutique: gold rails of clothing along a black and gold marble wall, with round mirrors and fitting rooms at the back.",
  caption: "",
};

export default function AboutPage() {
  const { walkin, mustard, fitting, window: win, homeware } = shopPhotos;

  return (
    <>
      <MotionLayer />
      <Nav />
      <main id="main" className="flex-1">
        {/* 1 ── The rails, and the title over them. */}
        <section aria-labelledby="ab-title" className="ab-hero">
          <Pic photo={rails} sizes="100vw" className="ab-hero-img" priority />
          <div className="ab-hero-scrim" aria-hidden="true" />
          <div className="ab-hero-copy">
            <p className="label ab-eyebrow">About us</p>
            <h1 id="ab-title" className="ab-title">
              The <em>boutique</em>.
            </h1>
            <p className="ab-hero-where">
              {shop.street}, {shop.town}
            </p>
          </div>
        </section>

        {/* 2 ── The statement, on marble. */}
        <section aria-labelledby="ab-statement" className="ab-marble">
          <picture>
            <source type="image/avif" srcSet="/img/about/marble-1024.avif" />
            <source type="image/webp" srcSet="/img/about/marble-1024.webp" />
            <img src="/img/about/marble-1024.jpg" alt="" className="ab-marble-img" loading="lazy" decoding="async" width={1024} height={688} />
          </picture>
          <div className="ab-marble-inner">
            <h2 id="ab-statement" className="ab-statement">
              {philosophy.statement}
            </h2>
            <p className="ab-lines">
              {philosophy.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
          </div>
        </section>

        {/* 3 ── Hayley, in her own words. */}
        <section aria-labelledby="ab-owner" className="ab-owner">
          <div className="ab-owner-inner">
            <div className="ab-owner-portrait">
              <picture>
                <source type="image/avif" srcSet={`/img/owner/${owner.portrait}.avif`} />
                <source type="image/webp" srcSet={`/img/owner/${owner.portrait}.webp`} />
                <img
                  src={`/img/owner/${owner.portrait}.jpg`}
                  alt={`${owner.firstName} ${owner.lastName}, who owns B Boutique.`}
                  className="ab-owner-img"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>
            <div className="ab-owner-body">
              <p className="label ab-kicker">{owner.role}</p>
              <h2 id="ab-owner" className="ab-owner-name">
                {owner.firstName} <em>{owner.lastName}</em>
              </h2>
              <blockquote className="ab-quote">
                {owner.bio.map((para) => (
                  <p key={para.slice(0, 24)}>{para}</p>
                ))}
              </blockquote>
            </div>
          </div>
        </section>

        {/* 4 ── Inside the shop. */}
        <section aria-labelledby="ab-inside" className="ab-inside">
          <div className="ab-inside-head">
            <p className="label ab-kicker">Inside</p>
            <h2 id="ab-inside" className="ab-h2">
              18 Sea View Street.
            </h2>
          </div>
          <div className="ab-gallery">
            <figure className="ab-fig ab-fig--a">
              <Pic photo={walkin} sizes="(min-width: 900px) 40vw, 92vw" className="ab-fig-img" />
              <figcaption>{walkin.caption}</figcaption>
            </figure>
            <figure className="ab-fig ab-fig--b">
              <Pic photo={mustard} sizes="(min-width: 900px) 50vw, 92vw" className="ab-fig-img" />
              <figcaption>{mustard.caption}</figcaption>
            </figure>
            <figure className="ab-fig ab-fig--c">
              <Pic photo={win} sizes="(min-width: 900px) 34vw, 80vw" className="ab-fig-img" />
              <figcaption>{win.caption}</figcaption>
            </figure>
            <figure className="ab-fig ab-fig--d">
              <Pic photo={fitting} sizes="(min-width: 900px) 30vw, 70vw" className="ab-fig-img" />
              <figcaption>{fitting.caption}</figcaption>
            </figure>
            <figure className="ab-fig ab-fig--e">
              <Pic photo={homeware} sizes="(min-width: 900px) 42vw, 92vw" className="ab-fig-img" />
              <figcaption>{homeware.caption}</figcaption>
            </figure>
          </div>
        </section>

        {/* 5 ── Three principles, beside the boucle. */}
        <section aria-labelledby="ab-way" className="ab-way">
          <div className="ab-way-media" aria-hidden="true">
            <picture>
              <source
                type="image/avif"
                srcSet="/img/about/boucle-640.avif 640w, /img/about/boucle-960.avif 960w, /img/about/boucle-1280.avif 1280w"
                sizes="(min-width: 900px) 36vw, 100vw"
              />
              <source
                type="image/webp"
                srcSet="/img/about/boucle-640.webp 640w, /img/about/boucle-960.webp 960w, /img/about/boucle-1280.webp 1280w"
                sizes="(min-width: 900px) 36vw, 100vw"
              />
              <img src="/img/about/boucle-960.jpg" alt="" className="ab-way-img" loading="lazy" decoding="async" width={2160} height={2688} />
            </picture>
          </div>
          <div className="ab-way-body">
            <p className="label ab-kicker">The way we work</p>
            <h2 id="ab-way" className="sr-only">
              The way we work
            </h2>
            <ol className="ab-principles">
              {principles.map((p) => (
                <li key={p.n} className="ab-principle">
                  <span className="ab-principle-n" aria-hidden="true">
                    {p.n}
                  </span>
                  <h3 className="ab-principle-t">{p.title}</h3>
                  <p className="ab-principle-b">{p.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <Visit />
      </main>
      <Footer />
    </>
  );
}
