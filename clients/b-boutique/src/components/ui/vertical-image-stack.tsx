"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
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
type LiveStack = ComponentType<{ items: StackItem[]; children?: React.ReactNode }>;

export function VerticalImageStack({ items, children }: { items: StackItem[]; children?: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  /* The live component itself, held in state once its code has arrived.
     It used to be next/dynamic, which rendered nothing while the chunk
     downloaded: for that moment the section was 0px tall instead of ~3,500,
     and everything below it jumped up, which sent a /#new-in link from
     another page to the wrong place (2026-09-26). The server-drawn stack
     now stays until the live one can take over in the same frame. */
  const [Live, setLive] = useState<LiveStack | null>(null);

  useEffect(() => {
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      import("./vertical-image-stack-live").then((m) => setLive(() => m.default));
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (h: number) => void };
    const idle = w.requestIdleCallback ? w.requestIdleCallback(go, { timeout: 4000 }) : window.setTimeout(go, 2500);
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && go(), { rootMargin: "150% 0px" });
    if (root.current) io.observe(root.current);
    return () => {
      (w.cancelIdleCallback ?? window.clearTimeout)(idle);
      io.disconnect();
    };
  }, []);

  if (Live) return <Live items={items}>{children}</Live>;

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
