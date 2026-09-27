"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/* Smooth scroll is the single cheapest signal that a site was built with
   care — but it must never fight assistive tech or a user who asked for
   less motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* content: body, not the default <html>. <html> is h-full, so its box
       never changes size and Lenis's resize observer never fired when the
       page grew after load (the Up close roll adds its pinned scroll room
       once GSAP arrives): Lenis kept the old, shorter limit and the page
       stopped at the Reviews (2026-09-27, Brad). body grows with the page. */
    const lenis = new Lenis({ duration: 1.05, wheelMultiplier: 0.9, content: document.body });
    /* Exposed so a modal can actually stop the smooth scroller while it is
       open. Setting overflow:hidden alone does not — Lenis drives the scroll
       itself and keeps going underneath the overlay. */
    window.__lenis = lenis;
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}
