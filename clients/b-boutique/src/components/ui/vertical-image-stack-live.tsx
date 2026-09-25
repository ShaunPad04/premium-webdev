"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, type PanInfo } from "motion/react";
import { STYLE, StackCard, StackChrome, type StackItem } from "./vertical-image-stack-parts";

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
/* Drag is for a mouse only (2026-09-24, Brad: on a phone the stack
   sometimes moved "by itself"). On touch, a swipe that began on a card was
   taken as a card drag, and its end called goTo, which smooth-scrolled the
   page to the next card without the reader scrolling. Touch now only
   scrolls the page; the page's scroll alone turns the cards. */
const FINE = "(hover: hover) and (pointer: fine)";
const subFine = (cb: () => void) => {
  const m = window.matchMedia(FINE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const useFinePointer = () =>
  useSyncExternalStore(subFine, () => window.matchMedia(FINE).matches, () => false);

export default function VerticalImageStackLive({ items, children }: { items: StackItem[]; children?: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const fine = useFinePointer();
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


  const card = (item: StackItem, isCurrent: boolean) => <StackCard item={item} focusable={!!reduce || isCurrent} />;


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
                drag={fine && diff === 0 ? "y" : false}
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

        <StackChrome n={n} current={current} labels={items.map((it) => it.title)} onGo={goTo} />
      </div>
    </div>
  );
}
