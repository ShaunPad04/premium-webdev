"use client";

import Link from "next/link";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";

export type FabricSource = { media?: string; type: string; srcSet: string };
export type Fabric = { id: string; title: string; slug: string; piece: string; src: string; alt: string; sources: FabricSource[] };

/* One close-up at the size the screen needs (2026-09-28): AVIF then WebP,
   the portrait crop on a portrait screen where there is one, and lazy, so
   none of it competes with the hero. It used to be one 2400px WebP for
   every screen, the first two fetched at page load: ~1.8 MB before a phone
   had painted the hero. */
function FabricPic({ f, style }: { f: Fabric; style?: { scale: MotionValue<number> } }) {
  return (
    <picture>
      {f.sources.map((s) => (
        <source key={`${s.media ?? ""}${s.type}`} media={s.media} type={s.type} srcSet={s.srcSet} sizes="100vw" />
      ))}
      {style ? (
        <motion.img src={f.src} alt={f.alt} style={style} loading="lazy" decoding="async" />
      ) : (
        <img src={f.src} alt={f.alt} loading="lazy" decoding="async" />
      )}
    </picture>
  );
}

/* Up close, after 21st.dev "Scroll Gallery" (soralabs), Brad's pick of three
   on 2026-09-27: pinned full-bleed, each fabric wipes up over the last as the
   page scrolls, easing from 1.25x to rest, its name swapping in the band
   across the middle with "Shop the piece" linking to the garment. The
   original's 20-strip GSAP mask is one clip-path wipe here, on motion (no
   GSAP). Under reduced motion it is a plain grid of the same seven. */
export function UpCloseGallery({ items }: { items: Fabric[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [on, setOn] = useState(0);
  const n = items.length;
  /* The close-ups start ~2,800px down a phone page, inside Chrome's own
     lazy-load distance, so "loading=lazy" still fetched all seven while the
     hero was painting. They are rendered once the gallery is within ~1,000px
     instead: still long before anyone can see them. */
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "1000px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);
  useMotionValueEvent(scrollYProgress, "change", (v) => setOn(Math.min(n - 1, Math.max(0, Math.floor(v * n + 0.15)))));

  if (still) {
    return (
      <ul className="ucg-grid">
        {items.map((f) => (
          <li key={f.id}>
            <Link href={`/shop/${f.slug}`} className="ucg-tile">
              <FabricPic f={f} />
              <span>{f.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div ref={ref} className="ucg" style={{ height: `${n * 80 + 20}svh` }}>
      <div className="ucg-stick">
        {items.map((f, i) => (
          <Slide key={f.id} f={f} i={i} n={n} p={scrollYProgress} near={near} />
        ))}
        <div className="ucg-band">
          <span className="ucg-pre" aria-hidden="true">Up close</span>
          <span className="ucg-title" aria-live="polite">
            <motion.span key={items[on].id} initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
              {items[on].title}
            </motion.span>
          </span>
          <Link className="ucg-link" href={`/shop/${items[on].slug}`}>
            Shop the piece<span className="sr-only">: {items[on].piece}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Slide({ f, i, n, p, near }: { f: Fabric; i: number; n: number; p: MotionValue<number>; near: boolean }) {
  const a = (i - 1) / n;
  const b = i / n;
  const clip = useTransform(p, [a, b], ["inset(100% 0 0 0)", "inset(0% 0 0 0)"]);
  const scale = useTransform(p, i === 0 ? [0, 1 / n] : [a, Math.min(1, b + 1 / n)], i === 0 ? [1.1, 1] : [1.25, 1]);
  return (
    <motion.div className="ucg-slide" style={{ clipPath: i === 0 ? undefined : clip, zIndex: i }}>
      {near ? <FabricPic f={f} style={{ scale }} /> : null}
    </motion.div>
  );
}
