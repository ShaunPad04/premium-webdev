"use client";

/* The "pinky newsletter" band — vendored 2026-09-22 at the client's request
 * and tailored to B Boutique: light rather than dark (his instruction), in
 * the site's own rouge family rather than the snippet's hot magentas.
 *
 * ── What was deliberately NOT kept: the email field ──────────────────────
 * The supplied component had an email input and a submit button wired to
 * nothing. A signup that looks like it worked and sends nowhere is worse
 * than no signup: a customer believes she is on a list she is not on. A real
 * newsletter also needs the shop to agree to send one, somewhere to keep the
 * addresses, and a line on /privacy saying so — none of which exists yet.
 * So the band carries one action that works today. When a newsletter is
 * agreed, the field goes back in with a real destination behind it.
 *
 * ── The shader ───────────────────────────────────────────────────────────
 * WebGL, so it is kept off the critical path: nothing mounts until the band
 * is near the viewport, and it unmounts again when it leaves. Reduced motion
 * gets speed 0 — the pattern, still. A CSS gradient in the same colours sits
 * underneath for the moment before the canvas paints and for any browser
 * without WebGL, so the band is never an empty box. */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Warp } from "@paper-design/shaders-react";

import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/* Paper, blush and two roses — all light, all leaning pink rather than
   yellow, so the band belongs to the same palette as the page around it.
   Ink type on the darkest of them measures above 9:1. */
const COLOURS = ["#FAF5F3", "#F4DCE0", "#EBC3CB", "#FBEDEA"];

export default function NewsLetter() {
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} aria-labelledby="pinky-h" className="pinky">
      <div className="pinky-bg" aria-hidden="true">
        {near ? (
          <Warp
            style={{ height: "100%", width: "100%" }}
            proportion={0.45}
            softness={1}
            distortion={0.25}
            swirl={0.8}
            swirlIterations={10}
            shape="checks"
            shapeScale={0.1}
            scale={1}
            rotation={0}
            speed={reduced ? 0 : 0.6}
            colors={COLOURS}
          />
        ) : null}
      </div>

      <div className="pinky-inner">
        <p className="label pinky-eyebrow">New on the rails</p>
        <h2 id="pinky-h" className="pinky-h">
          Something <em>different</em>, regularly.
        </h2>
        <p className="pinky-body">
          New stock comes in regularly, and each piece is here until it goes.
          See what has arrived, online or on Sea View Street.
        </p>
        <Link href="/shop" className="pinky-cta">
          <span>See what is in</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
