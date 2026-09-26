"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/* Scroll-turned viewer (2026-09-27, Brad: "when we scroll, she spins rather
 * than having to spin it with swiping"). Started as a rebuild of the
 * FramerGeeks ProductViewer360 without the Framer runtime.
 *
 * Frames live at public/img/spin/<slug>/00.webp, 01.webp, … and the product
 * page finds them itself, so adding a turn to another piece is dropping a
 * folder in. Nothing is fetched until the viewer is near the screen.
 *
 * ── The scroll ──────────────────────────────────────────────────────────
 * The enclosing `.spin` section is a tall track and `.spin-pin` inside it is
 * native `position: sticky` (globals.css). Progress through the track is read
 * LIVE from getBoundingClientRect on every scroll event, never stored, so it
 * stays right whatever loads or pins above it — the same reason Black Line's
 * own process ride is sticky rather than a ScrollTrigger pin. One full turn
 * over the track, ending on the front again. Lenis moves the real window
 * scroll, so native scroll events arrive every frame.
 *
 * ── Reduced motion ─────────────────────────────────────────────────────
 * No track and no pin (the CSS is inside a no-preference query). The front
 * frame stands still and drag or the arrow keys step it, which is motion
 * only when the visitor asks for it.
 *
 * ── Why a canvas ────────────────────────────────────────────────────────
 * Frames are decoded once up front and drawn to a canvas, never swapped into
 * an <img>: changing an <img>'s src lets the browser paint it empty until the
 * next frame decodes, which flickered white (Brad, 2026-09-26). A frame that
 * is not decoded yet is not drawn, so the canvas holds the last good one. */
export function Spin360({ frames, name }: { frames: readonly string[]; name: string }) {
  const n = frames.length;
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const decoded = useRef<(HTMLImageElement | undefined)[]>([]);
  const shown = useRef(-1);
  const drag = useRef<{ x: number; f: number } | null>(null);
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
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!near) return;
    frames.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img
        .decode()
        .then(() => (decoded.current[i] = img))
        .catch(() => {})
        .finally(() => setLoaded((c) => c + 1));
    });
  }, [near, frames]);

  const draw = useCallback((f: number) => {
    const c = canvas.current;
    const img = decoded.current[f];
    if (!c || !img || f === shown.current) return;
    if (c.width !== img.naturalWidth) {
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
    }
    c.getContext("2d")?.drawImage(img, 0, 0);
    shown.current = f;
  }, []);

  /* Scroll mode: position in the track -> frame. Written straight to the
     canvas, no React state, so scrolling re-renders nothing. */
  useEffect(() => {
    if (!ready || reduced) return;
    const track = box.current?.closest<HTMLElement>(".spin");
    if (!track) return;
    const update = () => {
      const r = track.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      const p = travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0;
      draw(Math.round(p * n) % n);
    };
    shown.current = -1;
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ready, reduced, n, draw]);

  /* Reduced mode: the visitor steps it. */
  useEffect(() => {
    if (ready && reduced) draw(frame);
  }, [ready, reduced, frame, draw]);

  const step = (f: number) => ((f % n) + n) % n;
  const deg = Math.round((frame * 360) / n);

  return (
    <div
      ref={box}
      className="spin-stage"
      data-ready={ready ? "" : undefined}
      {...(reduced
        ? {
            role: "slider",
            tabIndex: 0,
            "aria-label": `Turn the ${name}`,
            "aria-valuemin": 0,
            "aria-valuemax": 359,
            "aria-valuenow": deg,
            "aria-valuetext": `${deg} degrees`,
            onKeyDown: (e: React.KeyboardEvent) => {
              const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
              if (e.key === "Home") setFrame(0);
              else if (d) setFrame((f) => step(f + d));
              else return;
              e.preventDefault();
            },
            onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
              if (!ready) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = { x: e.clientX, f: frame };
            },
            onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
              const d = drag.current;
              if (!d) return;
              const perFrame = e.currentTarget.clientWidth / n;
              setFrame(step(d.f - Math.round((e.clientX - d.x) / perFrame)));
            },
            onPointerUp: () => (drag.current = null),
            onPointerCancel: () => (drag.current = null),
          }
        : { role: "img", "aria-label": `${name}, turning as you scroll` })}
    >
      {/* The first frame as a still until every frame is decoded; its src
          never changes, so it cannot flash. */}
      <img src={frames[0]} alt="" draggable={false} loading="lazy" decoding="async" className="spin-img" />
      <canvas ref={canvas} className="spin-canvas" aria-hidden="true" />
      <span className="spin-progress" aria-hidden="true" style={{ transform: `scaleX(${loaded / n})` }} />
    </div>
  );
}
