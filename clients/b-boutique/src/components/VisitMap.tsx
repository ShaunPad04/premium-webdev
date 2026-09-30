"use client";

import { useEffect, useRef, useState } from "react";

/* The map at the top of the Visit card (2026-09-28, after 21st.dev
   "Expanded Map" by dev.shejanmahamud, set into one listing card).

   Open on every screen since 2026-09-29 (Brad: the closed map looked
   unfinished on a desktop; it had waited for a click there, and phones
   already had it open). The Google embed's src is set only once the map is
   within ~600px of the screen, so nothing reaches Google before Visit is
   nearly in view, as /privacy says (lib/policies.ts). loading="lazy" alone
   uses Chrome's own distance, which on a slow connection is thousands of
   pixels: on /about the embed started while the page was still painting. */
export function VisitMap({ src, label }: { src: string; label: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = frame.current;
    if (!el || near) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);
  return <iframe ref={frame} className="vsc-map" src={near ? src : undefined} title={`Map of ${label}`} referrerPolicy="no-referrer-when-downgrade" />;
}
