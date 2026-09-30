import { shop } from "@/lib/shop";
import { Cta, sources, Where } from "./HeroStrips";
import { HeroName } from "./HeroName";
import { HeroPhoto } from "./HeroPhoto";
import { HeroVideo } from "./HeroVideo";

/* The home hero since 2026-09-27: "C, the Campaign", Brad's pick of three
 * directions (A framed shop interior, B new-in piece beside the brand, C one
 * full-bleed frame), chosen over the Fair Isle turn (HeroTurn.tsx, kept).
 *
 * The content, same day (Brad, from a screenshot): the name in Bodoni in the
 * middle, the one "Shop all" button under it, and "Open every day · the
 * street" along the foot. No statement line; the Vaer-style two-line
 * statement was taken off at his instruction.
 *
 * The frame: the horses re-rendered from the old frame with GPT Image 2.5
 * at 4K, max quality, with a separate 9:16 render for phones, built by
 * scripts/build-hero.mjs. Campaign imagery: no shop, stock or person, so
 * alt="" and the sr-only h1 carries the page's meaning. The visible name is
 * a <p>: type.css sets every visible h1 in 38px capitals, !important.
 *
 * Motion: none. It stays full size as the page scrolls past (Brad,
 * 2026-09-27, taking back the scroll-out to the category card's shape he
 * had asked for earlier that day). */

const heading = `B Boutique — for every woman who walks in. Independent womenswear and homeware on ${shop.street}, ${shop.town}.`;

export function HeroCampaign() {
  return (
    <section id="top" className="hx hx-c" aria-labelledby="hx-h">
      <h1 id="hx-h" className="sr-only">{heading}</h1>
      <div className="hx-c-frame">
        <HeroPhoto sources={sources("horses")} />
        <HeroVideo />
        <div className="hx-c-mid">
          <HeroName />
          <Where />
          <Cta />
        </div>
      </div>
    </section>
  );
}
