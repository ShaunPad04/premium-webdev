"use client";

import { useRef, type MouseEvent } from "react";

/* One row of the short FAQ, opening smoothly (2026-09-27, Brad: "a nicer,
 * smoother motion when clicking the drop down", and the text animating in
 * rather than dropping instantly, on the phone).
 *
 * Still a native <details>, so keyboard, screen readers and find-in-page
 * work, and the answer is in the HTML whether the row is open or not. The
 * CSS-only version (::details-content with interpolate-size) only ever ran
 * in Chromium; Safari on the iPhone snapped open. This uses the Web
 * Animations API, which every current browser has:
 *   - the row's height eases open (and closed) on an ease-out curve;
 *   - the answer rises a few pixels and comes out of a soft blur just
 *     behind it, so the words settle into place instead of appearing.
 * A click mid-animation turns it round from wherever it has got to.
 * Reduced motion: the browser's own instant open, nothing animated. */

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function FaqItem({ q, a }: { q: string; a: string }) {
  const item = useRef<HTMLDetailsElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLParagraphElement>(null);
  const running = useRef<Animation[]>([]);

  const stop = () => {
    running.current.forEach((x) => x.cancel());
    running.current = [];
  };

  const onClick = (e: MouseEvent) => {
    const d = item.current;
    const b = body.current;
    const t = text.current;
    if (!d || !b || !t || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();

    const from = d.open ? b.getBoundingClientRect().height : 0;
    const opening = d.dataset.open !== "true";
    stop();
    d.dataset.open = String(opening);

    if (opening) {
      d.open = true;
      const to = b.scrollHeight;
      const h = b.animate({ height: [`${from}px`, `${to}px`] }, { duration: 560, easing: EASE });
      const w = t.animate(
        { opacity: [0, 1], transform: ["translateY(10px)", "none"], filter: ["blur(6px)", "blur(0)"] },
        { duration: 620, delay: 90, easing: EASE, fill: "backwards" },
      );
      running.current = [h, w];
      h.onfinish = () => { running.current = running.current.filter((x) => x !== h); };
    } else {
      const h = b.animate({ height: [`${from}px`, "0px"] }, { duration: 420, easing: EASE, fill: "forwards" });
      const w = t.animate(
        { opacity: [1, 0], transform: ["none", "translateY(-4px)"], filter: ["blur(0)", "blur(4px)"] },
        { duration: 220, easing: "ease-in", fill: "forwards" },
      );
      running.current = [h, w];
      h.onfinish = () => {
        d.open = false;
        stop();
      };
    }
  };

  return (
    <details
      ref={item}
      className="sfq-item"
      /* Find-in-page and the keyboard can open a row without a click; keep
         the icon's state in step with whatever actually happened. */
      onToggle={(e) => {
        const d = e.currentTarget;
        if (running.current.length === 0) d.dataset.open = String(d.open);
      }}
    >
      <summary className="sfq-q" onClick={onClick}>
        <span>{q}</span>
        <span className="sfq-icon" aria-hidden="true" />
      </summary>
      <div ref={body} className="sfq-body">
        <p ref={text} className="sfq-a">{a}</p>
      </div>
    </details>
  );
}
