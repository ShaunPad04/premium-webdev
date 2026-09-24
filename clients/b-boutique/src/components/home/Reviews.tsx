"use client";

import { useEffect, useState } from "react";

import { reviews } from "@/lib/reviews";

/* The review carousel. Renders nothing until lib/reviews.ts holds at least
 * two real reviews (see that file). One quote at a time, cross-fading every
 * seven seconds, with previous/next and a pause for WCAG 2.2.2; no autoplay
 * under reduced motion. */
export function Reviews() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = reviews.length;

  useEffect(() => {
    if (n < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % n), 7000);
    return () => window.clearInterval(t);
  }, [n, paused]);

  if (n < 2) return null;
  const r = reviews[i];
  return (
    <section className="rvw" aria-roledescription="carousel" aria-label="What customers say">
      <p className="rvw-k">Kind words</p>
      <figure className="rvw-fig" key={i} aria-live={paused ? "polite" : "off"}>
        <blockquote className="rvw-q">{r.quote}</blockquote>
        <figcaption className="rvw-c">{r.name} · {r.source}</figcaption>
      </figure>
      <div className="rvw-ctl">
        <button type="button" onClick={() => setI((i - 1 + n) % n)}>Previous</button>
        <button type="button" onClick={() => setPaused((p) => !p)}>{paused ? "Play" : "Pause"}</button>
        <button type="button" onClick={() => setI((i + 1) % n)}>Next</button>
      </div>
    </section>
  );
}
