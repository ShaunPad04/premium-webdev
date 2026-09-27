import type * as React from "react";

import { cn } from "@/lib/utils";

/* InfiniteRibbon, after the iconiq "infinite ribbon" (2026-09-27, Brad, as a
 * trial for the /contact ribbon). A band of text that loops sideways,
 * optionally tilted. CSS only; no JavaScript runs for it.
 *
 * What changed on the way in:
 *   - The site's black band and white capitals instead of the yellow default.
 *   - Reduced motion: no animation at all (the original ran it for 1ms).
 *   - The keyframes live in globals.css (.ir-*) rather than a <style> tag
 *     written into the page by every ribbon.
 * The text is given once to screen readers and the moving copies are hidden,
 * as in the original. */

export interface InfiniteRibbonProps {
  repeat?: number;
  /** Seconds for one loop. */
  duration?: number;
  reverse?: boolean;
  /** Degrees. */
  rotation?: number;
  children: React.ReactNode;
  className?: string;
}

export function InfiniteRibbon({
  repeat = 5,
  duration = 10,
  reverse = false,
  rotation = 0,
  children,
  className,
}: InfiniteRibbonProps) {
  const count = Math.max(1, Math.floor(repeat));
  return (
    <div className={cn("ir", className)} style={{ transform: `rotate(${rotation}deg)` }}>
      <span className="sr-only">{children}</span>
      <div
        aria-hidden="true"
        className={cn("ir-track", reverse && "ir-track--reverse")}
        style={{ "--ir-duration": `${Math.max(0.1, duration)}s` } as React.CSSProperties}
      >
        {Array.from({ length: count * 2 }, (_, i) => (
          <span className="ir-item" key={i}>
            {children}
          </span>
        ))}
      </div>
    </div>
  );
}
