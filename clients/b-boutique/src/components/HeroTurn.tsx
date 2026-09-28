"use client";

import Link from "@/components/Link";
import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/* The home hero (2026-09-27, Brad): the Fair Isle turn playing on its own,
 * like a video, inside an orbiting word ring, after the "Jellyfish Drift"
 * component he sent, with our model in place of the jellyfish. The horses
 * hero (Hero.tsx) is kept.
 *
 * ── Her ───────────────────────────────────────────────────────────────────
 * One full turn at the clip's own 24 fps, looping. The words pass BEHIND
 * her, so she has to be see-through, and Safari (every iPhone) cannot play
 * video with an alpha channel. So the video is "stacked alpha": one plain
 * H.264 MP4, twice as tall as the picture, her colour in the top half and
 * her cut-out mask in the bottom half. A small WebGL shader puts the two
 * back together every frame. Plays everywhere, one small file. Made by
 * scripts/build-turn-video.py from the cut-out frames.
 *
 * ── The ring ──────────────────────────────────────────────────────────────
 * Kept from the original: giant words on a vertical ring around the figure,
 * facing inward, so the one on the far side reads through the centre and
 * passes behind her with real turntable perspective, one bright at a time;
 * a quiet statement that surfaces between words; ruled side scales; rotating
 * captions. The ring's angle is read from the video's own clock through the
 * clip's measured angles (the turn is not constant speed), so the words stay
 * locked to her as she turns.
 *
 * Changed: our words, statement, labels and captions (all from lib/shop and
 * lib/catalogue); no "audio off" or play button (controls that do nothing);
 * no bubbles; no three.js. Inter Black, condensed, as the original.
 *
 * Reduced motion: no playback and no orbit; the front frame and the first
 * word. The "generated turn" note came off on 2026-09-27, when Brad
 * confirmed the back of the jumper against the real garment and the
 * GENERATED file was removed; the `generated` prop still shows it if a new
 * AI-made turn is ever added. */
const WORDS = ["B Boutique", "Hand-picked", "One of one", "Womenswear", "Cleethorpes"];
const STEP = 360 / WORDS.length;
/* Measured on the clip (assets/spin/fair-isle-jumper/README.md): video
   frame -> angle. The loop is frames 0..183, a full 360. */
const ANCHORS: [number, number][] = [[0, 0], [22, 45], [46, 90], [66, 135], [90, 180], [114, 225], [138, 270], [162, 315], [184, 360]];
const FPS = 24;
const angleAt = (f: number) => {
  for (let i = 1; i < ANCHORS.length; i++) {
    const [f0, a0] = ANCHORS[i - 1];
    const [f1, a1] = ANCHORS[i];
    if (f <= f1) return a0 + ((a1 - a0) * (f - f0)) / (f1 - f0);
  }
  return 360;
};

const VERT = `attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}`;
const FRAG = `precision mediump float;uniform sampler2D t;varying vec2 v;void main(){vec3 c=texture2D(t,vec2(v.x,v.y*.5)).rgb;float a=texture2D(t,vec2(v.x,.5+v.y*.5)).r;gl_FragColor=vec4(c*a,a);}`;

export function HeroTurn({
  video,
  poster,
  generated,
  name,
  heading,
  statement,
  captions,
  labels,
}: {
  video: string;
  poster: string;
  generated: boolean;
  name: string;
  heading: string;
  statement: string;
  captions: string[];
  labels: string[];
}) {
  const reduced = usePrefersReducedMotion();
  const pin = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const vid = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const p = pin.current;
    const st = stage.current;
    const c = canvas.current;
    const v = vid.current;
    if (!p || !st || !c || !v || reduced) return;
    const words = [...p.querySelectorAll<HTMLElement>("[data-word]")];
    const gl = c.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    const c2 = gl ? null : c.getContext("2d");
    let live = true;
    let raf = 0;

    let tex: WebGLTexture | null = null;
    let allocated = false;
    if (gl) {
      const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    const size = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      if (gl) gl.viewport(0, 0, c.width, c.height);
    };

    const drawFrame = () => {
      if (v.readyState < 2) return;
      if (gl && tex) {
        // Allocate once, then overwrite in place: cheaper than a new
        // texture every frame.
        if (!allocated) { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, v); allocated = true; }
        else gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGB, gl.UNSIGNED_BYTE, v);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      } else if (c2) {
        // No WebGL: the colour half only, on the page's own ground.
        const h = v.videoHeight / 2;
        c2.clearRect(0, 0, c.width, c.height);
        c2.drawImage(v, 0, 0, v.videoWidth, h, 0, 0, c.width, c.height);
      }
      c.dataset.ready = "";
    };

    /* The ring follows the video's own clock, every display frame. */
    const tick = () => {
      if (!live) return;
      const f = (v.currentTime * FPS) % 184;
      const ring = -angleAt(f);
      st.style.transform = `rotateY(${ring.toFixed(2)}deg)`;
      words.forEach((wd, i) => {
        const d = ((((i * STEP + ring) % 360) + 540) % 360) - 180;
        const o = Math.min(1, Math.max(0, (48 - Math.abs(d)) / 26));
        wd.style.opacity = o.toFixed(3);
      });
      /* The statement stays at full strength (2026-09-27): it is real text,
         and fading it with the words took it below contrast. */
      raf = requestAnimationFrame(tick);
    };

    type RVFC = HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number };
    const vf = v as RVFC;
    const onFrame = () => { drawFrame(); if (live && vf.requestVideoFrameCallback) vf.requestVideoFrameCallback(onFrame); };
    const loopDraw = () => { drawFrame(); if (live && !vf.requestVideoFrameCallback) requestAnimationFrame(loopDraw); };

    size();
    const start = () => {
      v.play().catch(() => {});
      if (vf.requestVideoFrameCallback) vf.requestVideoFrameCallback(onFrame);
      else requestAnimationFrame(loopDraw);
      raf = requestAnimationFrame(tick);
    };
    if (v.readyState >= 2) start();
    else v.addEventListener("loadeddata", start, { once: true });

    // Pause when the hero is off screen: nothing to spend a frame on.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { v.play().catch(() => {}); if (!raf) raf = requestAnimationFrame(tick); }
      else { v.pause(); cancelAnimationFrame(raf); raf = 0; }
    });
    io.observe(p);
    window.addEventListener("resize", size, { passive: true });
    return () => {
      live = false;
      io.disconnect();
      cancelAnimationFrame(raf);
      v.removeEventListener("loadeddata", start);
      window.removeEventListener("resize", size);
      v.pause();
    };
  }, [reduced]);

  return (
    <section id="top" className="th" aria-labelledby="th-h">
      <h1 id="th-h" className="sr-only">{heading}</h1>
      <div ref={pin} className="th-pin">
        <div className="th-ring" aria-hidden="true">
          <div ref={stage} className="th-stage">
            {WORDS.map((wd, i) => (
              <span key={wd} data-word="" className="th-ringword" style={{ "--seat": `${180 + i * STEP}deg` } as React.CSSProperties}>
                {/* Drawn by CSS from data-text: the ring is decoration (the h1
                    and the statement carry the words), and a half-faded
                    word would otherwise read to checkers as faint text. */}
                <span className="th-ringword-in" data-text={wd} />
              </span>
            ))}
          </div>
        </div>

        <div className="th-figure">
          <span className="th-shadow" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt={`${name}, from the front`} className="th-still" fetchPriority="high" decoding="async" />
          <canvas ref={canvas} className="th-canvas" aria-hidden="true" />
          {reduced ? null : (
            <video ref={vid} className="th-video" muted loop playsInline preload="auto" aria-hidden="true" tabIndex={-1}>
              <source src={`${video}.mp4`} type="video/mp4" />
              <source src={`${video}.webm`} type="video/webm" />
            </video>
          )}
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
      </div>
    </section>
  );
}
