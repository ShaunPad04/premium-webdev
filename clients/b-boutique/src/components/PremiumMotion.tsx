"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/* Scroll-craft, kept to a handful of deliberate moves.
 *
 * Every tween is a .from()/.fromTo() off the rendered state, and the whole
 * set is gated behind prefers-reduced-motion — so with JS off or motion
 * reduced, the page ships exactly as laid out. */
export function PremiumMotion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      /* The hero used to be driven from here: a masked reveal on the giant
         wordmark, plus scrubbed ScrollTriggers on the photograph. The wordmark
         is gone from the hero — it lives in the footer now — and the hero's
         drift is four CSS keyframes on a root scroll timeline, which costs no
         JavaScript and cannot fight Lenis. Nothing hero-related belongs in
         this file any more. */

      /* The philosophy statement rises line by line out of its own mask.
       *
       * Lines, not characters: the sentence is one thought and it should
       * arrive in the shapes the reader will actually read it in. GSAP's own
       * `mask: "lines"` builds the overflow wrapper, and `autoSplit` re-splits
       * on resize — without it a desktop line break freezes into the mobile
       * layout, which is the classic failure of this effect.
       *
       * `aria: "auto"` puts the original sentence on the element and hides the
       * generated line spans, so a screen reader meets the sentence once.
       *
       * once: true. It plays as the section arrives and never again; replaying
       * on every scroll direction change is what makes this pattern annoying. */
      document.querySelectorAll<HTMLElement>("[data-lines]").forEach((el) => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          aria: "auto",
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.lines, {
              yPercent: 105,
              /* Added 2026-09-21 at the client's request — he asked for this
                 to fade in on scroll. It already animated: the lines rose out
                 of their mask, measured 67px of travel resolving to 0 as the
                 section entered. But opacity was pinned at 1 for the whole
                 tween, so it read as a slide and not as a fade, which is why
                 he did not see the thing he was asking for.

                 Fading alongside the mask rather than instead of it: the mask
                 hides a line completely at yPercent 105, so the opacity only
                 does visible work over the second half of the rise, where it
                 softens the edge of the reveal. That is the part that reads
                 as a fade. Dropping the mask would make the fade louder and
                 would also throw away a deliberate decision — it is additive
                 and reversible this way. */
              opacity: 0,
              duration: 0.9,
              stagger: 0.08,
              // Closest built-in to the site's cubic-bezier(.22,1,.36,1):
              // fast departure, long settle. Not worth another plugin.
              ease: "power4.out",
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            });
          },
        });
      });

      /* Two generic handlers lived here — [data-split], which set headings
         character by character, and [data-stagger], which rose a group's
         children on a short delay. Both were removed in the release cleanup.
         Neither had matched an element since the homepage was rebuilt, and a
         dormant rule that animates "every heading" or "every group" the moment
         someone adds an attribute is exactly the site-wide reveal this page
         is built to avoid: the editorial hierarchy here comes from each
         section choosing its own entrance, not from one handler applying the
         same one everywhere.

         What remains above is the only GSAP on the page, and it is
         section-specific: the philosophy statement's masked line reveal. */
    });

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  }, []);

  return null;
}
