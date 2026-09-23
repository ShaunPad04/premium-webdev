"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* "Inside" on /about — rebuilt 2026-09-23.
 *
 * The client said the old spread (five photographs at five sizes and three
 * aspect ratios, offset on a 12-column grid) "looks cheap and unorganised".
 * It is now a lookbook: every photograph the same 4:5 frame in one column,
 * with the section's title and a numbered index of the rooms held still
 * beside them on a desktop. The index follows the reader — the room in view
 * is the one lit — and each entry is a link to its photograph.
 *
 * Motion, one idea: each frame opens from its centre as it arrives (a
 * clip-path inset to nothing) while the photograph inside settles from a
 * slight enlargement. Transform and clip-path only, run by CSS; this file
 * only says WHEN, with an IntersectionObserver.
 *
 * The hidden starting state is applied by this component ("is-armed") after
 * it mounts, and never under reduced motion, so a page whose script fails,
 * or a reader who asked for stillness, sees every photograph at once. */

export type Room = { id: string; n: string; caption: string };

export function InsideRooms({ rooms, head, children }: { rooms: Room[]; head: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(rooms[0]?.id);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const figs = Array.from(root.querySelectorAll<HTMLElement>(".ab-room"));
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const reveal = still
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (!e.isIntersecting) continue;
              e.target.classList.add("is-in");
              reveal?.unobserve(e.target);
            }
          },
          { rootMargin: "0px 0px -12% 0px" },
        );
    if (reveal) {
      root.classList.add("is-armed");
      figs.forEach((f) => reveal.observe(f));
    }

    /* The lit room: whichever frame crosses the middle band of the screen. */
    const track = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    figs.forEach((f) => track.observe(f));

    return () => {
      reveal?.disconnect();
      track.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="ab-rooms">
      <div className="ab-rooms-side">
        {head}
        <ol className="ab-rooms-index">
          {rooms.map((r) => (
            <li key={r.id}>
              <a href={`#${r.id}`} aria-current={active === r.id ? "true" : undefined}>
                <span className="ab-rooms-n">{r.n}</span>
                {r.caption}
              </a>
            </li>
          ))}
        </ol>
      </div>
      <div className="ab-rooms-list">{children}</div>
    </div>
  );
}
