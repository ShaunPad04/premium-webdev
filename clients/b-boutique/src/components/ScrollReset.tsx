"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/* Every navigation lands where it should.
 *
 * ── The report ────────────────────────────────────────────────────────────
 * The client clicked Coats in the header menu and arrived at the FOOTER of
 * /clothing/coats. Not near the top, not mid-page — the opening-hours table
 * and the footer, with the product grid somewhere above him.
 *
 * ── What was actually established, and what was not ───────────────────────
 * Stated plainly because it changes how much this should be trusted: the
 * fault was NOT reproduced. A clean headless Chromium was driven from the
 * bottom of /, /clothing, /about and /shop, through the header dropdown, into
 * /clothing/coats, at 1440 and 1920, with Lenis confirmed running and
 * prefers-reduced-motion off. Every one landed at scrollY 0. Card links and
 * footer links, the same. So this is a fix for the cause the evidence points
 * at, not a fix for a failure that was watched happening.
 *
 * What the evidence rules OUT: no link on the site carries a fragment into a
 * category route, `/clothing/[category]` has no id that a stray anchor could
 * catch, and the route's own markup is ordinary.
 *
 * What it points AT: `history.scrollRestoration` was left at the browser
 * default, `"auto"`. Chrome then remembers a scroll offset per history entry
 * and restores it when that entry is revisited. In an App Router site every
 * client navigation is a history entry, so a route visited before — and
 * scrolled to the bottom before, which is exactly what somebody reviewing a
 * page does — can be handed its old offset back on a later, ordinary click.
 * That explains the one thing a fresh browser cannot: why it happens to the
 * person who has been through these pages twenty times and not to a profile
 * that has never seen them.
 *
 * ── Why not simply set scrollRestoration to "manual" ──────────────────────
 * Because that is the blunt version and it breaks the Back button: every
 * back navigation would also land at the top, losing the reader's place,
 * which is a worse bug than the one being fixed and a much more common one.
 *
 * So the rule is the one a professionally built site actually follows:
 *
 *   forward navigation  -> top of the new page (or its hash target)
 *   back / forward      -> leave it alone; the browser restores the place
 *   first load          -> leave it alone; a deep link may carry a hash
 *
 * `popstate` is what separates the first case from the second. It fires only
 * for a history traversal, so a flag set there and cleared on read marks the
 * navigation the reader initiated with the keyboard or the mouse buttons.
 *
 * ── Lenis has to be told too ──────────────────────────────────────────────
 * This is a latent second fault, found while looking for the first. Lenis is
 * constructed once and keeps its OWN idea of the scroll position in
 * `animatedScroll`. Setting `window.scrollTo(0, 0)` does not update that, so
 * the smooth scroller can carry a stale offset across a route change and
 * drag the page back to it on the next wheel event. Whichever caused the
 * client's report, both are wrong, and both are corrected here.
 *
 * It is guarded rather than assumed: Lenis is behind MotionLayer's idle gate
 * and is absent under prefers-reduced-motion, so `window.__lenis` is very
 * often undefined and the plain `window.scrollTo` is the real path.
 *
 * ── Mounted in layout.tsx ─────────────────────────────────────────────────
 * Not in MotionLayer, which is deferred until the browser goes idle or the
 * user moves — a navigation can easily beat that. Not per-page either: the
 * client asked for this on every page of the site, and twelve copies is
 * twelve chances to miss one. */
export function ScrollReset() {
  const pathname = usePathname();
  /* True only between a popstate and the render it causes. */
  const traversed = useRef(false);
  /* The first pathname this component sees is the page that was loaded
     directly, not a navigation — leave a deep link's hash alone. */
  const first = useRef(true);

  useEffect(() => {
    const onPop = () => {
      traversed.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (traversed.current) {
      traversed.current = false;
      return;
    }

    /* One frame, so the new route has committed and its hash target exists
       to be measured. Scrolling before that measures the page being left. */
    const raf = requestAnimationFrame(() => {
      const lenis = window.__lenis;
      const { hash } = window.location;

      if (hash.length > 1) {
        /* An id can legally start with a digit in HTML but is then an
           invalid CSS selector, so querySelector throws rather than
           returning null. A navigation must not die on a malformed hash. */
        let target: Element | null = null;
        try {
          target = document.querySelector(hash);
        } catch {
          target = null;
        }
        if (target) {
          if (lenis) lenis.scrollTo(target as HTMLElement, { immediate: true, force: true });
          else target.scrollIntoView();
          return;
        }
      }

      /* Both, deliberately: Lenis owns the visual position when it is
         running, and window.scrollTo is what is true when it is not. */
      if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
    });

    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
