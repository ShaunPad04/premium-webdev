import type { Metadata } from "next";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { Visit } from "@/components/Visit";
import { StoryScroll } from "@/components/StoryScroll";
import { principles, shopPhotos, type ShopPhoto } from "@/lib/about";
import { owner, shop, openingPhrase } from "@/lib/shop";
import { RevealText } from "@/components/RevealText";

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
 *   1. The title on white. (Her rails photo sat behind it until
 *      2026-09-23, then a generated still life, which came off on
 *      2026-09-27 at Brad's request; her real photographs carry the rest.)
 *   2. Hayley, in her own words (owner.bio — the same copy the home page's
 *      owner card reads).
 *   3. The story (2026-09-27, 21st.dev direction B of three): her photographs
 *      held on the left while the three principles and "Come and see it."
 *      scroll past on the right (components/StoryScroll.tsx). It replaced a
 *      lookbook with a numbered index and a principles band on ink.
 *   4. Visit, unchanged.
 *
 * The marble statement band that sat between 1 and 2 was taken off on
 * 2026-09-23 at the client's request ("the second image section is
 * terrible"). The statement itself still lives on the home page
 * (PointOfView reads the same `philosophy` copy).
 */

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

export default function AboutPage() {
  const { shopfront, railWindow, back, counter } = shopPhotos;
  const pic = (photo: ShopPhoto) => <Pic photo={photo} sizes="(min-width: 900px) 45vw, 92vw" />;
  const steps = [
    ...principles.map((p, i) => ({ n: p.n, title: p.title, body: p.body, pic: pic([shopfront, railWindow, back][i]) })),
    {
      n: "04",
      title: "Come and see it.",
      body: `On the rail at ${shop.street}, ${shop.town}. Open ${openingPhrase()}.`,
      pic: pic(counter),
    },
  ];

  return (
    <>
      <MotionLayer />
      <Nav solid />
      <main id="main" className="flex-1">
        {/* 1 ── The title, on white. The photograph behind it came off on
            2026-09-27 (Brad: "remove the big image"). */}
        <section aria-labelledby="ab-title" className="ab-hero ab-hero--plain">
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
              <RevealText id="ab-owner" className="ab-owner-name">
                {owner.firstName} <em>{owner.lastName}</em>
              </RevealText>
              <blockquote className="ab-quote">
                {owner.bio.map((para) => (
                  <p key={para.slice(0, 24)}>{para}</p>
                ))}
              </blockquote>
            </div>
          </div>
        </section>

        {/* 3 ── The story: her photographs held, the principles scrolling past. */}
        <section aria-label="How the shop works" className="ab-story">
          <StoryScroll steps={steps} />
        </section>

        <Visit />
      </main>
      <Footer />
    </>
  );
}
