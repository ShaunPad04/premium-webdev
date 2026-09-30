"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/* Scrolling down moves a row across (2026-09-27, Brad, for Why B Boutique:
 * "once we get to that section, you should scroll and it should move us
 * right, showing all of the images with their little description").
 *
 * The same mechanics as Spin360: the outer element is a tall track, the
 * inner one is native `position: sticky`, and progress is read LIVE from
 * getBoundingClientRect on every scroll event, never stored, so it stays
 * right whatever loads above it. Lenis moves the real window scroll, so the
 * events arrive every frame. The track is exactly as much taller than the
 * screen as the row is wider than it, so one pixel down is one pixel across
 * and the last card arrives as the section lets go.
 *
 * The row to move is the child marked [data-across]. Reduced motion: no
 * track, no pin, nothing moves; the CSS lays the row out as a grid.
 * `upTo` (a media query) limits the movement to screens that match it; the
 * CSS must scope the pinned layout to the same query (2026-09-29, Brad:
 * desktop off, phones keep it). */
const never = () => () => {};
export function ScrollAcross({ className, children, upTo }: { className?: string; children: ReactNode; upTo?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const fits = useSyncExternalStore(
    upTo ? (cb) => { const m = window.matchMedia(upTo); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); } : never,
    () => (upTo ? window.matchMedia(upTo).matches : true),
    () => true,
  );
  const reduced = reducedMotion || !fits;

  useEffect(() => {
    const t = track.current;
    const p = pin.current;
    const row = p?.querySelector<HTMLElement>("[data-across]");
    if (!t || !p || !row || reduced || (upTo && !window.matchMedia(upTo).matches)) return;

    /* The held frame is only as tall as what it holds (2026-09-29, Brad: a
       full-screen frame left a third of a phone screen empty at its foot),
       so the track is the frame's height plus the distance across, and
       progress counts from where the frame sticks (its CSS `top`). */
    let distance = 0;
    let stick = 0;
    let frame = 0;
    const measure = () => {
      distance = Math.max(0, row.scrollWidth - row.clientWidth);
      stick = parseFloat(getComputedStyle(p).top) || 0;
      t.style.height = `${p.offsetHeight + distance}px`;
    };
    const move = () => {
      frame = 0;
      const r = t.getBoundingClientRect();
      const travel = r.height - p.offsetHeight;
      const progress = travel > 0 ? Math.min(1, Math.max(0, (stick - r.top) / travel)) : 0;
      row.style.transform = `translate3d(${-progress * distance}px, 0, 0)`;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(move); };

    /* Where CSS scroll-driven animations exist, the compositor moves the row
       (globals.css, `across`), so it keeps pace with the scroll even when a
       phone throttles scripts (iOS Low Power Mode: 30fps). The script only
       supplies the lengths: the view timeline's cover range starts with the
       track's top at the screen's foot, so the slide runs from
       innerHeight - stick to that plus the distance across. */
    const css = CSS.supports("animation-timeline: view()");
    const lengths = () => {
      t.style.setProperty("--across-dist", `${distance}px`);
      t.style.setProperty("--across-from", `${window.innerHeight - stick}px`);
      t.style.setProperty("--across-to", `${window.innerHeight - stick + distance}px`);
    };
    const onResize = () => { measure(); if (css) lengths(); else move(); };

    measure();
    if (css) { lengths(); t.dataset.css = ""; } else move();
    const ro = new ResizeObserver(onResize);
    ro.observe(row);
    if (!css) window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
      delete t.dataset.css;
      ["--across-dist", "--across-from", "--across-to"].forEach((k) => t.style.removeProperty(k));
      t.style.height = "";
      row.style.transform = "";
    };
  }, [reduced, upTo]);

  return (
    /* The attribute follows reduced motion only, never `upTo`: the server
       cannot know the screen, so the layout for `upTo` lives in CSS media
       queries and the script just does not move anything where it fails. */
    <div ref={track} className={className} data-across-track={reducedMotion ? undefined : ""}>
      <div ref={pin} className="across-pin">
        {children}
      </div>
    </div>
  );
}
