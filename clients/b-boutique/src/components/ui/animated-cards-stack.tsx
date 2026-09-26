"use client";

/* Animated cards stack, after the 21st.dev component of that name
 * (2026-09-26, Brad: for the home page reviews).
 *
 * A tall container with a sticky stage; the cards sit in a slightly fanned
 * pile and, as the page scrolls, each one lifts off the top in turn,
 * straightening as it goes, until the last is left.
 *
 * What changed on the way in:
 *   - No class-variance-authority: two variants are two class strings.
 *   - The drop shadow was a hook called inside a condition, which React does
 *     not allow; the hook now always runs and the variant picks the result.
 *   - Colours are this site's, not shadcn theme tokens it does not define.
 *   - ReviewStars carries an accessible name ("5 out of 5 stars") instead of
 *     a bare number, its gradient id is unique per instance, and it is made
 *     of spans, so it can sit inside a paragraph without breaking hydration. */

import * as React from "react";
import { motion, useMotionTemplate, useScroll, useTransform, type HTMLMotionProps, type MotionValue } from "motion/react";

import { cn } from "@/lib/utils";

const VARIANTS = {
  light: "flex size-full flex-col items-center justify-center gap-6 rounded-2xl border border-black/10 bg-white p-6",
  dark: "flex size-full flex-col items-center justify-center gap-6 rounded-2xl border border-stone-700/50 bg-[#0A0A0A] p-6 text-white",
} as const;

type ContainerScrollContextValue = { scrollYProgress: MotionValue<number> };
const ContainerScrollContext = React.createContext<ContainerScrollContextValue | undefined>(undefined);

function useContainerScrollContext() {
  const context = React.useContext(ContainerScrollContext);
  if (context === undefined) throw new Error("useContainerScrollContext must be used within ContainerScroll");
  return context;
}

export function ContainerScroll({ children, style, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollRef, offset: ["start center", "end end"] });
  return (
    <ContainerScrollContext.Provider value={{ scrollYProgress }}>
      <div ref={scrollRef} className={cn("relative min-h-svh w-full", className)} style={{ perspective: "1000px", ...style }} {...props}>
        {children}
      </div>
    </ContainerScrollContext.Provider>
  );
}

export function CardsContainer({ children, className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative", className)} style={{ perspective: "1000px", ...style }} {...props}>
      {children}
    </div>
  );
}

type CardStickyProps = HTMLMotionProps<"div"> & {
  arrayLength: number;
  index: number;
  variant?: keyof typeof VARIANTS;
  incrementY?: number;
  incrementZ?: number;
  incrementRotation?: number;
};

export const CardTransformed = React.forwardRef<HTMLDivElement, CardStickyProps>(
  ({ arrayLength, index, incrementY = 10, incrementZ = 10, incrementRotation = -index + 90, className, variant = "light", style, ...props }, ref) => {
    const { scrollYProgress } = useContainerScrollContext();

    const start = index / (arrayLength + 1);
    const end = (index + 1) / (arrayLength + 1);
    const rotateRange = [start - 1.5, end / 1.5];

    const y = useTransform(scrollYProgress, [start, end], ["0%", "-180%"]);
    const rotate = useTransform(scrollYProgress, rotateRange, [incrementRotation, 0]);
    const transform = useMotionTemplate`translateZ(${index * incrementZ}px) translateY(${y}) rotate(${rotate}deg)`;

    const dx = useTransform(scrollYProgress, rotateRange, [4, 0]);
    const dy = useTransform(scrollYProgress, rotateRange, [4, 12]);
    const blur = useTransform(scrollYProgress, rotateRange, [2, 24]);
    const alpha = useTransform(scrollYProgress, rotateRange, [0.15, 0.2]);
    const shadow = useMotionTemplate`drop-shadow(${dx}px ${dy}px ${blur}px rgba(0,0,0,${alpha}))`;

    return (
      <motion.div
        ref={ref}
        style={{
          top: index * incrementY,
          transform,
          backfaceVisibility: "hidden",
          zIndex: (arrayLength - index) * incrementZ,
          filter: variant === "light" ? shadow : "none",
          ...style,
        }}
        className={cn("absolute will-change-transform", VARIANTS[variant], className)}
        {...props}
      />
    );
  },
);
CardTransformed.displayName = "CardTransformed";

type ReviewProps = React.HTMLAttributes<HTMLSpanElement> & { rating: number; maxRating?: number };

const STAR = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z";

export function ReviewStars({ rating, maxRating = 5, className, ...props }: ReviewProps) {
  const gid = React.useId();
  const filled = Math.floor(rating);
  const part = rating - filled;
  const empty = maxRating - filled - (part > 0 ? 1 : 0);
  return (
    <span className={cn("inline-flex items-center gap-2", className)} role="img" aria-label={`${rating} out of ${maxRating} stars`} {...props}>
      <span className="inline-flex items-center" aria-hidden="true">
        {Array.from({ length: filled }, (_, i) => (
          <svg key={`f${i}`} className="size-4" fill="currentColor" viewBox="0 0 20 20"><path d={STAR} /></svg>
        ))}
        {part > 0 && (
          <svg className="size-4" viewBox="0 0 20 20">
            <defs>
              <linearGradient id={gid}>
                <stop offset={`${part * 100}%`} stopColor="currentColor" />
                <stop offset={`${part * 100}%`} stopColor="rgb(209 213 219)" />
              </linearGradient>
            </defs>
            <path d={STAR} fill={`url(#${gid})`} />
          </svg>
        )}
        {Array.from({ length: empty }, (_, i) => (
          <svg key={`e${i}`} className="size-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d={STAR} /></svg>
        ))}
      </span>
    </span>
  );
}
