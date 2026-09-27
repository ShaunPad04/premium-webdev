"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/* The home hero, for now (2026-09-27, Brad picked C: "try it as the hero
 * section ... remove temporarily the hero"). The horses hero (Hero.tsx) is
 * kept and can go straight back.
 *
 * The section is a tall track; its stage is `position: sticky` and holds
 * while she turns once, ending on the front, then the page carries on.
 * "B Boutique" is set as a masthead: a solid copy behind her and a hairline
 * outline copy in front, so she stands between the two, and as she turns the
 * word eases from slightly larger and wider into place.
 *
 * Frames are transparent cut-outs (public/img/spin/<slug>/hero). The front
 * one is a real <img>, eager and high priority, so the hero paints at once
 * and works without script; the rest load after the page and are drawn to a
 * canvas over it, decoded once so she never flashes (as Spin360). Progress
 * is read live from getBoundingClientRect on scroll. Reduced motion: no
 * track and no pin (CSS), the front frame standing still. The GENERATED note
 * goes wherever she is, until the client checks the back of the jumper. */
export function HeroTurn({
  frames,
  generated,
  name,
  hours,
  heading,
}: {
  frames: string[];
  generated: boolean;
  name: string;
  hours: string;
  heading: string;
}) {
  const reduced = usePrefersReducedMotion();
  const track = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const t = track.current;
    const p = pin.current;
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!t || !p || !c || !ctx || reduced) return;
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
      c.dataset.ready = "";
    };
    const paint = () => {
      frame = 0;
      const r = t.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      const prog = travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0;
      p.style.setProperty("--p", prog.toFixed(4));
      // Drawn only once she has started to turn; until then the <img> shows.
      if (prog > 0) draw(Math.round(prog * frames.length) % frames.length);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(paint); };

    const rest = () => {
      frames.forEach((src, i) => {
        const im = new Image();
        im.decoding = "async";
        im.src = src;
        im.decode().catch(() => {}).then(() => { if (live) { shown = -1; onScroll(); } });
        imgs[i] = im;
      });
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const idle = () => (w.requestIdleCallback ? w.requestIdleCallback(rest) : window.setTimeout(rest, 800));
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });

    const onResize = () => { size(); onScroll(); };
    size();
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      live = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", idle);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [frames, reduced]);

  return (
    <section id="top" ref={track} className="th" aria-labelledby="th-h">
      <h1 id="th-h" className="sr-only">{heading}</h1>
      <div ref={pin} className="th-pin">
        <p className="th-word th-word--back" aria-hidden="true">B Boutique</p>
        <div className="th-figure">
          <span className="th-shadow" aria-hidden="true" />
          {/* The front frame: the hero's first paint and its no-script state. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={frames[0]} alt={`${name}, from the front`} className="th-still" fetchPriority="high" decoding="async" />
          <canvas ref={canvas} className="th-canvas" aria-hidden="true" />
        </div>
        <p className="th-word th-word--front" aria-hidden="true">B Boutique</p>

        <div className="th-foot">
          <p className="th-meta">Womenswear &amp; homeware &middot; Cleethorpes</p>
          <Link href="/clothing" className="th-cta">
            Shop all
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
          <p className="th-meta th-meta--end">{hours}</p>
        </div>
        {generated ? (
          <p className="th-note">Generated turn. The back of the piece has not been checked against the real garment yet.</p>
        ) : null}
      </div>
    </section>
  );
}
