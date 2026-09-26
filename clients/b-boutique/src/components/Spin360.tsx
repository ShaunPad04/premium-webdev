"use client";

import { useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/* Drag-to-turn viewer (2026-09-26, Brad, after the FramerGeeks
 * ProductViewer360). Rebuilt here rather than embedded: the Framer module
 * pulls the Framer runtime from framerusercontent.com, which this site does
 * not load.
 *
 * Frames live at public/img/spin/<slug>/00.webp, 01.webp, … and the product
 * page finds them itself, so adding a turn to another piece is dropping a
 * folder in. Nothing is fetched until the viewer is near the screen. Once
 * every frame is in, it turns once on its own (not under reduced motion) and
 * then waits: a drag across its full width is one full turn, and the arrow
 * keys step it a frame at a time. */
export function Spin360({ frames, name }: { frames: readonly string[]; name: string }) {
  const n = frames.length;
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; f: number } | null>(null);
  const touched = useRef(false);
  const reduced = usePrefersReducedMotion();

  const [frame, setFrame] = useState(0);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const ready = loaded >= n;

  useEffect(() => {
    const el = box.current;
    if (!el || typeof IntersectionObserver === "undefined") return setNear(true);
    const io = new IntersectionObserver(
      (e) => {
        if (e[0]?.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!near) return;
    for (const src of frames) {
      const img = new Image();
      img.onload = img.onerror = () => setLoaded((c) => c + 1);
      img.src = src;
    }
  }, [near, frames]);

  /* One turn on arrival, eased in and out (--ease-inout), so it reads as
     "this moves" rather than as a loop to be stopped. Under 5s, so WCAG
     2.2.2 asks for no pause control. */
  useEffect(() => {
    if (!ready || reduced || touched.current) return;
    const start = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      if (touched.current) return;
      const t = Math.min(1, (now - start) / 2400);
      const e = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
      setFrame(Math.round(e * n) % n);
      if (t < 1) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [ready, reduced, n]);

  const step = (f: number) => ((f % n) + n) % n;
  const deg = Math.round((frame * 360) / n);

  return (
    <div
      ref={box}
      className="spin-stage"
      data-ready={ready ? "" : undefined}
      role="slider"
      tabIndex={0}
      aria-label={`Turn the ${name}`}
      aria-valuemin={0}
      aria-valuemax={359}
      aria-valuenow={deg}
      aria-valuetext={`${deg} degrees`}
      onKeyDown={(e) => {
        const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (e.key === "Home") setFrame(0);
        else if (d) setFrame((f) => step(f + d));
        else return;
        touched.current = true;
        e.preventDefault();
      }}
      onPointerDown={(e) => {
        if (!ready) return;
        touched.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, f: frame };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const perFrame = e.currentTarget.clientWidth / n;
        setFrame(step(d.f - Math.round((e.clientX - d.x) / perFrame)));
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      <img src={frames[frame]} alt="" draggable={false} loading="lazy" decoding="async" className="spin-img" />
      <span className="spin-progress" aria-hidden="true" style={{ transform: `scaleX(${loaded / n})` }} />
    </div>
  );
}
