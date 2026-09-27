"use client";

import { useEffect, useState } from "react";

/* The map at the top of the Visit card (2026-09-28, after 21st.dev
   "Expanded Map" by dev.shejanmahamud, set into one listing card). On a
   desktop the Google embed loads only when opened, as /privacy says; on a
   phone it starts open and the lazy iframe loads as Visit nears the screen.
   Nothing reaches Google before either. */
export function VisitMap({ src, label }: { src: string; label: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (window.innerWidth < 1024) setOpen(true);
  }, []);
  return open ? (
    <iframe className="vsc-map" src={src} title={`Map of ${label}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
  ) : (
    <button type="button" className="vsc-map vsc-map--closed" onClick={() => setOpen(true)}>
      <span className="vsc-pin" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </span>
      <span>Show the map</span>
    </button>
  );
}
