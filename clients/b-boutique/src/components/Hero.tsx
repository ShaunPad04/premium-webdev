import { HeroPicture } from "./HeroPicture";

/* The campaign hero.
 *
 * One full-bleed photograph, and nothing on it.
 *
 * It used to carry four small pieces of type: the categories at the left edge,
 * the philosophy line at the right, SCROLL at the bottom. All of it has been
 * taken off at the client's instruction, in that order — the philosophy line
 * on 2026-09-05, the categories and SCROLL on 2026-09-06. What is left is the
 * photograph, full bleed, and the header above it, which was explicitly kept.
 *
 * The giant "B Boutique" wordmark that used to run across the bottom of this
 * section is separately and deliberately gone — the page has exactly one of
 * those and it belongs at the very end, in the footer, where it reads as a
 * sign-off rather than a title card.
 *
 * ── Height ────────────────────────────────────────────────────────────────
 * 100svh, floored at 720 and capped at 1050. svh not vh, so a mobile browser's
 * collapsing toolbar cannot crop the face. The cap stops the photograph
 * becoming a mural on a tall desktop display and pushing the brand rail past
 * the fold on every screen.
 *
 * ── No pin ────────────────────────────────────────────────────────────────
 * This section used to sit inside a 140vh sticky track, which held it in place
 * for 40vh of scrolling before the page moved on. That is scroll-jacking by
 * another name, and it put a blank spacer between the hero and the brand rail.
 * The section is now exactly its own height and the two meet directly.
 *
 * ── Overlay ───────────────────────────────────────────────────────────────
 * No full-frame scrim. The red is the whole point of the picture and a black
 * wash turns it burgundy.
 *
 * The two narrow edge gradients that used to sit at the left and right are
 * gone with the type they were drawn for — each was sized to sit under a
 * specific piece of copy, and with that copy removed they were darkening a
 * photograph to make nothing legible. That is a judgement call rather than a
 * literal instruction; put either back by restoring the divs if the frame
 * reads better with a vignette.
 *
 * The short gradient at the foot stays. It reads as SCROLL's ground but it is
 * not there for SCROLL: it is what lets the bottom of the photograph meet the
 * brand rail's solid black without a visible seam. Removing it puts a hard
 * edge across the full width of the page. */
export function Hero() {
  return (
    <section
      id="top"
      className="hero relative isolate w-full overflow-hidden bg-bb-black"
    >
      {/* The page's only h1, and deliberately not visible.
       *
       * The approved hero is the photograph and nothing else — no type at all
       * since 2026-09-06 — so this cannot be shown without breaking that. But
       * the page had no h1 at all: eleven h2s and no top-level landmark, which
       * leaves a screen-reader user navigating by heading with nothing to land
       * on, and throws away the strongest on-page signal the day indexing is
       * switched on. axe does not flag it — page-has-heading-one is a best-practice
       * rule, not WCAG A/AA — so the suite stayed green while it was missing.
       *
       * Every word here is a confirmed fact, and it says what the shop is and
       * where it is. No claim that is not already true elsewhere on the page. */}
      <h1 className="sr-only">
        B Boutique — independent womenswear, accessories and homeware on Sea
        View Street, Cleethorpes
      </h1>

      <div className="hero-media absolute inset-0 -z-10">
        <HeroPicture />
      </div>

      {/* A short foot, so the hero meets the brand rail's black without a
          visible seam. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[22%]"
        style={{
          background:
            "linear-gradient(to top, rgba(5,5,5,.66) 0%, rgba(5,5,5,.20) 55%, transparent 100%)",
        }}
      />

      {/* Nothing is placed on the photograph any more.

          The three category labels that sat at the left edge — WOMENSWEAR,
          ACCESSORIES, HOMEWARE — and the SCROLL cue at the bottom were both
          removed on the client's instruction (2026-09-06). The header keeps
          its own navigation; that was explicitly not to be touched, and it is
          untouched.

          The routes are not lost: the header and the corner menu both carry
          navigation to the same places (Clothing and Accessories to the rails,
          and the menu to Homeware), and HERO_CATEGORIES is still exported from
          lib/nav.ts if these three labels are ever wanted back here. SCROLL
          had no content to lose.

          What went with them, because each existed only to serve them: the
          left and right edge gradients, the hairline under SCROLL, and the
          hero-left / hero-scroll drift keyframes in globals.css. The
          photograph keeps its own parallax. */}
    </section>
  );
}
