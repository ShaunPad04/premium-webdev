"use client";

import { useState, useSyncExternalStore } from "react";

/* The map at the top of the Visit card (2026-09-28, after 21st.dev
   "Expanded Map" by dev.shejanmahamud, set into one listing card). On a
   desktop the Google embed loads only when opened, as /privacy says; on a
   phone it starts open and the lazy iframe loads as Visit nears the screen.
   Nothing reaches Google before either. The server renders it closed; a
   phone opens it once hydrated (a media query store, not setState in an
   effect). */
const PHONE = "(max-width: 1023px)";
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(PHONE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

export function VisitMap({ src, label }: { src: string; label: string }) {
  const [clicked, setClicked] = useState(false);
  const phone = useSyncExternalStore(subscribe, () => window.matchMedia(PHONE).matches, () => false);
  return clicked || phone ? (
    <iframe className="vsc-map" src={src} title={`Map of ${label}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
  ) : (
    <button type="button" className="vsc-map vsc-map--closed" onClick={() => setClicked(true)}>
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
