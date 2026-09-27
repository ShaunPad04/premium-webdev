"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/* A paragraph whose words turn from faint to full ink as it scrolls up the
 * screen (2026-09-27, Brad: the shop owner's quote should "scroll to reveal
 * the words").
 *
 * Every word is in the HTML from the start, so it reads, copies and is
 * found by search like any other paragraph; only its opacity moves.
 * Progress is read live from getBoundingClientRect on scroll (as Spin360
 * and ScrollAcross do): the reveal starts as the paragraph's top reaches
 * 85% of the way down the screen and is complete when its bottom reaches
 * the middle, so the last word lands while it is still easy to read.
 * Reduced motion: every word at full ink, nothing listening.
 *
 * How faint a word starts is set by the contrast rules, not taste: a word
 * not yet revealed is still text someone may be reading. At 0.45 of the
 * ink, large text (24px and up) on white is 3:1; smaller text needs 4.5:1,
 * which is 0.58. The first test at 0.16 was about 1.3:1 and axe failed it. */
const FAINT_LARGE = 0.45;
const FAINT_BODY = 0.58;

export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const el = useRef<HTMLParagraphElement>(null);
  const reduced = usePrefersReducedMotion();
  const words = text.split(" ");

  useEffect(() => {
    const p = el.current;
    if (!p || reduced) return;
    const spans = [...p.querySelectorAll<HTMLElement>("[data-w]")];
    let frame = 0;
    let faint = FAINT_BODY;
    const paint = () => {
      frame = 0;
      faint = parseFloat(getComputedStyle(p).fontSize) >= 24 ? FAINT_LARGE : FAINT_BODY;
      const r = p.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.5;
      const span = start - end + r.height;
      const progress = Math.min(1, Math.max(0, (start - r.top) / span));
      const lit = progress * spans.length;
      spans.forEach((s, i) => {
        const t = Math.min(1, Math.max(0, lit - i));
        s.style.opacity = String(faint + (1 - faint) * t);
      });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(paint); };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      spans.forEach((s) => { s.style.opacity = ""; });
    };
  }, [reduced]);

  return (
    <p ref={el} className={className}>
      {words.map((w, i) => (
        <span key={i} data-w="">
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
