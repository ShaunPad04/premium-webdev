import Link from "next/link";
import { ProductPhoto } from "./ProductPhoto";

/* Homeware — the pacing change.
 *
 * Still the same cool-white chapter as New In, separated by a hairline and
 * nothing else: the distinction is composition, not another colour block. New
 * In is a rail of equal products; this is a wide editorial spread with a
 * narrow column of type against three unequal photographs.
 *
 * ── Which photograph goes where ───────────────────────────────────────────
 * Two of the three homeware sources are vendored locally; homeware-ceramics
 * was never supplied and still resolves to a CDN this environment denies. So
 * the real photographs take the two dominant positions and the missing one
 * takes the smallest, least prominent slot — where its designed panel reads as
 * a quiet detail rather than the hole in the middle of the composition. It is
 * not hidden: it is still there, still labelled, just not carrying the spread.
 * Swap it back up the moment the source arrives.
 *
 * panel-homeware is used here because the category rail no longer needs it —
 * that moved to the five approved category photographs — and it is a genuine
 * homeware still that was otherwise sitting unused.
 *
 * ── Motion ────────────────────────────────────────────────────────────────
 * Entrance on the outer figure, parallax on the inner span. One element can
 * only carry one animation-timeline, so the two effects need two elements.
 * Both are CSS view timelines: no JavaScript, nothing to fight Lenis, and no
 * pinning. Total travel is under 25px — it should register as depth, not as an
 * effect you can name. */
export function Homeware() {
  return (
    <section id="homeware" aria-labelledby="homeware-heading" className="hw">
      <div className="hw-inner">
        <div className="hw-copy">
          <p className="hw-eyebrow">Homeware</p>
          <h2 id="homeware-heading" className="hw-h2">
            Things for the house, chosen the same way.
          </h2>
          <p className="hw-body">
            Glazed ceramic, and things worth wrapping. A small shelf of it,
            chosen a piece at a time, like everything on the rails.
          </p>
          {/* To /homeware, the category's own page. This pointed at /#visit —
              the shop's address — so "Explore homeware" explored a map. Fixed
              2026-09-22 when /homeware was built. */}
          <Link href="/homeware" className="hw-cta">
            Explore homeware{" "}
            <span className="hw-cta-arrow" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </div>

        {/* Her real homeware since 2026-09-23. The three pictures here were
            stock stills of candles, folded linen and a stoneware jug, none of
            which the shop sells, under copy claiming "small British makers"
            that nobody had confirmed. Now: three pieces from her catalogue. (Her
            photo of the homeware shelf was tried first; at this size the
            source is too small and read as blurry.) */}
        <div className="hw-media">
          <figure className="hw-fig hw-a">
            <span className="hw-par">
              <ProductPhoto
                photo="bb-vase-bell"
                square
                alt="The Bell Vase: a vase covered in polished gold bells."
                sizes="(min-width: 1024px) 30vw, 92vw"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </span>
          </figure>

          <div className="hw-stack">
            <figure className="hw-fig hw-b">
              <span className="hw-par">
                <ProductPhoto
                  photo="bb-vase-tomato"
                  square
                  alt="The Tomato Vase: a ceramic vase covered in three-dimensional tomatoes."
                  sizes="(min-width: 1024px) 20vw, 68vw"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </span>
            </figure>

            <figure className="hw-fig hw-c">
              <span className="hw-par">
                <ProductPhoto
                  photo="bb-jar-banana"
                  square
                  alt="The Banana Jar: a lidded ceramic jar formed from a bunch of bananas."
                  sizes="(min-width: 1024px) 18vw, 56vw"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </span>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
