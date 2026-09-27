"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/* The Fair Isle Jumper turn on the home hero (2026-09-27, Brad: "we want her
 * on the hero ... larger"). Three ways, for Brad to choose between, picked
 * with ?turn=a|b|c on the home page. With no ?turn the page is unchanged.
 * PREVIEW ONLY: once one is chosen it becomes the default and the other two
 * and this switch go.
 *
 *   a  She stands in the field and turns once as the hero scrolls away. No
 *      pinning: the hero stays an ordinary section.
 *   b  The hero holds for one more screen while she turns, then lets go.
 *   c  A stage straight after the hero: "B Boutique" set huge behind her,
 *      held while she turns.
 *
 * Frames are transparent cut-outs (public/img/spin/<slug>/hero), decoded
 * once and drawn to a canvas, as Spin360 does, so she never flashes. They
 * load after the hero's photograph, never before it. Progress is read live
 * from getBoundingClientRect on scroll. Reduced motion: the front frame,
 * standing still. The GENERATED note travels with her wherever she is. */
type Mode = "a" | "b" | "c";

/* ?turn, read on the client only; the server (and first paint) sees none,
   so the hero renders exactly as it does today until the page hydrates. */
const noop = () => () => {};
const readTurn = (): Mode | null => {
  const m = new URLSearchParams(window.location.search).get("turn");
  return m === "a" || m === "b" || m === "c" ? m : null;
};

export function HeroTurn({ frames, generated, name }: { frames: string[]; generated: boolean; name: string }) {
  const mode = useSyncExternalStore(noop, readTurn, () => null);
  const reduced = usePrefersReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mode) return;
    document.documentElement.dataset.turn = mode;
    return () => { delete document.documentElement.dataset.turn; };
  }, [mode]);

  useEffect(() => {
    const c = canvas.current;
    const el = root.current;
    if (!mode || !c || !el) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const imgs: HTMLImageElement[] = [];
    let shown = -1;
    let frame = 0;
    let live = true;

    const size = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      shown = -1;
    };
    const draw = (i: number) => {
      const im = imgs[i];
      if (!im?.complete || !im.naturalWidth || i === shown) return;
      const s = Math.min(c.width / im.naturalWidth, c.height / im.naturalHeight);
      const w = im.naturalWidth * s, h = im.naturalHeight * s;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(im, (c.width - w) / 2, c.height - h, w, h);
      shown = i;
    };
    const track = () => (mode === "a" ? el.closest(".hero-track")?.querySelector<HTMLElement>(".hero") : el.closest<HTMLElement>(mode === "b" ? ".hero-track" : ".turn-stage")) ?? el;
    const progress = () => {
      const r = track().getBoundingClientRect();
      const vh = window.innerHeight;
      if (mode === "a") return Math.min(1, Math.max(0, -r.top / (r.height * 0.75)));
      const travel = r.height - vh;
      return travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0;
    };
    const paint = () => {
      frame = 0;
      const p = reduced ? 0 : progress();
      draw(Math.round(p * frames.length) % frames.length);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(paint); };

    // The front first, the rest once the page has loaded and gone idle.
    const load = (i: number) => {
      const im = new Image();
      im.decoding = "async";
      im.src = frames[i];
      im.decode().catch(() => {}).then(() => { if (live) onScroll(); });
      imgs[i] = im;
    };
    size();
    load(0);
    const rest = () => { for (let i = 1; i < frames.length; i++) load(i); };
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const idle = () => (w.requestIdleCallback ? w.requestIdleCallback(rest) : window.setTimeout(rest, 1200));
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });

    const onResize = () => { size(); onScroll(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      live = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", idle);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [mode, frames, reduced]);

  if (!mode) return null;

  const note = generated ? (
    <p className="ht-note">Generated turn. The back of the piece has not been checked against the real garment yet.</p>
  ) : null;

  if (mode === "c") {
    return (
      <section className="turn-stage" aria-label={`${name}, turning`}>
        <div className="turn-stage-pin" ref={root}>
          <p className="turn-stage-word" aria-hidden="true">B Boutique</p>
          <canvas ref={canvas} className="ht-canvas ht-canvas--stage" role="img" aria-label={`${name}, turning as you scroll`} />
          {note}
        </div>
      </section>
    );
  }

  return (
    <div className="ht-layer" ref={root}>
      <div className="ht-stick">
        <div className="ht-figure">
          <span className="ht-shadow" aria-hidden="true" />
          <canvas ref={canvas} className="ht-canvas" role="img" aria-label={`${name}, turning as you scroll`} />
        </div>
        {note}
      </div>
    </div>
  );
}
