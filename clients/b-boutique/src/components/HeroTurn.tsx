"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/* The home hero (2026-09-27, Brad): the Fair Isle turn inside an orbiting
 * word ring, after the "Jellyfish Drift" component he sent, with our model
 * in place of the jellyfish. The horses hero (Hero.tsx) is kept.
 *
 * Kept from the original: giant words pinned at fixed seats on a vertical
 * ring around the figure, facing inward, so the one on the far side reads
 * through the centre and passes BEHIND her with real turntable perspective;
 * one word bright at a time; a quiet statement on the right; ruled side
 * scales with small labels; rotating captions at the foot; film grain.
 *
 * Changed, each for a reason:
 *   - No three.js. The jellyfish was a 3D model drawn live; ours is 36
 *     photographed-style frames of a real piece, drawn to a canvas, so the
 *     ring is plain CSS 3D and nothing new is installed.
 *   - Scroll, not a clock. The section is a tall track with a sticky stage;
 *     her turn and the ring's orbit are both read from the same scroll
 *     progress, so the words circle her as she turns, one orbit per turn.
 *   - Every word is the shop's: its name, "hand-picked" and "one of one"
 *     (the Why section's claims), womenswear, Cleethorpes. The statement,
 *     the side labels and the captions come from lib/shop and lib/catalogue.
 *   - No "audio off" pill or play button: controls that do nothing are not
 *     put on a page. No lavender wash or bubbles: that was the sea.
 *   - Bodoni, the site's display face, not Inter Black.
 *
 * The front frame is a real <img> (the hero's first paint, and the no-script
 * state); the other 35 load after the page. Reduced motion: no track, no
 * pin, no orbit, the first word and the front frame standing still. The
 * GENERATED note goes wherever she is, until the client checks the back. */
const WORDS = ["B Boutique", "Hand-picked", "One of one", "Womenswear", "Cleethorpes"];
const STEP = 360 / WORDS.length;

export function HeroTurn({
  frames,
  generated,
  name,
  heading,
  statement,
  captions,
  labels,
}: {
  frames: string[];
  generated: boolean;
  name: string;
  heading: string;
  statement: string;
  captions: string[];
  labels: string[];
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
    const words = [...p.querySelectorAll<HTMLElement>("[data-word]")];
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
      const ring = -360 * prog;
      p.style.setProperty("--p", prog.toFixed(4));
      p.style.setProperty("--ring", `${ring.toFixed(2)}deg`);
      /* One word bright at a time: full within 22 degrees of facing us, gone
         by 48. Each sits at 180 + i*STEP so the first faces us at the top. */
      let brightest = 0;
      words.forEach((wd, i) => {
        const d = ((((180 + i * STEP + ring - 180) % 360) + 540) % 360) - 180;
        const o = Math.min(1, Math.max(0, (48 - Math.abs(d)) / 26));
        wd.style.opacity = String(o);
        brightest = Math.max(brightest, o);
      });
      p.style.setProperty("--calm", (1 - brightest).toFixed(3));
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
      words.forEach((wd) => { wd.style.opacity = ""; });
    };
  }, [frames, reduced]);

  return (
    <section id="top" ref={track} className="th" aria-labelledby="th-h">
      <h1 id="th-h" className="sr-only">{heading}</h1>
      <div ref={pin} className="th-pin">
        {/* The word ring: the container's perspective is the camera, the stage
            the world, turned by --ring. */}
        <div className="th-ring" aria-hidden="true">
          <div className="th-stage">
            {WORDS.map((wd, i) => (
              <span key={wd} data-word="" className="th-ringword" style={{ "--seat": `${180 + i * STEP}deg` } as React.CSSProperties}>
                {wd}
              </span>
            ))}
          </div>
        </div>

        <div className="th-figure">
          <span className="th-shadow" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={frames[0]} alt={`${name}, from the front`} className="th-still" fetchPriority="high" decoding="async" />
          <canvas ref={canvas} className="th-canvas" aria-hidden="true" />
        </div>

        <p className="th-micro" aria-hidden="true">The {name} &mdash; 01</p>
        <p className="th-statement">{statement}</p>

        {(["left", "right"] as const).map((side) => (
          <div key={side} className={`th-ruler th-ruler--${side}`} aria-hidden="true">
            {Array.from({ length: 13 }, (_, i) => <span key={i} className={i % 4 === 0 ? "is-long" : undefined} />)}
            <span className="th-ruler-label">{labels.join(" · ")}</span>
          </div>
        ))}

        <div className="th-foot">
          <Link href="/clothing" className="th-cta">
            Shop all
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
          <div className="th-captions">
            {captions.map((cap, i) => (
              <p key={cap} className="th-caption" style={{ animationDelay: `${i * 6}s` }}>{cap}</p>
            ))}
          </div>
        </div>
        {generated ? (
          <p className="th-note">Generated turn. The back of the piece has not been checked against the real garment yet.</p>
        ) : null}
        <span className="th-grain" aria-hidden="true" />
      </div>
    </section>
  );
}
