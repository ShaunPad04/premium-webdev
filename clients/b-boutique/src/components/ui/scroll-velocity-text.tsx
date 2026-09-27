"use client";

import type { MotionValue } from "motion/react";
import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import React, { useContext, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/* Scroll Velocity Text (21st.dev, 2026-09-27, Brad: for the marquee under
 * the hero). A row that drifts on its own and speeds up with the scroll,
 * turning round when the reader scrolls back up. Copies itself to fill the
 * width, so the caller passes one set.
 *
 * Changed on the way in: under reduced motion the row does not move at all
 * (the original still drifted at its base speed). Otherwise as supplied. */

export const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

const ScrollVelocityContext = React.createContext<MotionValue<number> | null>(null);

function useVelocityFactor() {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  return useTransform(smooth, (v) => (v < 0 ? -1 : 1) * Math.min(5, (Math.abs(v) / 1000) * 5));
}

export function ScrollVelocityContainer({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const velocityFactor = useVelocityFactor();
  return (
    <ScrollVelocityContext.Provider value={velocityFactor}>
      <div className={cn("relative w-full", className)} {...props}>{children}</div>
    </ScrollVelocityContext.Provider>
  );
}

interface ScrollVelocityRowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  baseVelocity?: number;
  direction?: 1 | -1;
  scrollReactivity?: boolean;
}

function ScrollVelocityRowImpl({
  children,
  baseVelocity = 5,
  direction = 1,
  className,
  velocityFactor,
  scrollReactivity = true,
  ...props
}: ScrollVelocityRowProps & { velocityFactor: MotionValue<number> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const [numCopies, setNumCopies] = useState(1);
  const baseX = useMotionValue(0);
  const baseDirectionRef = useRef<number>(direction >= 0 ? 1 : -1);
  const currentDirectionRef = useRef<number>(direction >= 0 ? 1 : -1);
  const unitWidth = useMotionValue(0);
  const isInViewRef = useRef(true);
  const isPageVisibleRef = useRef(true);
  const reducedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    const block = blockRef.current;
    if (!container || !block) return;
    const updateSizes = () => {
      const cw = container.offsetWidth || 0;
      const bw = block.scrollWidth || 0;
      unitWidth.set(bw);
      const next = bw > 0 ? Math.max(3, Math.ceil(cw / bw) + 2) : 1;
      setNumCopies((prev) => (prev === next ? prev : next));
    };
    updateSizes();
    const ro = new ResizeObserver(updateSizes);
    ro.observe(container);
    ro.observe(block);
    const io = new IntersectionObserver(([entry]) => { if (entry) isInViewRef.current = entry.isIntersecting; });
    io.observe(container);
    const onVisibility = () => { isPageVisibleRef.current = document.visibilityState === "visible"; };
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onReduced = () => { reducedRef.current = mq.matches; };
    mq.addEventListener("change", onReduced);
    onReduced();
    return () => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      mq.removeEventListener("change", onReduced);
    };
  }, [unitWidth]);

  const x = useTransform([baseX, unitWidth], ([v, bw]) => `${-wrap(0, Number(bw) || 1, Number(v) || 0)}px`);

  useAnimationFrame((_, delta) => {
    if (!isInViewRef.current || !isPageVisibleRef.current || reducedRef.current) return;
    const vf = scrollReactivity ? velocityFactor.get() : 0;
    const absVf = Math.min(5, Math.abs(vf));
    if (absVf > 0.1) currentDirectionRef.current = baseDirectionRef.current * (vf >= 0 ? 1 : -1);
    const bw = unitWidth.get() || 0;
    if (bw <= 0) return;
    baseX.set(baseX.get() + currentDirectionRef.current * ((bw * baseVelocity) / 100) * (1 + absVf) * (delta / 1000));
  });

  return (
    <div className={cn("w-full overflow-hidden whitespace-nowrap", className)} ref={containerRef} {...props}>
      <motion.div className="inline-flex transform-gpu select-none items-center will-change-transform" style={{ x }}>
        {Array.from({ length: numCopies }).map((_, i) => (
          <div aria-hidden={i !== 0} className="inline-flex shrink-0 items-center" key={i} ref={i === 0 ? blockRef : null}>
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function ScrollVelocityRowLocal(props: ScrollVelocityRowProps) {
  const velocityFactor = useVelocityFactor();
  return <ScrollVelocityRowImpl {...props} velocityFactor={velocityFactor} />;
}

export function ScrollVelocityRow(props: ScrollVelocityRowProps) {
  const shared = useContext(ScrollVelocityContext);
  return shared ? <ScrollVelocityRowImpl {...props} velocityFactor={shared} /> : <ScrollVelocityRowLocal {...props} />;
}

export default ScrollVelocityRow;
