// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

/* Parallax strip slider — vendored 2026-09-22 as the home hero, at the
 * client's request. The transition (the strip wipe, the zoom settle, the
 * split-character title, the circular click cursor) is the component's own
 * and is kept. What changed, and why each one had to:
 *
 *   - NO GOOGLE FONT. It injected a <link> to fonts.googleapis.com for
 *     Instrument Serif on mount. /privacy states, as a verified fact, that
 *     the site requests nothing from Google on page load; this would have
 *     made that false for every visitor. Titles use the site's Bodoni.
 *   - ART-DIRECTED IMAGES. `src` alone meant one file for every screen; the
 *     hero photographs have separate phone and desktop crops in AVIF, WebP
 *     and JPEG. `sources` renders a <picture>. The first frame is eager and
 *     high priority; the others are fetched once the page has settled.
 *   - LAYOUT FROM CSS, NOT JS. The stacked touch layout was chosen by a
 *     matchMedia check in an effect, so the server sent the desktop layout
 *     and a phone re-laid the hero out after hydration — a visible jump on
 *     the most-seen screen of the site. It is `pointer-coarse:` variants now.
 *     The JS check remains only for the follow-cursor, which is invisible
 *     until a mouse moves.
 *   - KEYBOARD. The click-to-navigate layer is a <div>; it now has real,
 *     focus-revealed Previous / Next buttons beside it.
 *   - PAUSE. `paused` stops the autoplay (WCAG 2.2.2: anything that moves on
 *     its own for more than five seconds needs a way to stop it).
 *   - `children` render in the bottom-right slot, above the click layer, so
 *     a call to action there is clickable.
 *   - Decorative images carry alt="": the old alt was the slide TITLE ("Open
 *     every day"), which is not a description of a photograph.
 *   - `chapter` renders only when given; the "Collection 01" fallback is
 *     gone (a boutique has no numbered collections to name).
 */

import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";

/* Inline stand-in for @gsap/react's useGSAP. Mirrors its default
   `revertOnUpdate: false`: one gsap.context lives for the component's
   lifetime, the callback is re-added when dependencies change, and the
   context is reverted only on unmount. */
function useGSAP(
  callback: () => void | (() => void),
  options?: {
    dependencies?: unknown[];
    scope?: { current: Element | null } | Element | null;
  }
) {
  const deps = options?.dependencies ?? [];
  const scope = options?.scope;
  const ctxRef = useRef<gsap.Context | null>(null);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  useLayoutEffect(() => {
    const el =
      scope && typeof scope === "object" && "current" in scope
        ? scope.current
        : (scope as Element | null);
    ctxRef.current = gsap.context(() => {}, el ?? undefined);
    return () => {
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (!ctxRef.current) return;
    cleanupRef.current?.();
    const ret = ctxRef.current.add(callback);
    cleanupRef.current = typeof ret === "function" ? ret : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

const STRIP_COUNT = 10;
const REVEAL_DURATION = 0.5;
const STRIP_STAGGER = 0.04;
const ZOOM_DURATION = 0.9;
const ZOOM_FROM = 1.2;
const AUTOPLAY_INTERVAL = 6000;
const TITLE_DURATION = 0.8;
const PROGRESS_DURATION = 0.9;

export type SlideSource = { media?: string; type: string; srcSet: string };

export type Slide = {
  src: string;
  /** Art-directed <picture> sources, most specific first. */
  sources?: SlideSource[];
  title: ReactNode;
  chapter?: string;
};

export type ParallaxStripSliderProps = {
  slides: Slide[];
  className?: string;
  stripCount?: number;
  revealDuration?: number;
  stripStagger?: number;
  zoomFrom?: number;
  zoomDuration?: number;
  autoplay?: boolean;
  /** Stops the autoplay while true. */
  paused?: boolean;
  showProgressBar?: boolean;
  showControls?: boolean;
  accentColor?: string;
  backgroundColor?: string;
  /** A gradient over the photographs, under the text. */
  scrim?: string;
  /** Bottom-right slot, above the click layer. */
  children?: ReactNode;
};

type TransitionDirection = "next" | "prev";

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function SlideImage({ slide, first = false }: { slide: Slide; first?: boolean }) {
  return (
    <picture>
      {slide.sources?.map((s) => (
        <source key={`${s.media ?? ""}${s.type}`} media={s.media} type={s.type} srcSet={s.srcSet} />
      ))}
      <img
        src={slide.src}
        alt=""
        draggable={false}
        fetchPriority={first ? "high" : "low"}
        loading={first ? undefined : "lazy"}
        decoding="async"
        className="absolute inset-0 h-full w-full select-none object-cover"
      />
    </picture>
  );
}

export default function ParallaxStripSlider({
  slides,
  className = "",
  stripCount = STRIP_COUNT,
  revealDuration = REVEAL_DURATION,
  stripStagger = STRIP_STAGGER,
  zoomFrom = ZOOM_FROM,
  zoomDuration = ZOOM_DURATION,
  autoplay = false,
  paused = false,
  showProgressBar = true,
  showControls = true,
  accentColor = "#ffffff",
  backgroundColor = "#000000",
  scrim,
  children,
}: ParallaxStripSliderProps) {
  const [current, setCurrent] = useState(0);
  const [incoming, setIncoming] = useState<number | null>(null);
  const [caption, setCaption] = useState(0);
  const [direction, setDirection] = useState<TransitionDirection>("next");
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  /* The other frames are fetched once the page has settled, so the first
     wipe has a picture to reveal rather than an empty strip. */
  const [warm, setWarm] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const chapterRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const titleInnerRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const stripsRef = useRef<HTMLDivElement[]>([]);
  const zoomRef = useRef<HTMLDivElement[]>([]);
  const isAnimating = useRef(false);
  const isFirstCaption = useRef(true);

  const cursorRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const isInside = useRef(false);
  const mouse = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });

  const total = slides.length;

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setIsCoarsePointer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let idle = 0;
    const go = () => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
      if (w.requestIdleCallback) idle = w.requestIdleCallback(() => setWarm(true));
      else idle = window.setTimeout(() => setWarm(true), 1200);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      window.removeEventListener("load", go);
      window.clearTimeout(idle);
    };
  }, []);

  const goTo = useCallback(
    (next: number, transitionDirection: TransitionDirection) => {
      if (isAnimating.current || next === current || total < 2) return;
      isAnimating.current = true;
      setDirection(transitionDirection);
      setIncoming(next);
    },
    [current, total]
  );

  const onNext = useCallback(() => goTo((current + 1) % total, "next"), [current, total, goTo]);
  const onPrev = useCallback(() => goTo((current - 1 + total) % total, "prev"), [current, total, goTo]);

  useEffect(() => {
    if (!autoplay || paused || !warm || total < 2) return;
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      if (!isAnimating.current) onNext();
    }, AUTOPLAY_INTERVAL);
    return () => window.clearInterval(id);
  }, [autoplay, paused, warm, total, onNext]);

  // Wipe + zoom + progress on slide change.
  useGSAP(
    () => {
      if (incoming === null) return;

      const strips = stripsRef.current.slice(0, stripCount).filter(Boolean);
      const zooms = zoomRef.current.slice(0, stripCount).filter(Boolean);
      if (!strips.length) return;
      const isPrevious = direction === "prev";
      const orderedStrips = isPrevious ? [...strips].reverse() : strips;

      const settle = () => {
        setCaption(incoming);
        setCurrent(incoming);
        setIncoming(null);
        isAnimating.current = false;
      };

      if (prefersReducedMotion()) {
        settle();
        return;
      }

      const tl = gsap.timeline({ onComplete: settle });

      tl.fromTo(
        orderedStrips,
        { clipPath: isPrevious ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" },
        {
          clipPath: isPrevious ? "inset(0 0 0 0%)" : "inset(0 0% 0 0)",
          duration: revealDuration,
          ease: "power3.out",
          stagger: stripStagger,
        },
        0
      );

      tl.fromTo(zooms, { scale: zoomFrom }, { scale: 1, duration: zoomDuration, ease: "power3.out" }, 0);

      if (progressRef.current) {
        tl.to(
          progressRef.current,
          { scaleX: (incoming + 1) / total, duration: PROGRESS_DURATION, ease: "power3.inOut" },
          0
        );
      }

      const outgoing = [captionRef.current, titleRef.current].filter(Boolean);
      if (outgoing.length) {
        tl.to(outgoing, { autoAlpha: 0, y: -2, duration: 0.35, ease: "power2.in" }, 0.15);
        tl.add(() => setCaption(incoming), 0.5);
      }
    },
    {
      dependencies: [incoming, direction, stripCount, revealDuration, stripStagger, zoomFrom, zoomDuration],
      scope: rootRef,
    }
  );

  // Incoming caption reveal.
  useGSAP(
    () => {
      if (isFirstCaption.current) {
        isFirstCaption.current = false;
        return;
      }
      if (!captionRef.current || !titleRef.current) return;

      gsap.set([captionRef.current, titleRef.current], { autoAlpha: 1, y: 0 });

      if (prefersReducedMotion()) {
        gsap.set([chapterRef.current, titleRef.current], { autoAlpha: 1, y: 0, yPercent: 0 });
        return;
      }

      /* The whole title rises out of its own mask as one piece.
         ── Why not the letter-by-letter SplitText reveal it came with ──
         SplitText works by REWRITING the title's HTML: it wraps every
         letter in a new element, then puts copies back afterwards. React
         owns that HTML. Twice on 2026-09-22 the live page crashed to "This
         page couldn't load" because React went to update nodes SplitText
         had swapped out, and between the rewrite and the revert the lines
         re-wrapped, which is the glitch the client photographed. Keying the
         element fixed the first crash but not the class of bug. Nothing
         here touches the DOM React renders now: the inner span is moved by
         a transform and nothing else, so there is nothing left to disagree
         about. */
      const tl = gsap.timeline();
      if (titleInnerRef.current) {
        tl.fromTo(
          titleInnerRef.current,
          { yPercent: 105 },
          { yPercent: 0, duration: TITLE_DURATION, ease: "power3.out" },
          0
        );
      }

      if (chapterRef.current) {
        tl.fromTo(chapterRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0);
      }
    },
    { dependencies: [caption], scope: rootRef }
  );

  // Circular cursor: smooth follow + arrow that flips with the pointer side.
  useEffect(() => {
    if (!showControls || isCoarsePointer) return;
    const cursor = cursorRef.current;
    const l1 = line1Ref.current;
    const l2 = line2Ref.current;
    if (!cursor || !l1 || !l2) return;

    gsap.set(cursor, { xPercent: -50, yPercent: -50, opacity: 0, scale: 0.6 });
    gsap.set(l1, { transformOrigin: "100% 50%", xPercent: -50, yPercent: -50, y: -1.5, rotation: 45, x: 0 });
    gsap.set(l2, { transformOrigin: "100% 50%", xPercent: -50, yPercent: -50, y: 1.5, rotation: -45, x: 0 });

    let currentSide: "left" | "right" = "right";
    let rafId: number | null = null;

    const handleMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const target = e.target instanceof Element ? e.target : null;
      const isOverControls = Boolean(
        target?.closest('button, input, textarea, select, a, label, [role="button"], [contenteditable="true"], header')
      );

      mouse.current.x = x;
      mouse.current.y = y;

      const rect = rootRef.current?.getBoundingClientRect();
      const isOut = !rect || x <= rect.left || y <= rect.top || x >= rect.right || y >= rect.bottom;

      if (isOut || isOverControls) {
        if (isInside.current) {
          isInside.current = false;
          gsap.to(cursor, { opacity: 0, scale: 0.6, duration: 0.25, ease: "power3.inOut" });
        }
        return;
      }

      if (!isInside.current) {
        pos.current.x = x;
        pos.current.y = y;
        gsap.set(cursor, { x, y });
        gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.25, ease: "power3.out" });
        isInside.current = true;
      }

      const isLeft = rect ? x < rect.left + rect.width / 2 : false;
      const nextSide = isLeft ? "left" : "right";

      if (nextSide !== currentSide) {
        currentSide = nextSide;
        const flip = nextSide === "left";
        gsap.to(l1, { rotation: flip ? 135 : 45, x: flip ? "-1vw" : 4, duration: 0.35, ease: "power3.inOut" });
        gsap.to(l2, { rotation: flip ? -135 : -45, x: flip ? "-1vw" : 4, duration: 0.35, ease: "power3.inOut" });
      }
    };

    const render = () => {
      pos.current.x += (mouse.current.x - pos.current.x) * 0.12;
      pos.current.y += (mouse.current.y - pos.current.y) * 0.12;
      gsap.set(cursor, { x: pos.current.x, y: pos.current.y });
      rafId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", handleMove);
    render();

    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [showControls, isCoarsePointer]);

  const renderStrips = (slide: Slide) => {
    const width = 100 / stripCount;
    return Array.from({ length: stripCount }, (_, i) => (
      <div
        key={i}
        ref={(el) => {
          if (el) stripsRef.current[i] = el;
        }}
        className="absolute inset-y-0 overflow-hidden"
        style={{
          left: `${i * width}%`,
          width: `${width}%`,
          marginLeft: i === 0 ? 0 : "-0.5px",
          paddingLeft: i === 0 ? 0 : "0.5px",
        }}
      >
        <div className="absolute inset-y-0" style={{ left: `-${i * 100}%`, width: `${stripCount * 100}%` }}>
          <div
            ref={(el) => {
              if (el) zoomRef.current[i] = el;
            }}
            className="relative h-full w-full will-change-transform"
          >
            <SlideImage slide={slide} />
          </div>
        </div>
      </div>
    ));
  };

  const activeSlide = slides[caption];

  return (
    <div
      ref={rootRef}
      style={{ backgroundColor }}
      className={`parallax-strip-slider relative h-full w-full overflow-hidden ${className}`}
    >
      {/* Outgoing slide, revealed away underneath. */}
      <div className="absolute inset-0">
        <SlideImage slide={slides[current]} first={current === 0} />
      </div>

      {/* Incoming slide, mounted only during a transition. */}
      {incoming !== null && <div className="absolute inset-0">{renderStrips(slides[incoming])}</div>}

      {/* The other frames, fetched once the page has settled. Invisible and
          out of the accessibility tree; they exist only to be in the cache
          when the first wipe needs them. */}
      {warm ? (
        <div aria-hidden="true" className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
          {slides.map((s, i) => (i === current ? null : <SlideImage key={i} slide={s} />))}
        </div>
      ) : null}

      {scrim ? <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: scrim }} /> : null}

      {/* Click-to-navigate overlay: left half steps back, right half advances. */}
      {showControls && total > 1 && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-20 cursor-none pointer-coarse:cursor-pointer"
          onClick={(e) => {
            if (isAnimating.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            if (e.clientX < rect.left + rect.width / 2) onPrev();
            else onNext();
          }}
        />
      )}

      {/* The same two actions for a keyboard, revealed on focus. */}
      {showControls && total > 1 && (
        <div className="absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 gap-2">
          <button type="button" onClick={onPrev} className="pss-key">
            Previous photograph
          </button>
          <button type="button" onClick={onNext} className="pss-key">
            Next photograph
          </button>
        </div>
      )}

      {showProgressBar && (
        <div
          className="pointer-events-none absolute inset-x-6 bottom-6 z-10 h-px sm:inset-x-10"
          style={{ backgroundColor: `${accentColor}33` }}
        >
          <div
            ref={progressRef}
            className="h-full w-full origin-left"
            style={{ transform: `scaleX(${(caption + 1) / total})`, backgroundColor: accentColor }}
          />
        </div>
      )}

      <div ref={captionRef} className="pointer-events-none absolute inset-x-0 top-0 px-6 pt-12 sm:px-10 sm:pt-16">
        {activeSlide.chapter ? (
          <span ref={chapterRef} className="block text-xs font-medium tracking-wide" style={{ color: accentColor }}>
            {activeSlide.chapter}
          </span>
        ) : null}
      </div>

      {/* Bottom bar: title left, slot right on a mouse; stacked on touch and
          below 640px (a narrow window with a mouse squeezed the title). */}
      <div className="absolute inset-x-0 bottom-0 flex items-end gap-6 px-[18px] pb-14 sm:px-10 md:px-[var(--bb-gutter-editorial)] pointer-coarse:flex-col pointer-coarse:items-start pointer-coarse:gap-6 pointer-coarse:pb-16 max-sm:flex-col max-sm:items-start">
        {/* key={caption}: a new element per slide, so a title never inherits
            the previous one's transform mid-animation. */}
        <p
          key={caption}
          ref={titleRef}
          aria-live="off"
          className="pss-title pointer-events-none flex-1 overflow-hidden"
          style={{ color: accentColor }}
        >
          <span ref={titleInnerRef} className="block">
            {activeSlide.title}
          </span>
        </p>
        {children ? <div className="relative z-30 shrink-0">{children}</div> : null}
      </div>

      {showControls && total > 1 && !isCoarsePointer && (
        <div ref={cursorRef} className="pointer-events-none fixed left-0 top-0 z-[100]" aria-hidden="true">
          <div className="flex size-15 items-center justify-center rounded-full" style={{ backgroundColor: accentColor }}>
            <div className="relative size-7.5">
              <span ref={line1Ref} className="absolute left-1/2 top-1/2 h-0.5 w-4" style={{ backgroundColor: "#1A1416" }} />
              <span ref={line2Ref} className="absolute left-1/2 top-1/2 h-0.5 w-4" style={{ backgroundColor: "#1A1416" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
