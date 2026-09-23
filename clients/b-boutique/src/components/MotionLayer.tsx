"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/* The motion layer is enhancement, not content, and none of it is needed
   until someone scrolls. Loading GSAP, ScrollTrigger, SplitText and Lenis
   eagerly cost 320ms of blocking time and 78KB of unused JavaScript before
   the page had even painted.
 *
 * So it is deferred twice: dynamic() keeps it out of the initial bundle, and
 * the gate below keeps it out of the initial *execution* until the browser is
 * idle or the user actually moves. Every tween is a .from() off the rendered
 * state, so nothing flashes when it finally attaches.
 *
 * The dynamic() calls live here rather than in page.tsx because `ssr: false`
 * is not permitted inside a Server Component. */
const SmoothScroll = dynamic(
  () => import("./SmoothScroll").then((m) => m.SmoothScroll),
  { ssr: false },
);

export function MotionLayer() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idle: number | undefined;
    const go = () => setReady(true);

    // Whichever comes first: the browser goes idle, or the user moves.
    const ric = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      }
    ).requestIdleCallback;

    if (ric) idle = ric(go, { timeout: 2000 });
    else idle = window.setTimeout(go, 1200);

    window.addEventListener("scroll", go, { once: true, passive: true });
    window.addEventListener("pointerdown", go, { once: true, passive: true });

    return () => {
      const cic = (window as Window & { cancelIdleCallback?: (h: number) => void })
        .cancelIdleCallback;
      if (idle !== undefined) (cic ?? window.clearTimeout)(idle);
      window.removeEventListener("scroll", go);
      window.removeEventListener("pointerdown", go);
    };
  }, []);

  if (!ready) return null;

  return (
    <>
      <SmoothScroll />
    </>
  );
}
