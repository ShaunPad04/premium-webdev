"use client";

import * as React from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "motion/react";

import { cn } from "@/lib/utils";

/* Vendored from the supplied component, with three deliberate deviations.
 * All three are recorded because a future reader will otherwise diff this
 * against the original and assume it drifted by accident.
 *
 * 1. `motion/react`, not `framer-motion`. They are the same library: Motion is
 *    Framer Motion after the rename, and `motion@13` is already a dependency
 *    here for CornerMenu. Installing framer-motion would have put a second
 *    copy of the same animation runtime in the bundle. The four imports this
 *    file needs — motion, useAnimationFrame, useMotionValue, useReducedMotion
 *    — are all exported from `motion/react` unchanged.
 *
 * 2. The default card is restyled. The original targets shadcn tokens
 *    (border-border, bg-card, text-foreground, text-muted-foreground,
 *    from-background) and this project defines none of them; every one would
 *    have rendered as an unstyled fallback. They are mapped onto this site's
 *    own scale instead. The rounded-2xl and shadow-sm also went: DESIGN.md
 *    states the system is square and has no shadow vocabulary at all, so
 *    shipping a rounded, shadowed card would have contradicted the design
 *    system on its first use.
 *
 * 3. `useReducedMotion() === true` kept as-is, but note it only freezes the
 *    transform. That is the correct reading of the preference here: the rail
 *    stops, the content stays.
 *
 * Everything else — the loop maths, the wrap, the ResizeObserver measurement,
 * the pause-on-hover, the non-loop clamping — is the original. */

export type InfiniteMovingCardItem = {
  id?: string | number;
  title?: string;
  description?: string;
  image?: string;
  avatar?: string;
  name?: string;
  role?: string;
  rating?: number;
  tags?: string[];
};

export type InfiniteMovingCardsProps<
  T extends InfiniteMovingCardItem = InfiniteMovingCardItem,
> = {
  items: T[];
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  className?: string;
  cardClassName?: string;
  gap?: number;
  loop?: boolean;
  showGradientMask?: boolean;
  renderItem?: (item: T, index: number) => React.ReactNode;
  /** Accessible name for the marquee region. */
  label?: string;
};

const SPEED_PX_PER_SEC: Record<
  NonNullable<InfiniteMovingCardsProps["speed"]>,
  number
> = {
  slow: 26,
  normal: 44,
  fast: 74,
};

function renderStars(rating: number) {
  const stars = Math.max(0, Math.min(5, Math.round(rating)));
  return Array.from({ length: stars }, (_, i) => (
    <span key={`star-${i}`} className="text-bb-white">
      ★
    </span>
  ));
}

export function InfiniteMovingCards<
  T extends InfiniteMovingCardItem = InfiniteMovingCardItem,
>({
  items,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
  cardClassName,
  gap = 16,
  loop = true,
  showGradientMask = true,
  renderItem,
  label,
}: InfiniteMovingCardsProps<T>) {
  const reduceMotion = useReducedMotion() === true;
  const x = useMotionValue(0);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [singleWidth, setSingleWidth] = React.useState(0);
  const [viewportWidth, setViewportWidth] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);

  const safeItems = items ?? [];
  const renderedItems = loop ? [...safeItems, ...safeItems] : safeItems;

  React.useLayoutEffect(() => {
    const viewportNode = viewportRef.current;
    const trackNode = trackRef.current;
    if (!viewportNode || !trackNode) return;

    const measure = () => {
      const full = trackNode.scrollWidth;
      const widthPerSet = loop ? full / 2 : full;
      setSingleWidth(widthPerSet);
      setViewportWidth(viewportNode.clientWidth);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewportNode);
    observer.observe(trackNode);
    return () => observer.disconnect();
  }, [gap, loop, safeItems.length]);

  React.useEffect(() => {
    if (singleWidth <= 0) return;
    x.set(direction === "right" ? -singleWidth : 0);
  }, [direction, singleWidth, x]);

  useAnimationFrame((_, delta) => {
    if (reduceMotion || safeItems.length <= 1) return;
    if (pauseOnHover && hovered) return;
    if (singleWidth <= 0) return;

    const velocity = SPEED_PX_PER_SEC[speed] * (delta / 1000);
    const nextRaw = x.get() + (direction === "left" ? -velocity : velocity);

    if (loop) {
      let wrapped = nextRaw;
      if (direction === "left" && wrapped <= -singleWidth)
        wrapped += singleWidth;
      if (direction === "right" && wrapped >= 0) wrapped -= singleWidth;
      x.set(wrapped);
      return;
    }

    if (direction === "left") {
      const limit = -Math.max(0, singleWidth - viewportWidth);
      x.set(Math.max(limit, nextRaw));
    } else {
      x.set(Math.min(0, nextRaw));
    }
  });

  return (
    <div
      className={cn("relative w-full", className)}
      onMouseEnter={pauseOnHover ? () => setHovered(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setHovered(false) : undefined}
      /* Focus pauses too. Hover is the only pause the original offers, which
         leaves a keyboard user with no way to stop motion that runs past five
         seconds — WCAG 2.2.2. Nothing inside is focusable today, so this costs
         nothing now and is correct the day something is. */
      onFocusCapture={pauseOnHover ? () => setHovered(true) : undefined}
      onBlurCapture={
        pauseOnHover
          ? (e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                setHovered(false);
              }
            }
          : undefined
      }
      {...(label ? { role: "region", "aria-label": label } : {})}
    >
      <div ref={viewportRef} className="overflow-hidden">
        <motion.div
          ref={trackRef}
          className="flex w-max py-1"
          style={{
            x: reduceMotion ? 0 : x,
            gap,
          }}
        >
          {renderedItems.map((item, idx) => {
            const key = `${item.id ?? "item"}-${idx}`;
            /* The second set is decoration: it exists so the wrap has
               somewhere to land. Announcing it would read every quote twice. */
            const isClone = loop && idx >= safeItems.length;

            if (renderItem) {
              return (
                <div
                  key={key}
                  className={cn("shrink-0", cardClassName)}
                  aria-hidden={isClone || undefined}
                >
                  {renderItem(item, idx)}
                </div>
              );
            }

            return (
              <article
                key={key}
                aria-hidden={isClone || undefined}
                className={cn(
                  "shrink-0 overflow-hidden border border-white/15 bg-bb-black-raised",
                  cardClassName,
                )}
                style={{
                  minWidth: "min(20rem, calc(100vw - 4rem))",
                  maxWidth: 356,
                }}
              >
                {item.image ? (
                  <div className="h-36 w-full overflow-hidden border-b border-white/15">
                    {/* eslint-disable-next-line @next/next/no-img-element -- the
                        component takes arbitrary remote srcs; next/image would
                        require every host to be configured up front. */}
                    <img
                      src={item.image}
                      alt={item.title ?? ""}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div className="space-y-3 p-4">
                  {item.title ? (
                    <h3 className="text-base font-medium tracking-tight text-bb-white">
                      {item.title}
                    </h3>
                  ) : null}
                  {item.description ? (
                    <p className="text-sm leading-relaxed text-bb-grey-mid">
                      {item.description}
                    </p>
                  ) : null}

                  {typeof item.rating === "number" ? (
                    <div className="flex items-center gap-0.5 text-sm">
                      {renderStars(item.rating)}
                    </div>
                  ) : null}

                  {item.tags?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="border border-white/15 px-2 py-0.5 text-[11px] text-bb-grey-mid"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {item.name || item.role ? (
                    <div className="flex items-center gap-2 pt-1">
                      <div>
                        {item.name ? (
                          <p className="text-sm font-medium text-bb-white">
                            {item.name}
                          </p>
                        ) : null}
                        {item.role ? (
                          <p className="text-xs text-bb-grey-mid">{item.role}</p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </motion.div>
      </div>

      {showGradientMask ? (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-bb-black via-bb-black/70 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-bb-black via-bb-black/70 to-transparent" />
        </>
      ) : null}
    </div>
  );
}

export default InfiniteMovingCards;
