"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, type PanInfo } from "motion/react";

/* VerticalImageStack, from 21st.dev, adapted for B Boutique (2026-09-24).
 *
 * Changed from the original:
 * - It listened for the mouse wheel on the WHOLE window, so every scroll
 *   anywhere on the page flipped a card. Here the section is a sticky stage
 *   and the page's own scroll through it chooses the card; dragging, the
 *   dots and the arrow keys move the page to that card's point, so scroll
 *   position and card never disagree.
 * - motion/react (already a dependency) instead of adding framer-motion.
 * - Plain <picture> sources the site already builds, not next/image.
 * - Reduced motion: no stage, the cards as a simple row.
 * - Each card can carry a caption and a link. */
export type StackItem = {
  id: string;
  sources: { type: string; srcSet: string }[];
  fallback: string;
  alt: string;
  title: string;
  sub: string;
  href: string;
};

const STYLE = (diff: number) =>
  diff === 0 ? { y: 0, scale: 1, opacity: 1, rotateX: 0, zIndex: 5 }
  : diff === -1 ? { y: -150, scale: 0.82, opacity: 0.55, rotateX: 8, zIndex: 4 }
  : diff === -2 ? { y: -260, scale: 0.7, opacity: 0.25, rotateX: 15, zIndex: 3 }
  : diff === 1 ? { y: 150, scale: 0.82, opacity: 0.55, rotateX: -8, zIndex: 4 }
  : diff === 2 ? { y: 260, scale: 0.7, opacity: 0.25, rotateX: -15, zIndex: 3 }
  : { y: diff > 0 ? 380 : -380, scale: 0.6, opacity: 0, rotateX: diff > 0 ? -20 : 20, zIndex: 0 };

export function VerticalImageStack({ items, children }: { items: StackItem[]; children?: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const n = items.length;

  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setCurrent(Math.min(n - 1, Math.max(0, Math.floor(p * n))));
  });

  /* Move the PAGE to card i, so the scroll stays the one source of truth. */
  const goTo = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    const i2 = Math.min(n - 1, Math.max(0, i));
    const range = el.offsetHeight - window.innerHeight;
    const y = el.getBoundingClientRect().top + window.scrollY + range * ((i2 + 0.5) / n);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 0.7 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  }, [n]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -50) goTo(current + 1);
    else if (info.offset.y > 50) goTo(current - 1);
  };


  const card = (item: StackItem, isCurrent: boolean) => (
    <a href={item.href} className="vis-card" tabIndex={reduce || isCurrent ? 0 : -1} aria-hidden={reduce || isCurrent ? undefined : true} draggable={false}>
      <picture>
        {item.sources.map((s) => <source key={s.type} type={s.type} srcSet={s.srcSet} sizes="(min-width: 768px) 340px, 70vw" />)}
        <img src={item.fallback} alt={item.alt} loading="lazy" decoding="async" draggable={false} className="vis-img" />
      </picture>
      <span className="vis-cap">
        <span className="vis-title">{item.title}</span>
        <span className="vis-sub">{item.sub}</span>
      </span>
    </a>
  );

  if (reduce) {
    return (
      <div className="vis vis--still">
        {children}
        <ul className="vis-still-row">{items.map((it) => <li key={it.id}>{card(it, true)}</li>)}</ul>
      </div>
    );
  }

  return (
    <div ref={track} className="vis" style={{ "--vis-n": n } as React.CSSProperties}>
      <div
        className="vis-stage"
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); goTo(current + 1); }
          if (e.key === "ArrowUp") { e.preventDefault(); goTo(current - 1); }
        }}
      >
        {children}
        <div className="vis-stack">
          {items.map((item, i) => {
            const diff = i - current;
            if (Math.abs(diff) > 2) return null;
            const s = STYLE(diff);
            return (
              <motion.div
                key={item.id}
                className="vis-slot"
                initial={false}
                animate={{ y: s.y, scale: s.scale, opacity: s.opacity, rotateX: s.rotateX }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag={diff === 0 ? "y" : false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragEnd={onDragEnd}
                style={{ zIndex: s.zIndex }}
              >
                {card(item, diff === 0)}
              </motion.div>
            );
          })}
        </div>

        <div className="vis-count" aria-hidden="true">
          <span className="vis-count-now">{String(current + 1).padStart(2, "0")}</span>
          <span className="vis-count-rule" />
          <span className="vis-count-all">{String(n).padStart(2, "0")}</span>
        </div>

        <div className="vis-dots">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              className="vis-dot"
              data-on={i === current ? "" : undefined}
              aria-label={`Show ${it.title}`}
              aria-current={i === current ? "true" : undefined}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
