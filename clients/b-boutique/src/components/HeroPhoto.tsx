"use client";

import { usePainted } from "@/lib/painted";

/* The hero photograph over a blur of itself.
 *
 * The frame paints at once with a ~400-byte blur of the same horses
 * (PLACEHOLDER below, 18x32 / 32x18 JPEG, drawn soft by CSS).
 *
 * Desktop (the inset card): the photograph is the page's main content (LCP),
 * so its <source> is in the HTML and it is fetched with the page. Until
 * 2026-09-29 it waited for the first paint, which put LCP late.
 *
 * Phones and tablets (the full-screen hero since 2026-09-30): the LCP is the
 * hero's text, so the phone <source>s are added only once the first screen
 * has painted, and the photograph stays off the critical path. Loaded with
 * the page it measured 85 on Lighthouse mobile: the simulator charges every
 * request made before the LCP to the LCP, even one the text does not need.
 * Until then the <img> holds a transparent pixel over the blur. */
export const PLACEHOLDER = {
  portrait: "data:image/jpeg;base64,/9j/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAgABIDASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAAAAQFBgP/xAAkEAACAgEEAgEFAAAAAAAAAAABAgARAwQSITFBcSIjUaHR4f/EABcBAAMBAAAAAAAAAAAAAAAAAAIDBAX/xAAZEQADAAMAAAAAAAAAAAAAAAAAARECEiH/2gAMAwEAAhEDEQA/AMngIBND+yzoMjLVfsVJOlw5cjhMeJnbqlW43iZ8TMpoMhqr5HupNl00MYa5NcgRRv6EJmxqeB9QwidRkISPyCXZQOeG7nZHYKfkSPLE9+4nj3DaLHIsxkMVQEOoB4qvzKGJTUp035/G6vEIDVgAD7eoQOh7I//Z",
  landscape: "data:image/jpeg;base64,/9j/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAASACADASIAAhEBAxEB/8QAGgAAAgIDAAAAAAAAAAAAAAAAAAUEBgECA//EACQQAAEDAwQCAwEAAAAAAAAAAAEAAhEDBCESMUGBBSITM3Gx/8QAFwEBAQEBAAAAAAAAAAAAAAAAAwQAAv/EABkRAAIDAQAAAAAAAAAAAAAAAAABESExAv/aAAwDAQACEQMRAD8AqLDuSICm0JdPxhziBOBOEvZVJ2I1CIJGCVKp33kBbupiu0giCwYEdKdouTjBrb3TmAktiI7Tmy846iwDURnMZj9VQo1m0h6RqdgyOVu27LWh0n2PG/SN8SLNWLiAKDSBnUutf7mjjGEIShLAqj2eOIH9WDuBxAPaELHTP//Z",
};

type Source = { media?: string; type: string; srcSet: string; sizes?: string };

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export function HeroPhoto({ sources }: { sources: Source[] }) {
  const painted = usePainted();
  /* Sources with a media query are the desktop's; those without are the
     phone's, and wait for the paint. Adding a <source> makes the browser
     choose again, so the phone photograph arrives then. */
  const shown = sources.filter((s) => s.media || painted);
  return (
    <>
      <div
        className="hx-c-blur"
        aria-hidden="true"
        style={{ ["--ph-p" as string]: `url(${PLACEHOLDER.portrait})`, ["--ph-l" as string]: `url(${PLACEHOLDER.landscape})` }}
      />
      <picture className="hx-c-photo" data-loaded="">
        {shown.map((s) => (
          <source key={`${s.media ?? ""}${s.type}`} media={s.media} type={s.type} srcSet={s.srcSet} sizes={s.sizes} />
        ))}
        <img src={PIXEL} alt="" fetchPriority="high" decoding="async" />
      </picture>
    </>
  );
}
