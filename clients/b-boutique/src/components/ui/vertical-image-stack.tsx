"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { STYLE, StackCard, StackChrome, type StackItem } from "./vertical-image-stack-parts";

export type { StackItem };

/* The "Up close" stack, in two stages (2026-09-25).
 *
 * The live stack (vertical-image-stack-live.tsx) needs the motion library
 * for its spring and its mouse drag, and loading that library with the page
 * put ~50KB in front of the first paint on every visit, for a section most
 * of a screen below the fold. So the server draws the stack as it looks
 * before anyone scrolls — card one in front, two and three fanned behind,
 * the same STYLE numbers — and the live one replaces it when the browser is
 * idle or the section comes within a screen and a half of view, whichever is
 * first. Both are drawn from the same parts, so the swap changes nothing on
 * screen. */
const Live = dynamic(() => import("./vertical-image-stack-live"), { ssr: false });

export function VerticalImageStack({ items, children }: { items: StackItem[]; children?: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const go = () => setLive(true);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (h: number) => void };
    const idle = w.requestIdleCallback ? w.requestIdleCallback(go, { timeout: 4000 }) : window.setTimeout(go, 2500);
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && go(), { rootMargin: "150% 0px" });
    if (root.current) io.observe(root.current);
    return () => {
      (w.cancelIdleCallback ?? window.clearTimeout)(idle);
      io.disconnect();
    };
  }, []);

  if (live) return <Live items={items}>{children}</Live>;

  const n = items.length;
  return (
    <div ref={root} className="vis" style={{ "--vis-n": n } as React.CSSProperties}>
      <div className="vis-stage">
        {children}
        <div className="vis-stack">
          {items.slice(0, 3).map((item, i) => {
            const s = STYLE(i);
            return (
              <div
                key={item.id}
                className="vis-slot"
                style={{ zIndex: s.zIndex, opacity: s.opacity, transform: `translateY(${s.y}px) scale(${s.scale}) rotateX(${s.rotateX}deg)` }}
              >
                <StackCard item={item} focusable={i === 0} />
              </div>
            );
          })}
        </div>
        <StackChrome n={n} current={0} labels={items.map((it) => it.title)} />
      </div>
    </div>
  );
}
