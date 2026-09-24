"use client";

import Link from "next/link";
import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

import { ProductPhoto } from "@/components/ProductPhoto";

/* CollectionSurfer — from 21st.dev, adapted for B Boutique (2026-09-24,
 * Brad: "change Step inside to this").
 *
 * What changed from the original, and why:
 * - `motion/react`, not `framer-motion`: the same library under its current
 *   name, already a dependency. Installing framer-motion as well would ship
 *   the animation engine twice.
 * - No 50,000px spacer, no `position: fixed` viewport, no infinite modulo
 *   loop. The original assumed it WAS the page: it read the window's scroll
 *   and pinned itself over everything. Here it is one section: a track a few
 *   screens tall with a sticky stage inside, and the cards travel once, from
 *   the first piece to the last, over the section's own scroll progress.
 * - Her photographs and her pieces, each card a link to its product page;
 *   no stock images, no invented "HERITAGE FW25/26" collection.
 * - The magnetic hover runs only with a fine pointer. The card measurements
 *   it needs are read once per animation frame at most, and only while a
 *   mouse is over the stage.
 * - Reduced motion: no pin, no 3D, a plain row of the same links. */

export interface CollectionItem {
  slug: string;
  name: string;
  category: string;
  photo: string;
  square?: boolean;
}

export type CollectionSurferVariant = "magnetic" | "uplift" | "simple";

export function CollectionSurfer({
  items,
  variant = "magnetic",
  eyebrow,
  title,
  count,
  headingId,
}: {
  items: CollectionItem[];
  headingId?: string;
  variant?: CollectionSurferVariant;
  eyebrow: string;
  title: React.ReactNode;
  count?: number;
}) {
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { mass: 0.1, stiffness: 100, damping: 20 });

  /* The step between cards comes from CSS custom properties (--cs-sx/sy/sz)
     so a phone gets a tighter, smaller run without a second code path; the
     rail moves back by (progress x steps) of the same vector. */
  const steps = n(items.length - 1);
  const x = useTransform(progress, (p) => `calc(${(-p * steps).toFixed(4)} * var(--cs-sx))`);
  const y = useTransform(progress, (p) => `calc(${(-p * steps).toFixed(4)} * var(--cs-sy))`);
  const z = useTransform(progress, (p) => `calc(${(-p * steps).toFixed(4)} * var(--cs-sz))`);

  const mouseX = useMotionValue(-10000);
  const mouseY = useMotionValue(-10000);
  const fine = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const onMove = (e: React.MouseEvent) => {
    if (variant === "simple" || !fine()) return;
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };
  const onLeave = () => {
    mouseX.set(-10000);
    mouseY.set(-10000);
  };

  const head = (
    <div className="cs-head">
      <p className="cs-eyebrow">{eyebrow}</p>
      <h2 id={headingId} className="cs-title">
        {title}
        {count ? <span className="cs-count">({count})</span> : null}
      </h2>
    </div>
  );

  if (reduce) {
    return (
      <div className="cs cs--still">
        {head}
        <ul className="cs-still-row">
          {items.map((item, i) => (
            <li key={item.slug}>
              <CardLink item={item} i={i} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div ref={track} className="cs" style={{ "--cs-n": items.length } as React.CSSProperties}>
      <div className="cs-stage" onMouseMove={onMove} onMouseLeave={onLeave}>
        {head}
        <p className="cs-hint" aria-hidden="true">Scroll to browse</p>

        <div className="cs-scene">
          <motion.ul className="cs-rail" style={{ x, y, z }}>
            {items.map((item, i) => (
              <Card key={item.slug} item={item} i={i} mouseX={mouseX} mouseY={mouseY} progress={progress} variant={variant} />
            ))}
          </motion.ul>
        </div>
      </div>
    </div>
  );
}

const n = (v: number) => Math.max(0, v);

function CardLink({ item, i }: { item: CollectionItem; i: number }) {
  return (
    <Link href={`/shop/${item.slug}`} className="cs-card-link">
      <span className="cs-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
      <span className="cs-media">
        <ProductPhoto photo={item.photo} square={item.square} alt="" sizes="(min-width: 768px) 300px, 200px" className="cs-img" />
      </span>
      <span className="cs-label">
        <span className="cs-cat">{item.category}</span>
        <span className="cs-name">{item.name}</span>
      </span>
    </Link>
  );
}

function Card({
  item,
  i,
  mouseX,
  mouseY,
  progress,
  variant,
}: {
  item: CollectionItem;
  i: number;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  progress: MotionValue<number>;
  variant: CollectionSurferVariant;
}) {
  const ref = useRef<HTMLLIElement>(null);

  const distance = useTransform([mouseX, mouseY, progress], ([mx, my]) => {
    if (!ref.current || variant === "simple" || (mx as number) < -9000) return 400;
    const r = ref.current.getBoundingClientRect();
    return Math.hypot((mx as number) - (r.left + r.width / 2), (my as number) - (r.top + r.height / 2));
  });
  const scale = useSpring(useTransform(distance, [0, 400], [1.35, 1]), { mass: 0.5, stiffness: 300, damping: 20 });
  const lift = useSpring(useTransform(distance, [0, 400], [-80, 0]), { mass: 0.5, stiffness: 300, damping: 20 });

  const transform = useTransform([scale, lift], ([s, u]) => {
    const sc = variant === "magnetic" ? Number(s) : 1;
    const up = variant === "uplift" ? Number(u) : 0;
    return `translate3d(calc(${i} * var(--cs-sx)), calc(${i} * var(--cs-sy) + ${up}px), calc(${i} * var(--cs-sz))) rotateY(-50deg) scale(${sc})`;
  });

  return (
    <motion.li ref={ref} className="cs-card" style={{ transform }}>
      <CardLink item={item} i={i} />
    </motion.li>
  );
}

export default CollectionSurfer;
