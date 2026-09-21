"use client";

import { useEffect, useState } from "react";

/* 639px, not 640: Tailwind's `sm` breakpoint is min-width 640, so the
 * complement of it is max-width 639.98. Rounding down to 639 keeps the two in
 * step and avoids the half-pixel band where both could match on a fractional
 * viewport. If `sm` is ever retuned, this has to move with it. */
const QUERY = "(max-width: 639px)";

/** True while the corner menu should behave as a full-height right drawer
 *  rather than as a corner card.
 *
 *  ── Why a hook and not a CSS media query ─────────────────────────────────
 *  The GEOMETRY is done in CSS, where it belongs — the panel's inset, height
 *  and corner radii are all Tailwind breakpoint variants. This is only for
 *  the ENTRANCE, which is a JavaScript animation and therefore cannot read a
 *  breakpoint.
 *
 *  The two want different entrances and it is not a stylistic preference. A
 *  card scales up out of the corner it was opened from, which needs a
 *  transform origin at top right; a drawer that scales from its top-right
 *  corner appears to grow out of the wall rather than slide along it, and
 *  reads as a glitch. The drawer translates in from the right edge instead.
 *
 *  Same shape as usePrefersReducedMotion, deliberately: starts false so the
 *  server and the first client render agree, then corrects on mount. False is
 *  the safe default here — it means "card", and the card entrance on a drawer
 *  for one frame is invisible, whereas the reverse would slide a full-height
 *  panel across the screen on a desktop. */
export function useIsDrawer(): boolean {
  const [isDrawer, setIsDrawer] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const update = () => setIsDrawer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isDrawer;
}
