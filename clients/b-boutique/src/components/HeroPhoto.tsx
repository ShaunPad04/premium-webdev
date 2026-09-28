"use client";

import { useEffect, useState } from "react";

/* The hero photograph, blur-up (2026-09-28, after PageSpeed mobile 75 on
 * the live site: Speed Index 4.7s, LCP 5.3s).
 *
 * The frame paints at once with a ~400-byte blur of the same horses
 * (PLACEHOLDER below, 18x32 / 32x18 JPEG, drawn soft by CSS), so the first
 * paint already looks like the hero. The real photograph (the same files,
 * same quality: HeroStrips sources) is requested two frames after the page
 * has hydrated, so it no longer competes with the stylesheet, font and
 * scripts for a phone's first bytes, and fades in over the blur when it
 * lands. Without JavaScript the <noscript> copy loads it the ordinary way. */
export const PLACEHOLDER = {
  portrait: "data:image/jpeg;base64,/9j/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAgABIDASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAAAAQFBgP/xAAkEAACAgEEAgEFAAAAAAAAAAABAgARAwQSITFBcSIjUaHR4f/EABcBAAMBAAAAAAAAAAAAAAAAAAIDBAX/xAAZEQADAAMAAAAAAAAAAAAAAAAAARECEiH/2gAMAwEAAhEDEQA/AMngIBND+yzoMjLVfsVJOlw5cjhMeJnbqlW43iZ8TMpoMhqr5HupNl00MYa5NcgRRv6EJmxqeB9QwidRkISPyCXZQOeG7nZHYKfkSPLE9+4nj3DaLHIsxkMVQEOoB4qvzKGJTUp035/G6vEIDVgAD7eoQOh7I//Z",
  landscape: "data:image/jpeg;base64,/9j/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAASACADASIAAhEBAxEB/8QAGgAAAgIDAAAAAAAAAAAAAAAAAAUEBgECA//EACQQAAEDAwQCAwEAAAAAAAAAAAEAAhEDBCESMUGBBSITM3Gx/8QAFwEBAQEBAAAAAAAAAAAAAAAAAwQAAv/EABkRAAIDAQAAAAAAAAAAAAAAAAABESExAv/aAAwDAQACEQMRAD8AqLDuSICm0JdPxhziBOBOEvZVJ2I1CIJGCVKp33kBbupiu0giCwYEdKdouTjBrb3TmAktiI7Tmy846iwDURnMZj9VQo1m0h6RqdgyOVu27LWh0n2PG/SN8SLNWLiAKDSBnUutf7mjjGEIShLAqj2eOIH9WDuBxAPaELHTP//Z",
};

type Source = { media?: string; type: string; srcSet: string; sizes?: string };

export function HeroPhoto({ sources, fallback }: { sources: Source[]; fallback: string }) {
  const [go, setGo] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setGo(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);
  const pic = (onLoad?: () => void) => (
    <picture className="hx-c-photo" data-loaded={loaded || !onLoad ? "" : undefined}>
      {sources.map((s) => (
        <source key={`${s.media ?? ""}${s.type}`} media={s.media} type={s.type} srcSet={s.srcSet} sizes={s.sizes} />
      ))}
      <img
        src={fallback}
        alt=""
        fetchPriority="high"
        decoding="async"
        onLoad={onLoad}
        ref={(el) => {
          /* Already in the cache: the load event can fire before React
             attaches the handler. */
          if (el?.complete && el.naturalWidth > 0 && onLoad) onLoad();
        }}
      />
    </picture>
  );
  return (
    <>
      <div
        className="hx-c-blur"
        aria-hidden="true"
        style={{ ["--ph-p" as string]: `url(${PLACEHOLDER.portrait})`, ["--ph-l" as string]: `url(${PLACEHOLDER.landscape})` }}
      />
      {go ? pic(() => setLoaded(true)) : <noscript>{pic()}</noscript>}
    </>
  );
}
