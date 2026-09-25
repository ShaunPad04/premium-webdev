"use client";

import { ViewTransition } from "react";
import { usePathname } from "next/navigation";

/* The page-to-page transition.
 *
 * 2026-09-24 it wrapped the whole page in the boundary, so each change of
 * page snapshotted two entire documents (many thousands of pixels tall) and
 * cross-faded them. 2026-09-25, Brad: "a moment of freeze and glitch". That
 * was the cost of it: a snapshot that size is slow to capture (the freeze,
 * once long enough for Chrome to abort the transition), gets clipped (strips
 * of the old page beside blank white), and a cross-fade of two pages of
 * text shows both headings at once.
 *
 * Now the boundary holds only an empty, fixed, viewport-sized cue. Changing
 * its key is what makes React run a view transition on a change of page;
 * the page itself travels in the browser's root snapshot, which is only
 * ever the viewport. globals.css holds the old one still and wipes the new
 * one up over it, opaque, so nothing blank or doubled can show. The header
 * keeps its own name and stays put; the grid-to-product photograph morph
 * still plays on top. Anything that is not a change of page keeps the same
 * key and does not animate. A browser without view transitions navigates
 * instantly. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <>
      <ViewTransition key={pathname} enter="page-in" exit="page-out" default="none">
        <div className="page-vt-cue" aria-hidden="true" />
      </ViewTransition>
      <div className="page-vt">{children}</div>
    </>
  );
}
