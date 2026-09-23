"use client";

import { useEffect } from "react";

/* Page transitions (2026-09-23, Brad: a page should fade/sweep in when you
 * click through, "rather than coming straight up").
 *
 * The animation itself is CSS on #main (globals.css, "Page transition"). It
 * only runs once <html data-nav> is set, and that is set here, on the first
 * click on an internal link or a back/forward step. So the FIRST page load
 * never animates: nothing holds back the first paint, which is the one that
 * counts for LCP. Every later route change mounts a new #main and plays it. */
export function NavMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const mark = () => {
      root.dataset.nav = "1";
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return; // same page: a scroll, not a new page
      mark();
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", mark);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", mark);
    };
  }, []);
  return null;
}
