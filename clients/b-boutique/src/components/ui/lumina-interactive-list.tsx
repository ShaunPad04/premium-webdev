"use client";

/* Lumina interactive list — the home hero since 2026-09-23 (client's pick,
 * from 21st.dev). Full-bleed photographs that change through a glass-bubble
 * WebGL transition, a large title, a line under it, and a list of the slides
 * along the foot with a progress line on the one that is playing.
 *
 * What changed on the way in, and why:
 *
 *   - NO CDN SCRIPTS. The original fetched GSAP and three.js from cdnjs at
 *     runtime (~600 KB, a third-party request /privacy says the page never
 *     makes). The transition here is the same glass shader on a bare WebGL
 *     quad: a few KB, no library, nothing leaves the site.
 *   - THE FIRST FRAME IS HTML. The original rendered an empty heading and
 *     filled it after its scripts arrived, which would hold the page's
 *     largest paint back by seconds. Here the first photograph and title are
 *     in the server HTML, untouched; WebGL starts after the page settles and
 *     only ever draws DURING a transition, then hands back to the <img>.
 *   - REACT OWNS THE DOM. No innerHTML or getElementById: titles are split
 *     into letters by React, and the letter rise is CSS.
 *   - HER PHOTOGRAPHS AND HER WORDS. The demo's six stock images and
 *     invented taglines are replaced by the five hero frames and lines the
 *     site already carries, via HeroStrips.
 *   - The site's type and palette. The demo's CSS variables brought gold
 *     (#d4af37, rejected for this site) and two commercial faces; neither
 *     came across.
 *   - Operable: the slide list is real buttons, there is a pause control
 *     (it moves on its own; WCAG 2.2.2), a swipe on touch, it stops when off
 *     screen or in a hidden tab, and under reduced motion there is no
 *     autoplay and slides change without animation. With no WebGL (or if a
 *     texture fails) slides cross-fade instead.
 */

import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

export type LuminaSource = { media?: string; type: string; srcSet: string; sizes?: string };
export type LuminaSlide = {
  /** "|" breaks the line; *word* is set in italic. */
  title: string;
  /** The slide's name in the list along the foot. */
  label: string;
  /** Optional: the centred layout shows the title and the button only. */
  description?: string;
  src: string;
  sources: LuminaSource[];
};

const INTERVAL_MS = 6500;
const TRANSITION_MS = 1700;

const pad = (n: number) => String(n).padStart(2, "0");
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const RM = "(prefers-reduced-motion: reduce)";
const reducedMotion = () => window.matchMedia?.(RM).matches ?? false;
const onMotionChange = (cb: () => void) => {
  const m = window.matchMedia?.(RM);
  m?.addEventListener("change", cb);
  return () => m?.removeEventListener("change", cb);
};
const plainTitle = (t: string) => t.replace(/\|/g, " ").replace(/\*/g, "").replace(/\s+/g, " ").trim();

/* ── The glass transition, on a bare WebGL quad ─────────────────────────── */

const VERT = `attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

/* The original's glassEffect with its default settings folded in: a bubble
   of the next photograph grows from the centre, refracting and splitting
   colour slightly at its rim, until it fills the frame. */
const FRAG = `
precision highp float;
uniform sampler2D uTexture1, uTexture2;
uniform float uProgress;
uniform vec2 uResolution, uTexture1Size, uTexture2Size;
varying vec2 vUv;
vec2 cover(vec2 uv, vec2 ts) {
  vec2 s = uResolution / ts; float sc = max(s.x, s.y);
  vec2 sz = ts * sc; vec2 off = (uResolution - sz) * 0.5;
  return (uv * uResolution - off) / sz;
}
void main() {
  float progress = uProgress;
  float time = progress * 5.0;
  vec2 uv1 = cover(vUv, uTexture1Size); vec2 uv2 = cover(vUv, uTexture2Size);
  float maxR = length(uResolution) * 0.85; float br = progress * maxR;
  vec2 p = vUv * uResolution; vec2 c = uResolution * 0.5;
  float d = length(p - c); float nd = d / max(br, 0.001);
  float param = smoothstep(br + 3.0, br - 3.0, d);
  vec4 img;
  if (param > 0.0) {
    float ro = 0.08 * pow(smoothstep(0.3, 1.0, nd), 1.5);
    vec2 dir = (d > 0.0) ? (p - c) / d : vec2(0.0);
    vec2 distUV = uv2 - dir * ro;
    distUV += vec2(sin(time + nd * 10.0), cos(time * 0.8 + nd * 8.0)) * 0.015 * nd * param;
    float ca = 0.02 * pow(smoothstep(0.3, 1.0, nd), 1.2);
    img = vec4(texture2D(uTexture2, distUV + dir * ca * 1.2).r, texture2D(uTexture2, distUV + dir * ca * 0.2).g, texture2D(uTexture2, distUV - dir * ca * 0.8).b, 1.0);
    float rim = smoothstep(0.95, 1.0, nd) * (1.0 - smoothstep(1.0, 1.01, nd));
    img.rgb += rim * 0.08;
  } else { img = texture2D(uTexture2, uv2); }
  vec4 oldImg = texture2D(uTexture1, uv1);
  if (progress > 0.95) img = mix(img, texture2D(uTexture2, uv2), (progress - 0.95) / 0.05);
  gl_FragColor = mix(oldImg, img, param);
}`;

type Glass = {
  texture: (img: HTMLImageElement) => { tex: WebGLTexture; w: number; h: number } | null;
  draw: (a: { tex: WebGLTexture; w: number; h: number }, b: { tex: WebGLTexture; w: number; h: number }, progress: number) => void;
  resize: () => void;
  dispose: () => void;
};

function createGlass(canvas: HTMLCanvasElement): Glass | null {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
  if (!gl) return null;
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = (n: string) => gl.getUniformLocation(prog, n);
  const uT1 = u("uTexture1"), uT2 = u("uTexture2"), uP = u("uProgress"), uR = u("uResolution"), uS1 = u("uTexture1Size"), uS2 = u("uTexture2Size");
  gl.uniform1i(uT1, 0);
  gl.uniform1i(uT2, 1);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uR, w, h);
  };

  return {
    texture(img) {
      const tex = gl.createTexture();
      if (!tex || !img.naturalWidth) return null;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      return { tex, w: img.naturalWidth, h: img.naturalHeight };
    },
    draw(a, b, progress) {
      resize();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, a.tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, b.tex);
      gl.uniform2f(uS1, a.w, a.h);
      gl.uniform2f(uS2, b.w, b.h);
      gl.uniform1f(uP, progress);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    resize,
    dispose() {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

/* ── The title, split into letters by React ─────────────────────────────── */

/* The letters are hidden from assistive technology and the plain sentence
   is given once beside them (aria-label is not allowed on a paragraph). */
export function LuminaTitle({ text }: { text: string }) {
  let i = 0;
  const lines = text.split("|");
  return (
    <>
      <span className="sr-only">{plainTitle(text)}</span>
      <span aria-hidden="true">
        {lines.map((line, li) => (
          <span key={li} className="lm-line">
            {line
              .split(/(\*[^*]+\*)/)
              .filter(Boolean)
              .map((chunk, ci) => {
                const em = chunk.startsWith("*");
                const words = (em ? chunk.slice(1, -1) : chunk).split(/(\s+)/);
                const inner = words.map((w, wi) =>
                  /^\s+$/.test(w) ? (
                    w
                  ) : w ? (
                    <span key={wi} className="lm-word">
                      {[...w].map((ch, k) => (
                        <span key={k} className="lm-ch" style={{ ["--i" as string]: i++ }}>
                          {ch}
                        </span>
                      ))}
                    </span>
                  ) : null,
                );
                return em ? <em key={ci}>{inner}</em> : <span key={ci}>{inner}</span>;
              })}
          </span>
        ))}
      </span>
    </>
  );
}

/* ── The component ──────────────────────────────────────────────────────── */

export function LuminaInteractiveList({
  slides,
  children,
  layout = "foot",
  list = true,
}: {
  slides: LuminaSlide[];
  children?: ReactNode;
  /** "foot": count, title and line at the bottom left (the 21st.dev original).
      "centre": one title in the middle of the frame (2026-09-23, Brad). */
  layout?: "foot" | "centre";
  /** false: no slide list along the foot (2026-09-23, Brad: the logo and one
      button only). The slides still advance and still swipe; a hidden timer
      stands in for the list's progress line. */
  list?: boolean;
}) {
  const total = slides.length;
  const [current, setCurrent] = useState(0);
  const [caption, setCaption] = useState(0);
  const [animated, setAnimated] = useState(false);
  const [warm, setWarm] = useState(false);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [inView, setInView] = useState(true);
  const [tabHidden, setTabHidden] = useState(false);
  /* Reduced motion, read from the browser (false on the server). */
  const still = useSyncExternalStore(onMotionChange, reducedMotion, () => false);
  const [glOn, setGlOn] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const imgs = useRef<(HTMLImageElement | null)[]>([]);
  const glass = useRef<Glass | null>(null);
  const glFailed = useRef(false);
  const textures = useRef(new Map<string, { tex: WebGLTexture; w: number; h: number }>());
  const busy = useRef(false);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  /* Settle first: nothing extra happens until the page has loaded and gone
     idle, so the first paint is only HTML and one photograph. */
  useEffect(() => {
    let idle = 0;
    const go = () => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
      if (w.requestIdleCallback) idle = w.requestIdleCallback(() => setWarm(true));
      else idle = window.setTimeout(() => setWarm(true), 1200);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("load", go);
      window.clearTimeout(idle);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* WebGL, once settled, and never under reduced motion. */
  useEffect(() => {
    if (!warm || still || !canvas.current) return;
    const g = createGlass(canvas.current);
    if (!g) {
      glFailed.current = true;
      return;
    }
    glass.current = g;
    const ro = new ResizeObserver(() => g.resize());
    ro.observe(canvas.current);
    const tex = textures.current;
    return () => {
      ro.disconnect();
      g.dispose();
      glass.current = null;
      tex.clear();
    };
  }, [warm, still]);

  const textureFor = useCallback(async (i: number) => {
    const g = glass.current;
    const img = imgs.current[i];
    if (!g || !img) return null;
    if (!img.complete || !img.naturalWidth) {
      await img.decode().catch(() => undefined);
    }
    const key = `${i}:${img.currentSrc}`;
    const hit = textures.current.get(key);
    if (hit) return hit;
    const t = g.texture(img);
    if (t) textures.current.set(key, t);
    return t;
  }, []);

  const goTo = useCallback(
    async (target: number) => {
      if (busy.current || target === current || total < 2) return;
      busy.current = true;
      setAnimated(true);

      const g = glass.current;
      const a = g && !still && !glFailed.current ? await textureFor(current) : null;
      const b = a ? await textureFor(target) : null;

      if (!g || !a || !b) {
        /* Cross-fade (or, under reduced motion, an instant change). */
        setCaption(target);
        setCurrent(target);
        window.setTimeout(() => (busy.current = false), still ? 0 : 900);
        return;
      }

      g.draw(a, b, 0);
      setGlOn(true);
      const start = performance.now();
      let captioned = false;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / TRANSITION_MS);
        g.draw(a, b, easeInOut(t));
        if (!captioned && t > 0.32) {
          captioned = true;
          setCaption(target);
        }
        if (t < 1) {
          requestAnimationFrame(tick);
          return;
        }
        setCurrent(target);
        /* Hand back to the <img> on the next frame, once it is showing. */
        requestAnimationFrame(() => {
          setGlOn(false);
          busy.current = false;
        });
      };
      requestAnimationFrame(tick);
    },
    [current, total, still, textureFor],
  );

  const next = useCallback(() => goTo((current + 1) % total), [goTo, current, total]);
  const prev = useCallback(() => goTo((current - 1 + total) % total), [goTo, current, total]);

  const playing = warm && !still && !paused && !held && inView && !tabHidden && total > 1;

  const onPointerDown = (e: ReactPointerEvent) => {
    if ((e.target as Element).closest("a, button")) return;
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: ReactPointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y)) (dx < 0 ? next : prev)();
  };

  const slide = slides[caption];

  return (
    <div
      ref={root}
      className={layout === "centre" ? "lm lm--centre" : "lm"}
      data-gl={glOn || undefined}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (swipe.current = null)}
      /* Hold the slide while a KEYBOARD is inside it (WCAG 2.2.2). A mouse
         click also focuses the button, and holding on that stopped the
         autoplay for good after the first click. */
      onFocusCapture={(e) => {
        if ((e.target as Element).matches?.(":focus-visible")) setHeld(true);
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld(false);
      }}
    >
      <div className="lm-stage" aria-hidden="true">
        {slides.map((s, i) =>
          i === 0 || warm ? (
            <picture key={s.src} className="lm-pic" data-on={i === current || undefined}>
              {s.sources.map((src) => (
                <source key={`${src.media ?? ""}${src.type}`} media={src.media} type={src.type} srcSet={src.srcSet} sizes={src.sizes} />
              ))}
              <img
                ref={(el) => {
                  imgs.current[i] = el;
                }}
                src={s.src}
                alt=""
                draggable={false}
                decoding="async"
                /* "auto", not "high" (2026-09-24): the phone LCP is the
                   hero title, not this photo, and a high-priority 223KB
                   image delayed the title in simulated mobile LCP
                   (median 4.9s -> 4.4s, n=3). Desktop LCP unchanged at 1.1s. */
                fetchPriority={i === 0 ? "auto" : "low"}
                loading={i === 0 ? undefined : "lazy"}
              />
            </picture>
          ) : null,
        )}
        <canvas ref={canvas} className="lm-canvas" data-on={glOn || undefined} />
      </div>
      <div className="lm-scrim" aria-hidden="true" />

      <div className="lm-content">
        {layout === "foot" ? (
          <p className="lm-count" aria-hidden="true">
            <span>{pad(caption + 1)}</span>
            <span className="lm-count-rule" />
            <span className="lm-count-total">{pad(total)}</span>
          </p>
        ) : null}
        <p key={`t${caption}`} className="lm-title" data-anim={animated || undefined}>
          {/* One slide: no change animation, so no per-letter spans either
              (they made a single letter the page's largest paint). */}
          {total > 1 ? <LuminaTitle text={slide.title} /> : slide.title}
        </p>
        {slide.description ? (
          <p key={`d${caption}`} className="lm-desc" data-anim={animated || undefined}>
            {slide.description}
          </p>
        ) : null}
        <div className="lm-actions">
          {children}
          {still || total < 2 ? null : (
            <button
              type="button"
              className="hero-pause"
              onClick={() => setPaused((v) => !v)}
              aria-pressed={paused}
              aria-label={paused ? "Play the photographs" : "Pause the photographs"}
            >
              {paused ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M4 2.5v9l7.5-4.5L4 2.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M4.5 2.5v9M9.5 2.5v9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {total > 1 && !list ? (
        <span
          key={`timer-${current}`}
          className="lm-timer"
          aria-hidden="true"
          data-run={!still || undefined}
          style={{ animationDuration: `${INTERVAL_MS}ms`, animationPlayState: playing ? "running" : "paused" }}
          onAnimationEnd={next}
        />
      ) : null}

      {total > 1 && list ? (
        <nav className="lm-nav" aria-label="Hero photographs">
          <ol>
            {slides.map((s, i) => (
              <li key={s.src}>
                <button
                  type="button"
                  className="lm-item"
                  aria-current={i === current ? "true" : undefined}
                  aria-label={`Photograph ${i + 1} of ${total}: ${s.label}`}
                  onClick={() => goTo(i)}
                >
                  <span className="lm-track">
                    <span
                      key={`${i}-${current}`}
                      className="lm-fill"
                      data-run={(i === current && !still) || undefined}
                      style={{ animationDuration: `${INTERVAL_MS}ms`, animationPlayState: playing ? "running" : "paused" }}
                      onAnimationEnd={i === current ? next : undefined}
                    />
                  </span>
                  <span className="lm-label">{s.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
    </div>
  );
}

export default LuminaInteractiveList;
