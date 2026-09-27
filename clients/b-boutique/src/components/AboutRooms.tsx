"use client";

import { useState } from "react";

type Room = { src: string; alt: string; caption: string; pos: string };

/* The shop's rooms as Shop by category's panels: the one pointed at or
   focused opens, the others narrow to strips with their name running up. */
export function AboutRooms({ rooms }: { rooms: Room[] }) {
  const [on, setOn] = useState(0);
  return (
    <div className="hs-rooms">
      {rooms.map((r, i) => (
        <figure
          key={r.src}
          className="hs-room"
          data-on={on === i ? "" : undefined}
          tabIndex={0}
          onMouseEnter={() => setOn(i)}
          onFocus={() => setOn(i)}
          onClick={() => setOn(i)}
        >
          <img src={r.src} alt={r.alt} loading="lazy" style={{ objectPosition: r.pos }} />
          <figcaption className="hs-room-d">
            <span className="hs-tag">
              {String(i + 1).padStart(2, "0")} / {String(rooms.length).padStart(2, "0")}
            </span>
            <span className="hs-room-t">{r.caption}</span>
          </figcaption>
          <span className="hs-room-v" aria-hidden="true">{r.caption}</span>
        </figure>
      ))}
    </div>
  );
}
