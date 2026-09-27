"use client";

import { useEffect, useRef, type ReactNode } from "react";

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
 * track, no pin, nothing moves; the CSS lays the row out as a grid. */
export function ScrollAcross({ className, children }: { className?: string; children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const t = track.current;
    const p = pin.current;
    const row = p?.querySelector<HTMLElement>("[data-across]");
    if (!t || !p || !row || reduced) return;

    let distance = 0;
    let frame = 0;
    const measure = () => {
      distance = Math.max(0, row.scrollWidth - row.clientWidth);
      t.style.height = `calc(100svh + ${distance}px)`;
    };
    const move = () => {
      frame = 0;
      const r = t.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      const progress = travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0;
      row.style.transform = `translate3d(${-progress * distance}px, 0, 0)`;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(move); };
    const onResize = () => { measure(); move(); };

    measure();
    move();
    const ro = new ResizeObserver(onResize);
    ro.observe(row);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
      t.style.height = "";
      row.style.transform = "";
    };
  }, [reduced]);

  return (
    <div ref={track} className={className} data-across-track={reduced ? undefined : ""}>
      <div ref={pin} className="across-pin">
        {children}
      </div>
    </div>
  );
}
