"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

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
/* ── Our own scroll memory, per page (2026-09-22) ──────────────────────────
 * The browser's own is switched off: GSAP ScrollTrigger sets
 * history.scrollRestoration = "manual" when it loads. What looked like Back
 * "keeping your place" before today was the stale-offset bug itself — Lenis
 * dragging the page to its old number — which is also what sent a clicked
 * product to its footer. Fixing one exposed the other, so Back gets a real
 * mechanism: the last scroll position of every page is remembered here, and a
 * Back/Forward puts it back. Keyed by path + query. Session-only, in memory. */
const saved = new Map<string, number>();
const keyNow = () => window.location.pathname + window.location.search;

function jumpTo(y: number) {
  const lenis = window.__lenis;
  /* Both: Lenis owns the position while it runs (and must be told, or it
     drags the page back to its own stale number), window.scrollTo is what is
     true when it does not.

     behavior: "instant", explicitly. globals.css sets
     `html { scroll-behavior: smooth }`, which makes a plain scrollTo(0, y) a
     GLIDE — so until 2026-09-22 the reset itself was a slow animation that a
     scroll already in flight could simply outlast. */
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  window.scrollTo({ top: y, left: 0, behavior: "instant" });
}

/* Where a hash target should sit: its top at the page top, less its own
   scroll-margin-top, so a section lands BELOW the fixed header rather than
   under it — which is what the CSS already asks of a native jump. */
function yFor(el: Element) {
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  return Math.max(0, el.getBoundingClientRect().top + window.scrollY - margin);
}

/* ── Land, then hold (2026-09-22) ──────────────────────────────────────────
 * Checking every internal link on the site — each clicked from where it sits
 * deepest, while the page was still moving — found only 19 of 55 landing
 * where they should: products from /shop up to 2,195px down, product to
 * product 64px, category to category 23px. Every one was the same shape: the
 * reset ran, and then something ELSE kept moving the page — a native smooth
 * scroll still in flight, Lenis finishing its glide, ScrollTrigger restoring
 * a recorded offset, a photograph above the fold loading and pushing layout.
 *
 * Chasing each cause separately is how this bug came back three times. So
 * after landing, the position is HELD for 700ms: any scroll in that window
 * that the reader did not make is put straight back. The moment the reader
 * touches anything — wheel, touch, key, pointer — the hold ends, so it can
 * never fight a person, only the machinery. `target` is re-read each time
 * rather than fixed, so a hash target that moves as images load is followed. */
function land(target: () => number | undefined) {
  const y0 = target();
  if (y0 === undefined) return;
  jumpTo(y0);

  const until = performance.now() + 700;
  const inputs = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
  const stop = () => {
    window.removeEventListener("scroll", onScroll);
    inputs.forEach((t) => window.removeEventListener(t, stop, true));
  };
  function onScroll() {
    if (performance.now() > until) return stop();
    const y = target();
    if (y !== undefined && Math.abs(window.scrollY - y) > 1) jumpTo(y);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  inputs.forEach((t) => window.addEventListener(t, stop, { capture: true, passive: true }));
  window.setTimeout(stop, 720);
}

export function ScrollReset() {
  const pathname = usePathname();
  /* Which page the scroll listener is recording for. Updated only when a new
     route commits, so the leaving page's last position is never written under
     the arriving page's key. */
  const recording = useRef<string | null>(null);
  /* True only between a popstate and the render it causes. */
  const traversed = useRef(false);
  /* The first pathname this component sees is the page that was loaded
     directly, not a navigation — leave a deep link's hash alone. */
  const first = useRef(true);

  useEffect(() => {
    const onPop = () => {
      traversed.current = true;
      /* Restore once the returning page has committed — whichever of this
         handler and the route's layout effect runs first. Twice, because
         ScrollTrigger's mount-time refresh can land in between and re-apply
         whatever it recorded; the second pass is the one that sticks. */
      const put = () => land(() => saved.get(keyNow()));
      requestAnimationFrame(() => requestAnimationFrame(put));
      window.setTimeout(put, 250);
    };
    /* CAPTURE, so this runs before Next's own popstate handler.
       Since the reset moved into useLayoutEffect (below), the order matters:
       Next commits the Back navigation synchronously inside its popstate
       handler, which runs the layout effect before a bubble-phase listener
       registered here has set the flag — so Back was treated as a forward
       click and scrolled to the top, losing the reader's place. Measured:
       left / at 1825, came Back to 8. At the target, capture listeners fire
       before non-capture ones, so the flag is always set first. */
    window.addEventListener("popstate", onPop, { capture: true });

    const onScroll = () => {
      if (recording.current) saved.set(recording.current, window.scrollY);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("popstate", onPop, { capture: true });
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* ── Same-page fragment links ───────────────────────────────────────────
   *
   * The client reported, more than once, that clicking the wordmark did not
   * take him to the top. The first fix missed it because the first CLICK
   * works: the hash goes from "" to "#top", the browser navigates, the
   * pathname effect below does its job. It is the SECOND click that fails,
   * and every click after it.
   *
   * Reproduced: scroll to 2500, click the wordmark — scrollY 0, correct.
   * Scroll to 2500 again, click it again — scrollY 2500. Nothing at all
   * happens, because the hash is already "#top", so there is no navigation,
   * no hashchange event and nothing for React to re-render. The address bar
   * in the client's screenshot already read /#top, which is precisely that
   * state: he was clicking a link that, by then, did nothing.
   *
   * usePathname cannot see this — "/" to "/" is not a change — so it needs
   * its own handler rather than another dependency below.
   *
   * It is delegated from the document rather than wired into the wordmark,
   * because the wordmark is not the only one: /#visit, /#new-in and
   * /#homeware in the corner menu and the footer all have the same shape and
   * the same fault.
   *
   * Lenis is the reason this cannot be left to the browser even when the
   * hash DOES change. It runs its own rAF loop writing `animatedScroll` back
   * every frame, so a native fragment jump is overwritten within a frame or
   * two. Whatever moves the page has to go through Lenis while Lenis
   * exists. */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      /* Let the browser handle anything that is not a plain left click:
         modified clicks open tabs and windows, and hijacking those is worse
         than the bug being fixed.
         `defaultPrevented` is deliberately NOT checked. This runs in the
         capture phase, before next/link's own handler, so nothing has
         prevented anything yet — and checking it was the reason the first
         attempt at this fix did nothing at all: next/link calls
         preventDefault() on the way past, so a bubble-phase listener saw
         every wordmark click as already handled and returned immediately. */
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = (e.target as Element | null)?.closest?.("a[href]") as
        | HTMLAnchorElement
        | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;

      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      /* A different page is an ordinary navigation — the pathname effect
         below handles where it lands. */
      if (url.pathname !== window.location.pathname) return;

      /* A link to the page you are already on, with no section named — the
         category bar's own entry, the wordmark on the home page. The router
         sees no change, so nothing scrolled: clicked 400px down a category,
         you stayed 400px down it (found by the link check, 2026-09-22). It
         now goes to the top of the page, which is what the link names. */
      if ((!url.hash || url.hash.length < 2) && url.search === window.location.search) {
        e.preventDefault();
        e.stopPropagation();
        const lenis = window.__lenis;
        if (lenis) lenis.scrollTo(0, { force: true });
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (!url.hash || url.hash.length < 2) return;

      let target: Element | null = null;
      try {
        target = document.querySelector(url.hash);
      } catch {
        return; /* a hash that is not a valid selector is not ours to fix */
      }
      if (!target) return;

      /* stopPropagation as well as preventDefault: next/link's handler would
         otherwise still run and push its own navigation for the same click,
         which re-enters the router for a page it is already on. */
      e.preventDefault();
      e.stopPropagation();

      /* Keep the address bar honest, and keep Back working: replace when the
         hash is unchanged (the repeat-click case, which should not stack
         identical history entries) and push when it is new. */
      if (url.hash === window.location.hash) {
        window.history.replaceState(null, "", url.hash);
      } else {
        window.history.pushState(null, "", url.hash);
      }

      const lenis = window.__lenis;
      /* #top is the hero, which starts at the document top. Scrolling to the
         element lands a pixel or two off because of the fixed header, and on
         a "back to top" control that reads as not quite having worked. */
      const toTop = target === document.querySelector("#top");
      if (lenis) {
        if (toTop) lenis.scrollTo(0, { force: true });
        else lenis.scrollTo(target as HTMLElement, { force: true });
      } else if (toTop) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }

      /* Accessibility: a fragment link is supposed to move focus as well as
         the viewport, and preventDefault() has just taken that away. The
         skip link is the one that matters most — it goes to #main, and a
         keyboard user who lands there without focus is back where they
         started. preventScroll, because the scroll is already handled. */
      const el = target as HTMLElement;
      if (!el.hasAttribute("tabindex") && !/^(a|button|input|select|textarea)$/i.test(el.tagName)) {
        el.setAttribute("tabindex", "-1");
      }
      el.focus({ preventScroll: true });
    };

    /* Capture phase — see the note about defaultPrevented above. This must
       see the click before next/link does. */
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  /* ── Synchronous, at commit — not one frame later (2026-09-22) ──────────
   *
   * Reported by the client: "View piece" on the Tomato Vase in the New In rail
   * opened /shop/tomato-vase at the opening hours and map, not the product.
   * Reproduced on every product, not just that one — each landed ~1,830px
   * down, the home page's offset carried across.
   *
   * Traced frame by frame with a stack on every scroll call. Two faults, in
   * series:
   *
   *   1. This effect never scrolled. It waited one requestAnimationFrame, and
   *      the card-to-product View Transition held that frame back; not one of
   *      the logged scroll calls came from here.
   *   2. GSAP ScrollTrigger then put the old offset back. The new page mounts
   *      PremiumMotion, whose `document.fonts.ready.then(refresh)` resolves
   *      immediately, and ScrollTrigger.refresh() RECORDS the current scroll,
   *      jumps to 0 to measure, and RESTORES what it recorded — 1,825. Seen
   *      in the trace as scrollTo(0,0) followed 0ms later by scrollTo(0,1825),
   *      both from ScrollTrigger's refresh.
   *
   * useLayoutEffect runs as the new route commits: after its DOM exists (so a
   * hash target can be found) and before ANY passive effect on the new page,
   * PremiumMotion's included. By the time ScrollTrigger refreshes, the page is
   * already at 0, so 0 is what it records and 0 is what it restores. No frame
   * to wait for, so nothing for a transition to hold back. */
  useLayoutEffect(() => {
    recording.current = keyNow();
    if (first.current) {
      first.current = false;
      /* A page LOADED with a section in its address — a shared link to
         bboutiqueclee.com/#new-in, a refresh, a link from an email. This used
         to be left to the browser's own fragment jump, on the assumption that
         it works. It does not here: ScrollTrigger sets scrollRestoration to
         manual and Lenis writes its own position every frame, so the jump was
         undone and the page sat at the top, 934px short of the section
         (found by the landing test, 2026-09-22). Same landing as a click. */
      const { hash } = window.location;
      if (hash.length > 1) {
        let target: Element | null = null;
        try {
          target = document.querySelector(hash);
        } catch {
          target = null;
        }
        if (target) {
          const el = target;
          land(() => yFor(el));
        }
      }
      return;
    }
    if (traversed.current) {
      /* Back/Forward: onPop restores this page's remembered position. */
      traversed.current = false;
      land(() => saved.get(keyNow()));
      return;
    }

    {
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
          const el = target;
          land(() => yFor(el));
          return;
        }
      }

      land(() => 0);
    }
  }, [pathname]);

  return null;
}
