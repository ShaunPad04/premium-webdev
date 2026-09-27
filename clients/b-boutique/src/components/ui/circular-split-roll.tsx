"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/* Circular Split Roll (21st.dev, 2026-09-27, Brad: for Up close). Titles
 * roll round a circle on the left, images round a larger one on the right,
 * scrubbed by a pinned ScrollTrigger. Below 1026px the roll is not drawn
 * (Up close shows a card pile there instead); under reduced motion a plain
 * grid of the same cards shows on every screen. The grid is always in the
 * page for screen readers.
 *
 * Changed on the way in:
 * - GSAP and ScrollTrigger are imported on demand, when the section nears
 *   the screen, as StickyContentWrapper does: the home page does not ship
 *   GSAP up front.
 * - ScrollTrigger is kept in step with Lenis (the site's smooth scroll).
 * - The demo's ten base64 photographs and titles are gone; items are
 *   required, and each image is a <picture> (AVIF + WebP), lazy.
 * - The rolling layer is decorative (aria-hidden, alt=""); the grid under it
 *   is what a screen reader reads on every screen size.
 * - Colours and the title face come from the caller (className / props),
 *   not shadcn's bg-background / text-foreground tokens, which this site
 *   does not define. */

type LenisLike = { on: (e: "scroll", f: () => void) => void; off: (e: "scroll", f: () => void) => void };

export type CircularSplitRollItem = { id: string; title: string; avif: string; webp: string; alt: string };

type Props = {
  items: CircularSplitRollItem[];
  className?: string;
  /** Scroll length per item, in % of the viewport height. */
  sectionHeight?: number;
  radius?: number;
  cardSize?: number;
  titleSize?: string;
  scrub?: number;
  textSideScale?: number;
  textSideOpacity?: number;
  imageSideScale?: number;
  imageSideOpacity?: number;
  columnSpreadVw?: number;
  columnOffsetPx?: number;
};

const DESKTOP_WIDTH = 1200;
const TABLET_MIN_WIDTH = 768;

const wrap = (v: number) => ((v % 1) + 1) % 1;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/* Depth -1..1 to strength 0..1, then eased so only the item on the focus
   arc reads at full size. */
const focus = (depth: number, start: number, power: number) =>
  Math.pow(clamp01((clamp01((depth + 1) / 2) - start) / (1 - start)), power);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

function Pic({ item, alt }: { item: CircularSplitRollItem; alt: string }) {
  return (
    <picture>
      <source type="image/avif" srcSet={item.avif} />
      <img src={item.webp} alt={alt} loading="lazy" decoding="async" draggable={false} className="pointer-events-none absolute inset-0 block h-full w-full select-none object-cover" />
    </picture>
  );
}

export default function CircularSplitRoll({
  items,
  className = "",
  sectionHeight = 45,
  radius = 500,
  cardSize = 205,
  titleSize = "clamp(28px, 3vw, 56px)",
  scrub = 1.2,
  textSideScale = 0.68,
  textSideOpacity = 0.18,
  imageSideScale = 0.58,
  imageSideOpacity = 0.14,
  columnSpreadVw = 5,
  columnOffsetPx = 500,
}: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const n = items.length;

  useEffect(() => {
    const root = rootRef.current;
    const sticky = stickyRef.current;
    if (!root || !sticky || reduced || n === 0) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    const start = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1026px)", () => {
        const left = gsap.utils.toArray<HTMLElement>(".csr-left", root);
        const right = gsap.utils.toArray<HTMLElement>(".csr-right", root);
        let last = 0;

        const render = (p: number) => {
          last = p;
          const w = window.innerWidth;
          const f = w < DESKTOP_WIDTH && w >= TABLET_MIN_WIDTH ? w / DESKTOP_WIDTH : 1;
          root.style.setProperty("--csr-card", `${cardSize * f}px`);
          const r = radius * f;
          left.forEach((node, i) => {
            const a = wrap(i / n - p + 0.5 / n) * Math.PI * 2 + Math.PI;
            const s = focus(Math.sin(a), 0.42, 2.6);
            gsap.set(node, { x: Math.sin(a) * r, y: Math.cos(a) * r, scale: lerp(textSideScale, 1, s), opacity: lerp(textSideOpacity, 1, s), zIndex: Math.round(lerp(1, 30, s)) });
          });
          right.forEach((node, i) => {
            const a = wrap(i / n - p + 0.5 / n) * Math.PI * 2;
            const s = focus(-Math.sin(a), 0.45, 3.2);
            gsap.set(node, { x: Math.sin(a) * r, y: Math.cos(a) * r, scale: lerp(imageSideScale, 1, s), opacity: lerp(imageSideOpacity, 1, s), zIndex: Math.round(lerp(1, 40, s)) });
          });
        };
        render(0);

        const st = ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: `+=${sectionHeight * n}%`,
          pin: sticky,
          scrub,
          invalidateOnRefresh: true,
          onUpdate: (self) => render(self.progress),
        });
        const onResize = () => render(last);
        window.addEventListener("resize", onResize);
        return () => { window.removeEventListener("resize", onResize); st.kill(); };
      });

      const lenis = (window as Window & { __lenis?: LenisLike }).__lenis;
      const update = () => ScrollTrigger.update();
      lenis?.on("scroll", update);
      ScrollTrigger.refresh();
      cleanup = () => { lenis?.off("scroll", update); mm.revert(); };
    };

    const io = new IntersectionObserver((e) => {
      if (e.some((x) => x.isIntersecting)) { io.disconnect(); start(); }
    }, { rootMargin: "100% 0px" });
    io.observe(root);
    return () => { cancelled = true; io.disconnect(); cleanup?.(); };
  }, [n, reduced, sectionHeight, radius, cardSize, scrub, textSideScale, textSideOpacity, imageSideScale, imageSideOpacity]);

  return (
    <section
      ref={rootRef}
      className={`csr relative w-full overflow-clip ${className}`}
      style={{ "--csr-title": titleSize, "--csr-card": `${cardSize}px` } as CSSProperties}
    >
      <div ref={stickyRef} aria-hidden="true" className={`relative h-screen w-full overflow-hidden ${reduced ? "hidden" : "max-[1025px]:hidden"}`}>
        <div className="relative mx-auto flex h-full w-full">
          <div className="relative flex h-full w-[50vw] items-center justify-center" style={{ transform: `translateX(calc(${columnSpreadVw}vw - ${columnOffsetPx}px))` }}>
            <div className="relative h-[78vh]">
              {items.map((item) => (
                <div key={item.id} className="csr-left pointer-events-none absolute left-1/2 top-1/2 whitespace-nowrap text-center leading-none opacity-0 will-change-[transform,opacity]" style={{ fontSize: "var(--csr-title)", translate: "-50% -50%" }}>
                  {item.title}
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex h-full w-[50vw] items-center justify-center" style={{ transform: `translateX(calc(${columnOffsetPx}px - ${columnSpreadVw}vw))` }}>
            <div className="relative h-[78vh]">
              {items.map((item) => (
                <div key={item.id} className="csr-right absolute left-1/2 top-1/2 opacity-0 will-change-[transform,opacity]" style={{ width: "var(--csr-card)", height: "var(--csr-card)", margin: "calc(var(--csr-card) * -0.5) 0 0 calc(var(--csr-card) * -0.5)" }}>
                  <div className="csr-card relative h-full w-full overflow-hidden">
                    <Pic item={item} alt="" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`csr-grid w-full ${reduced ? "block" : "sr-only"}`}>
        <ul className="csr-grid-list">
          {items.map((item) => (
            <li key={item.id}>
              <div className="csr-card relative aspect-square w-full overflow-hidden">
                <Pic item={item} alt={item.alt} />
              </div>
              <h3 className="csr-grid-title">{item.title}</h3>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
