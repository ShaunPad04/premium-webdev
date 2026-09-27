import { shop } from "@/lib/shop";
import { Cta, sources, Where } from "./HeroStrips";

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
 * Motion: on desktop, as the hero scrolls away, the frame closes in to the
 * exact shape of the category card below it (same width, same 22px corners),
 * at full strength. Vaer's move is a shrink and fade; on a red frame the fade
 * read as a washed-out box (Brad), so it became "leave as one of the page's
 * own cards". CSS scroll timeline, clip-path only, no pin. Brad overrode
 * locked decision 8 ("no hero scale") for it. Nothing moves on phones or
 * under reduced motion. */

const heading = `B Boutique — for every woman who walks in. Independent womenswear and homeware on ${shop.street}, ${shop.town}.`;

export function HeroCampaign() {
  return (
    <section id="top" className="hx hx-c" aria-labelledby="hx-h">
      <h1 id="hx-h" className="sr-only">{heading}</h1>
      <div className="hx-c-frame">
        <picture className="hx-c-photo">
          {sources("horses").map((s) => (
            <source key={`${s.media ?? ""}${s.type}`} media={s.media} type={s.type} srcSet={s.srcSet} sizes={s.sizes} />
          ))}
          <img src="/img/hero/horses-m.jpg" alt="" fetchPriority="high" decoding="async" />
        </picture>
        {/* Inside the frame, so the words close in with the photograph and
            can never hang off its edge onto the white page. */}
        <div className="hx-c-mid">
          <p className="hx-name" aria-hidden="true">B Boutique</p>
          <Cta />
        </div>
        <Where />
      </div>
    </section>
  );
}
