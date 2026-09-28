"use client";

import { useSyncExternalStore } from "react";

/* True once the browser has actually put the first screen on the glass
 * (2026-09-28, PageSpeed).
 *
 * requestAnimationFrame is not that signal. On PageSpeed's test machine the
 * home page had finished loading at 0.5s but did not paint until 2.3s, and a
 * rAF, an idle callback or a React effect all ran inside that gap. Everything
 * they started (the next pages' prefetches with their stylesheet, the photos
 * below the fold, the menu and smooth-scroll code) was then counted as part of
 * the first paint and of the largest paint: FCP 2.0s, LCP 3.8s, score 82-84.
 *
 * The first-contentful-paint entry is reported after the frame is shown, so
 * work gated on it cannot land before it. A timer stands in where the entry
 * never comes (an old browser, a tab opened in the background). */
let painted = false;
const subs = new Set<() => void>();

function mark() {
  if (painted) return;
  painted = true;
  subs.forEach((f) => f());
  subs.clear();
}

if (typeof window !== "undefined") {
  try {
    new PerformanceObserver((list, obs) => {
      if (list.getEntriesByName("first-contentful-paint").length) {
        obs.disconnect();
        mark();
      }
    }).observe({ type: "paint", buffered: true });
  } catch {
    mark();
  }
  window.setTimeout(mark, 4000);
}

const subscribe = (cb: () => void) => {
  subs.add(cb);
  return () => void subs.delete(cb);
};

/** False on the server and until the first paint; then true for good. */
export function usePainted() {
  return useSyncExternalStore(subscribe, () => painted, () => false);
}

/** Resolves once the first screen has painted. */
export function afterPaint(): Promise<void> {
  return painted ? Promise.resolve() : new Promise((ok) => subscribe(ok));
}
