"use client";

import { useEffect } from "react";

/* Magnetic hover for the site's buttons, desktop only (2026-09-23). A button
 * drifts up to 6px toward the pointer while it is over it and settles back
 * when it leaves. Event delegation, one listener for the whole page; it
 * writes two CSS variables that the `translate` property reads, so it never
 * fights a button's own transform. Off for touch, coarse pointers and
 * reduced motion. */
const SELECTOR = ".btn-solid, .cx-send, .cf-submit, .bk-pay, .atb-add, .atb-buy, .hero-cta, .visit-cta";
const PULL = 6;

export function MagneticButtons() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || still.matches) return;
    let active: HTMLElement | null = null;
    const reset = (el: HTMLElement) => {
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    };
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(SELECTOR) as HTMLElement | null;
      if (active && active !== el) {
        reset(active);
        active = null;
      }
      if (!el) return;
      if (!el.hasAttribute("data-magnetic")) el.setAttribute("data-magnetic", "");
      active = el;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.style.setProperty("--mx", `${(dx * PULL).toFixed(2)}px`);
      el.style.setProperty("--my", `${(dy * PULL * 0.6).toFixed(2)}px`);
    };
    const onLeave = () => {
      if (active) reset(active);
      active = null;
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return null;
}
