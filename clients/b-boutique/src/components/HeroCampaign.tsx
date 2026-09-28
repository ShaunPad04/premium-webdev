import { shop } from "@/lib/shop";
import { Cta, sources, Where } from "./HeroStrips";
import { HeroName } from "./HeroName";
import { HeroPhoto } from "./HeroPhoto";

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

/* Start the photograph downloading once the first paint has happened
   (2026-09-28), alongside the page's scripts, instead of after them.
   HeroPhoto still renders it after hydration, now usually from the cache, so
   the frame stops sitting on the blur while ~220 KB of JavaScript arrives
   (PageSpeed mobile Speed Index 4.9s). Before the first paint it would join
   the requests PageSpeed charges to FCP and LCP; that is why it waits, and
   why it waits for the browser's own first-contentful-paint entry (reported
   once the paint is presented) rather than a frame count, which measured
   3ms early. AVIF only, the same srcset and sizes as the <picture>, so the
   browser picks the same file. */
const early = sources("horses")
  .filter((s) => s.type === "image/avif")
  .map((s) => [s.media ?? "(max-width: 1023px)", s.srcSet, s.sizes ?? "100vw"]);
const preload = `(function(){var done=0;function go(){if(done++)return;${JSON.stringify(early)}.forEach(function(s){var l=document.createElement("link");l.rel="preload";l.as="image";l.type="image/avif";l.media=s[0];l.imageSrcset=s[1];l.imageSizes=s[2];document.head.appendChild(l)})}try{new PerformanceObserver(function(l){if(l.getEntriesByName("first-contentful-paint").length)setTimeout(go,0)}).observe({type:"paint",buffered:true})}catch(e){addEventListener("load",go)}})()`;

export function HeroCampaign() {
  return (
    <section id="top" className="hx hx-c" aria-labelledby="hx-h">
      <h1 id="hx-h" className="sr-only">{heading}</h1>
      <div className="hx-c-frame">
        <HeroPhoto sources={sources("horses")} fallback="/img/hero/horses-m.jpg" />
        {/* A module script, so it never holds up parsing: a plain inline
            script waits for the stylesheet and delayed first paint. */}
        <script type="module" dangerouslySetInnerHTML={{ __html: preload }} />
        <div className="hx-c-mid">
          <HeroName />
          <Cta />
        </div>
        <Where />
      </div>
    </section>
  );
}
