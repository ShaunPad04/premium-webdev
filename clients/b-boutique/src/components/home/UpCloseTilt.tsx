"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

export type FabricSource = { type: string; srcSet: string };
export type Fabric = { id: string; title: string; slug: string; piece: string; src: string; alt: string; sources: FabricSource[] };

/* Up close as a tilted grid, after 21st.dev "ScrollTiltedGrid" (ruixen.ui),
 * Brad's pick of three scroll-driven directions on 2026-09-28 (A the material
 * names filled with their cloth, B a zoom-parallax collage). Two columns of
 * 3:4 fabric cards: each rises tipped back, settles flat as it crosses the
 * middle of the screen, then tips away over the top, the left column leaning
 * left and the right column right.
 *
 * Transforms and opacity only. The original also scrubs a blur, brightness
 * and contrast filter per card; filters are off this site's animation list,
 * so the fade stands in for the brightness. Every value is a function
 * transform, not a range: a ranged transform can run on motion's accelerated
 * scroll path and read wrong near the end of a track (see CLAUDE.md, Up
 * close). Under reduced motion the cards are a still grid. */
export function UpCloseTilt({ items }: { items: Fabric[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  /* The section sits ~2,800px down a phone page, inside Chrome's own
     lazy-load distance, so "loading=lazy" alone still fetched every photo
     while the hero was painting. They are rendered once the grid is within
     ~1,000px instead. */
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "1000px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);
  return (
    <div ref={ref} className="uct">
      {items.map((f, i) => (
        <Card key={f.id} f={f} side={i % 2 === 0 ? -1 : 1} near={near} still={!!still} />
      ))}
    </div>
  );
}

/* 0 at the screen's edges, 1 in its middle, eased out. */
const focus = (v: number) => 1 - Math.pow(Math.min(1, Math.abs(v - 0.5) / 0.5), 3);
/* +1 entering from below, 0 in focus, -1 leaving over the top. */
const phase = (v: number) => (v < 0.5 ? 1 : -1) * (1 - focus(v));

function Card({ f, side, near, still }: { f: Fabric; side: 1 | -1; near: boolean; still: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(p, (v) => `${phase(v) * 60}%`);
  const x = useTransform(p, (v) => `${Math.abs(phase(v)) * side * 30}%`);
  const rotateX = useTransform(p, (v) => phase(v) * 60);
  const rotate = useTransform(p, (v) => -phase(v) * side * 4);
  const skewX = useTransform(p, (v) => phase(v) * side * 12);
  const opacity = useTransform(p, (v) => 0.25 + 0.75 * focus(v));
  const inner = (
    <>
      {near ? (
        <picture>
          {f.sources.map((s) => (
            <source key={s.type} type={s.type} srcSet={s.srcSet} sizes="(min-width: 900px) 380px, calc(50vw - 32px)" />
          ))}
          <img src={f.src} alt={f.alt} loading="lazy" decoding="async" />
        </picture>
      ) : null}
      <span className="uct-name">{f.title}</span>
    </>
  );
  /* Flat until the grid is near, and always under reduced motion. The
     server would otherwise write each card's starting 3D tilt into the HTML,
     and eight 3D layers at first paint cost the home page ~0.1s of simulated
     FCP/LCP (Lighthouse mobile 95 -> 93) for a section ~2,800px down. A
     plain span, not the motion one without its style: motion leaves the
     last transform it applied in place. */
  return (
    <Link ref={ref} href={`/shop/${f.slug}`} className="uct-tile">
      {still || !near ? (
        <span className="uct-card">{inner}</span>
      ) : (
        <motion.span className="uct-card" style={{ y, x, rotateX, rotate, skewX, opacity }}>{inner}</motion.span>
      )}
    </Link>
  );
}
