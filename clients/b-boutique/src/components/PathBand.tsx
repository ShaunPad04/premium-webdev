"use client";

import { useRef } from "react";

import AnimatedPathText from "@/components/ui/text-along-path";
import { openingSummary, shop } from "@/lib/shop";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/* A line of the shop's own facts, set along a curve, that slides as the page
 * scrolls — between the contact form and the map, at the client's request
 * (2026-09-22), to give the most utilitarian page on the site one moment of
 * movement that leads the eye on toward the address.
 *
 * Every word is derived: street, town and hours from shop.ts, the rest is the
 * shop describing what it sells. Nothing here can go stale separately from
 * the Visit section beneath it.
 *
 * Scroll-driven, not the component's endless auto loop: movement tied to the
 * reader's own scrolling stops when they stop, and needs no pause control.
 * Reduced motion sets the start and end offsets equal, so it is a still line.
 *
 * aria-hidden: the same facts are in the Visit section directly below, as
 * real text. A screen reader would otherwise hear the address twice, once
 * as a run-on of bullets. */
export function PathBand({ words }: { words?: string[] } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  /* `words` lets a page choose its own phrases (the home page, 2026-09-23);
     the default is /contact's line. Every phrase must stay derived from
     shop.ts or from the shop's own words, never invented. */
  const line = (words ?? [
    shop.street,
    shop.town,
    openingSummary().replace(/\.$/, ""),
    "Womenswear & homeware",
    "Come and say hello",
  ]).join("  ·  ");
  const text = `${line}  ·  ${line}  ·  `;

  return (
    <div ref={ref} className="pathband" aria-hidden="true">
      <AnimatedPathText
        path="M-40 150 C 220 30, 480 230, 760 110 S 1180 40, 1480 140"
        viewBox="0 0 1440 220"
        preserveAspectRatio="xMidYMid slice"
        svgClassName="pathband-svg"
        text={text.toUpperCase()}
        textClassName="pathband-text"
        animationType="scroll"
        scrollTarget={ref}
        scrollOffset={["start end", "end start"]}
        scrollTransformValues={reduced ? [-8, -8] : [0, -40]}
      />
    </div>
  );
}
