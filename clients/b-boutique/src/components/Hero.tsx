import { shop } from "@/lib/shop";

import { HeroStrips } from "./HeroStrips";

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
      {/* The slider, since 2026-09-22 at the client's request — see
          components/ui/parallax-strip-slider.tsx for what was changed on the
          way in. The headline is now the first slide's title; this h1 is the
          page's one top-level heading for assistive tech and search, and
          says the same thing in words that do not change every six seconds. */}
      <h1 className="sr-only">
        B Boutique — for every woman who walks in. Independent womenswear and
        homeware on {shop.street}, {shop.town}.
      </h1>
      <HeroStrips />
    </section>
  );
}
