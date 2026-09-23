import type { Metadata } from "next";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { Visit } from "@/components/Visit";
import { InsideRooms } from "@/components/InsideRooms";
import { principles, shopPhotos, type ShopPhoto } from "@/lib/about";
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
 *   1. A vintage still life, full-bleed, with the title set over it. (Her
 *      rails photo until 2026-09-23, replaced at the client's request with
 *      a generated image; her real photographs carry the rest of the page.)
 *   2. Hayley, in her own words (owner.bio — the same copy the home page's
 *      owner card reads).
 *   3. Inside the shop: five of her photographs in one 4:5 lookbook column,
 *      with a sticky numbered index (components/InsideRooms.tsx).
 *   4. Three principles, beside a boucle macro (the second AI texture).
 *   5. Visit, unchanged.
 *
 * The marble statement band that sat between 1 and 2 was taken off on
 * 2026-09-23 at the client's request ("the second image section is
 * terrible"). The statement itself still lives on the home page
 * (PointOfView reads the same `philosophy` copy).
 *
 * The rule for the generated image is recorded in
 * scripts/build-about.mjs: it shows no shop, product or person, so it
 * cannot say anything untrue about the business. It carries alt="":
 * it is decoration, and describing them would announce a picture that
 * tells a screen-reader user nothing about B Boutique. */

function Pic({
  photo,
  sizes,
  className,
  style,
  priority = false,
}: {
  photo: ShopPhoto;
  sizes: string;
  className?: string;
  style?: React.CSSProperties;
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
        style={style}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
      />
    </picture>
  );
}

/* A generated vintage still life, not her shop (see scripts/build-about.mjs).
   Decorative, so alt="": describing it would present an invented rail as
   something a customer could find at 18 Sea View Street. */
const vintage: ShopPhoto = {
  name: "vintage",
  widths: [1280, 1920, 2560],
  w: 3856,
  h: 2160,
  alt: "",
  caption: "",
};

export default function AboutPage() {
  const { shopfront, railWindow, back, counter } = shopPhotos;
  /* One 3:2 frame for every room; `pos` keeps each subject in it. */
  const rooms = [
    { photo: shopfront, pos: "50% 0%" },
    { photo: railWindow, pos: "50% 50%" },
    { photo: back, pos: "50% 50%" },
    { photo: counter, pos: "50% 50%" },
  ];

  return (
    <>
      <MotionLayer />
      <Nav />
      <main id="main" className="flex-1">
        {/* 1 ── The vintage rail, and the title over it. */}
        <section aria-labelledby="ab-title" className="ab-hero">
          <Pic photo={vintage} sizes="100vw" className="ab-hero-img" priority />
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

        {/* 2 ── Hayley, in her own words. */}
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

        {/* 3 ── Inside the shop: a lookbook, index held beside it. */}
        <section aria-labelledby="ab-inside" className="ab-inside">
          <InsideRooms
            rooms={rooms.map((r, i) => ({ id: `room-${i + 1}`, n: String(i + 1).padStart(2, "0"), caption: r.photo.caption }))}
            head={
              <div className="ab-inside-head">
                <p className="label ab-kicker">Inside</p>
                <h2 id="ab-inside" className="ab-h2">
                  18 Sea View Street.
                </h2>
              </div>
            }
          >
            {rooms.map((r, i) => (
              <figure key={r.photo.name} id={`room-${i + 1}`} className="ab-room">
                <div className="ab-room-frame">
                  <Pic
                    photo={r.photo}
                    sizes="(min-width: 900px) 560px, 92vw"
                    className="ab-room-img"
                    style={{ objectPosition: r.pos }}
                  />
                </div>
                <figcaption>
                  <span className="ab-rooms-n">{String(i + 1).padStart(2, "0")}</span>
                  {r.photo.caption}
                </figcaption>
              </figure>
            ))}
          </InsideRooms>
        </section>

        {/* 4 ── Three principles, beside the boucle. */}
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
