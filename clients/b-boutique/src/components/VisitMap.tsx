"use client";

import { useEffect, useRef, useState } from "react";

/* The map panel in Visit (redesigned 2026-09-24).
 *
 * The Google map in greyscale, no scrim over it, and a white label card in
 * the bottom-left corner with the shop's name, street and an "Open in maps"
 * link. The earlier expand-to-dialog map is gone: "Open in maps" takes the
 * visitor to the real, interactive Google Maps, which is what the dialog
 * was a smaller copy of.
 *
 * Blocked-embed fallback, unchanged in principle: a blocked frame still
 * fires `load` and paints the browser's broken-page tile, so the iframe
 * cannot tell us it failed. A no-cors fetch of the same embed URL can (an ad
 * blocker or offline network rejects it). It is asked only as the section
 * nears the screen, which is when the lazy iframe would load anyway, so
 * /privacy stays true. Until the answer is in, and if it is no, her
 * shopfront photograph fills the panel; the card is on it either way.
 *
 * The iframe is a picture of a map: pointer-events none, out of the tab
 * order and hidden from assistive tech, so it cannot trap the wheel halfway
 * down the page or add a dead tab stop. The address is real text beside it
 * and on the card. */
export function VisitMap({
  name,
  street,
  town,
  embedSrc,
  directionsHref,
}: {
  name: string;
  street: string;
  town: string;
  embedSrc: string;
  directionsHref: string;
}) {
  const [mapOk, setMapOk] = useState<boolean | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    let done = false;
    const probe = () => {
      if (done) return;
      done = true;
      const ctl = new AbortController();
      const t = window.setTimeout(() => ctl.abort(), 6000);
      fetch(embedSrc, { mode: "no-cors", signal: ctl.signal })
        .then(() => setMapOk(true))
        .catch(() => setMapOk(false))
        .finally(() => window.clearTimeout(t));
    };
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { probe(); io.disconnect(); }
    }, { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [embedSrc]);

  return (
    <div className="vx-panel" ref={panel} data-map={mapOk === true ? "on" : undefined}>
      <picture className="vx-photo">
        <source type="image/avif" srcSet="/img/about/shopfront-640.avif 640w, /img/about/shopfront-960.avif 960w, /img/about/shopfront-1024.avif 1024w" sizes="(min-width: 1024px) 55vw, 100vw" />
        <source type="image/webp" srcSet="/img/about/shopfront-640.webp 640w, /img/about/shopfront-960.webp 960w, /img/about/shopfront-1024.webp 1024w" sizes="(min-width: 1024px) 55vw, 100vw" />
        <img src="/img/about/shopfront-960.jpg" alt="" loading="lazy" decoding="async" />
      </picture>
      {mapOk ? (
        <iframe
          title={`Map showing ${street}, ${town}`}
          src={embedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="vx-frame"
          tabIndex={-1}
          aria-hidden="true"
        />
      ) : null}
      <div className="vx-card">
        <div>
          <p className="vx-card-name">{name}</p>
          <p className="vx-card-addr">{street}, {town}</p>
        </div>
        <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="vx-card-link">
          Open in maps <span aria-hidden="true">&#8599;</span>
        </a>
      </div>
    </div>
  );
}
