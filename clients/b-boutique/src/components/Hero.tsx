import { openingSummary, shop } from "@/lib/shop";

import { HeroSlideshow } from "./HeroSlideshow";

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
      {/* The page's only h1, and visible again since 2026-09-21.

       * It was sr-only because the approved hero was the photograph and
       * nothing else — the client took the categories and SCROLL off on
       * 2026-09-06 and that became locked decision 5. She has now asked for
       * a different hero, which reopens it; the decision table is updated in
       * the same commit rather than left to contradict this file.
       *
       * The visible line is the statement. The continuation is sr-only so the
       * heading still names the business, the category and the street for a
       * screen reader and for the day indexing is switched on — a display
       * line alone is a weak h1, and splitting it this way costs nothing.
       *
       * ── The copy, and the one trap in it ─────────────────────────────────
       * She asked for the site to speak to women of ALL SIZES. The obvious
       * move is to print a size range, and it is the wrong one: the only size
       * statement on this site is in lib/faq.ts, it is marked
       * `temporary: true`, and "size 8 to a size 18" is demo copy nobody has
       * confirmed. Printing it on the hero would turn an unconfirmed number
       * into the loudest promise on the page.
       *
       * So the welcome is carried by the words rather than by a number.
       * "For every woman who walks in" is positioning in her own register —
       * it claims nothing a customer could arrive and find untrue. */}
      <h1 className="hero-line">
        For every woman
        <br />
        who walks <em>in</em>.
        <span className="sr-only">
          {" "}
          — B Boutique, independent womenswear and homeware on
          Sea View Street, Cleethorpes.
        </span>
      </h1>

      {/* No wrapper. HeroSlideshow renders TWO layers into this section — the
          photographs at z-index -10 (carrying `.hero-media` and its parallax)
          and the captions and arrows at z-index 1. A wrapper at -10 would be
          a stacking context the controls could not climb out of, so they are
          siblings here rather than nested. */}
      <HeroSlideshow />

      {/* The scrim. Two jobs, and it grew a second one on 2026-09-21.
       *
       * It has always closed the seam where the hero meets the band below.
       * It now also BUYS THE CONTRAST for the copy, because the photograph
       * changed from a dark red studio frame to a pale Paris street and the
       * copy is near-white.
       *
       * This was measured, not assumed. With the old 22%-tall foot gradient
       * the new picture gave, at 390px: hero-line worst 1.12:1, hero-sub
       * 1.38:1, hero-where 1.15:1 — the headline sitting directly on the
       * white dress, white on white. Unreadable, and a launch blocker.
       *
       * Moved out of an inline style and into a class so the strength can
       * vary by breakpoint, which it has to: at 1440 the copy lands on dark
       * road and barely needs help, while at 390 the same copy lands on the
       * dress and needs a great deal. See `.hero-scrim` in globals.css. */}
      <div aria-hidden="true" className="hero-scrim" />

      {/* The copy sits bottom-left, where the photograph is its own colour
          rather than a face. The scrim below is what makes it legible over a
          picture — contrast against a photograph cannot be measured as a
          token pair, so it is bought with a gradient rather than asserted. */}
      <div className="hero-copy">
        <p className="hero-sub">
          Independent womenswear and homeware.
        </p>
        <p className="hero-where">
          {shop.street}, {shop.town} · {openingSummary()}
        </p>
        <a href="/shop" className="hero-cta">
          <span>See what is in</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

    </section>
  );
}
