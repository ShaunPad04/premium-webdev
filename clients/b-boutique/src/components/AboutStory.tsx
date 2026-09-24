import Link from "next/link";

import { products, isBuyable, formatPriceShort } from "@/lib/catalogue";
import { owner } from "@/lib/shop";
import { showDrafts } from "@/lib/drafts";
import { RevealText } from "./RevealText";
import { ProductPhoto } from "./ProductPhoto";

/* About, as a story (2026-09-24, Brad).
 *
 * 1. A pull quote in her own words (from owner.bio), revealed word by word
 *    as it scrolls in, and her name set as a signature. The words are hers;
 *    the "signature" is her name in the display italic, not a scan of a real
 *    one, and it is not presented as one.
 * 2. When / why / how she chooses pieces. DRAFTS, each paraphrased only from
 *    what she has already said (bio, principles). Shown on previews with a
 *    draft flag, left out of production until she confirms (lib/drafts.ts).
 * 3. Hayley's picks. Also a draft: the three pieces are placeholders chosen
 *    by rule until she names her own. */

const QUOTE = "Carefully selected pieces that are stylish, affordable and perfect for treating yourself or finding that special gift.";

const CHOOSING = [
  { k: "When", h: "New stock, regularly", p: "New stock comes in regularly, so there is always something different to discover when you come back." },
  { k: "Why", h: "Something a little different", p: "The aim is pieces you will not see everywhere, at prices that make treating yourself, or buying a gift, an easy yes." },
  { k: "How", h: "One piece at a time", p: "Each piece is picked by hand, and we try not to reorder, so the rails stay fresh. When something goes, it usually goes for good." },
];

export function AboutStory() {
  const picks = products.filter((p) => isBuyable(p) && p.category !== "Homeware").slice(0, 3);
  return (
    <>
      <section className="as-quote" aria-labelledby="as-q">
        <p className="label as-k">In her words</p>
        <RevealText as="blockquote" id="as-q" className="as-q">
          {QUOTE}
        </RevealText>
        <p className="as-sign">
          <span>{owner.firstName}</span>
          <span className="sr-only"> {owner.lastName}</span>
          <svg className="as-sign-line" viewBox="0 0 220 18" aria-hidden="true">
            <path d="M2 12 C 60 2, 120 18, 218 6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </p>
      </section>

      {showDrafts ? (
        <section className="as-choose" aria-labelledby="as-choose-h">
          <div className="as-choose-head">
            <p className="label as-k">How the rails are filled</p>
            <h2 id="as-choose-h" className="as-h">
              When, why and <em>how.</em>
            </h2>
            <p className="draft-flag">Draft: Hayley to confirm the wording before this goes live</p>
          </div>
          <ol className="as-choose-list">
            {CHOOSING.map((c, i) => (
              <li key={c.k} className="as-choose-item">
                <span className="as-n">{String(i + 1).padStart(2, "0")}</span>
                <p className="as-ck">{c.k}</p>
                <h3 className="as-ch">{c.h}</h3>
                <p className="as-cp">{c.p}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {showDrafts && picks.length ? (
        <section className="as-picks" aria-labelledby="as-picks-h">
          <div className="as-choose-head">
            <p className="label as-k">Chosen by {owner.firstName}</p>
            <h2 id="as-picks-h" className="as-h">
              {owner.firstName}&rsquo;s <em>picks.</em>
            </h2>
            <p className="draft-flag">Draft: placeholder pieces until Hayley names her own</p>
          </div>
          <ul className="as-picks-row">
            {picks.map((p) => (
              <li key={p.slug}>
                <Link href={`/shop/${p.slug}`} className="as-pick">
                  <span className="as-pick-media">
                    <ProductPhoto photo={p.photo} sizes="(min-width: 900px) 30vw, 90vw" className="absolute inset-0 h-full w-full object-cover" />
                  </span>
                  <span className="as-pick-name">{p.name}</span>
                  <span className="as-pick-price">{formatPriceShort(p.priceP)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
