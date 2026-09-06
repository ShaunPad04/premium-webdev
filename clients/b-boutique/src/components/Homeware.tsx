import { ImageSlot } from "./ImageSlot";

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
            Stoneware, candles, glass and linen. Most of it comes from small
            British makers, most of it arrives a few at a time, and all of it is
            here because someone liked it — not because a category needed
            filling.
          </p>
          <a href="/#visit" className="hw-cta">
            Explore homeware{" "}
            <span className="hw-cta-arrow" aria-hidden="true">
              &rarr;
            </span>
          </a>
        </div>

        <div className="hw-media">
          <figure className="hw-fig hw-a">
            <span className="hw-par">
              <ImageSlot
                tone="onyx"
                seed={21}
                slot="panel-homeware"
                alt="Stoneware vases, a lit candle and folded linen on a black marble shelf"
                sizes="(min-width: 1024px) 30vw, 92vw"
                className="absolute inset-0 h-full w-full"
              />
            </span>
          </figure>

          <div className="hw-stack">
            <figure className="hw-fig hw-b">
              <span className="hw-par">
                <ImageSlot
                  tone="bone"
                  seed={22}
                  slot="homeware-linen"
                  alt="Folded linen napkins and a ribbed glass tumbler on black marble"
                  sizes="(min-width: 1024px) 20vw, 68vw"
                  className="absolute inset-0 h-full w-full"
                />
              </span>
            </figure>

            <figure className="hw-fig hw-c">
              <span className="hw-par">
                <ImageSlot
                  /* bone, not gold. The designed gold panel is a bright warm
                     gradient, and in the smallest slot of a cool-white spread
                     it was the loudest thing on the screen — reintroducing
                     exactly the warm UI this palette removed. Bone reads as a
                     quiet neutral swatch instead. The slot is still there and
                     still labelled; it is just no longer shouting about being
                     the one photograph we are missing. */
                  tone="bone"
                  seed={23}
                  slot="homeware-ceramics"
                  alt="A stoneware jug, ceramic bowls and a lit taper candle"
                  sizes="(min-width: 1024px) 18vw, 56vw"
                  className="absolute inset-0 h-full w-full"
                />
              </span>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
