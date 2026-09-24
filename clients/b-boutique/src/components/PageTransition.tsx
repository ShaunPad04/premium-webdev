"use client";

import { ViewTransition } from "react";
import { usePathname } from "next/navigation";

/* The page-to-page transition (2026-09-24, Brad: "elite transitions").
 *
 * Keyed by the pathname, so a change of page is an exit and an enter: the
 * old page leaves quickly (fade, a small lift, a touch of blur) and the new
 * one rises into place a beat later on an expo ease, the handover pattern in
 * MotionSites' designs and the Next.js view-transitions guide. Anything that
 * is not a change of page (a colour swap, a search filter, a refresh) keeps
 * the same key and `default="none"`, so it never animates the whole page.
 *
 * The header does not move: it carries its own view-transition-name and is
 * held still in globals.css, so the eye has one fixed point while the
 * content changes. The grid → product photograph morph still plays inside
 * this, because a named pair takes precedence over the enter and exit.
 *
 * A browser without view transitions navigates instantly, as before. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} enter="page-in" exit="page-out" default="none">
      <div className="page-vt">{children}</div>
    </ViewTransition>
  );
}
