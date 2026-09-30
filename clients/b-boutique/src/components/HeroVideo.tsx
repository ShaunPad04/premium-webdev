"use client";

import { useEffect, useRef, useState } from "react";

import { usePainted } from "@/lib/painted";

/* The horses in motion over the hero photograph (2026-09-29, Brad's
 * Higgsfield Seedance 2.0 clips, 1080p, trial). A 16:9 clip for desktops and
 * a 9:16 one for phones and tablets, matching the photograph each gets.
 * Never under reduced motion or Save-Data, and only once the first screen has
 * painted, so the photo stays the first thing on screen and the video is not
 * on the critical path.
 *
 * Both loop seamlessly: the empty field is each clip's first and last frame,
 * so the horses gallop in from the left at one steady pace and leave off the
 * right. Each is trimmed to cut some empty field and its last 0.8s is
 * cross-faded into its start while the field is empty, which hides the
 * generator's end-of-clip brightness drift (seams 30.0 dB, against 28-32 dB
 * between ordinary frames). It fades in over the photograph once it is
 * playing. H.264 MP4s, re-encoded 2026-09-29 from the CRF 25/27 masters
 * (4.6 / 4.2 MB) to CRF 29 (16:9, 2.4 MB) and CRF 31 (9:16, 2.1 MB) with
 * x264 preset slow: SSIM 0.968 / 0.960 against the masters, no difference
 * visible on the horses at 100%. 720p was tried and looked soft. */
const MOTION = "(prefers-reduced-motion: no-preference)";
const WIDE = "(min-width: 1024px)";

export function HeroVideo() {
  const painted = usePainted();
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const motion = window.matchMedia(MOTION);
    const wide = window.matchMedia(WIDE);
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const f = () =>
      setSrc(motion.matches && !saveData ? (wide.matches ? "/video/hero-horses-loop-1080.mp4" : "/video/hero-horses-loop-1080x1920.mp4") : null);
    f();
    motion.addEventListener("change", f);
    wide.addEventListener("change", f);
    return () => {
      motion.removeEventListener("change", f);
      wide.removeEventListener("change", f);
    };
  }, []);

  if (!painted || !src) return null;
  /* Keyed on the file, so a change of width swaps in a fresh element. */
  return <Clip key={src} src={src} />;
}

function Clip({ src }: { src: string }) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  /* The hero stays pinned while the page slides over it (2026-09-29), so it
     never leaves the viewport and would play under the whole page. Pause it
     once the page has covered it; play again on the way back up. */
  useEffect(() => {
    const v = ref.current;
    const hero = v?.closest("section");
    const sheet = hero?.nextElementSibling;
    if (!v || !hero || !sheet) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      /* Covered once the sheet after the hero has reached the hero's top. */
      const covered = sheet.getBoundingClientRect().top <= hero.getBoundingClientRect().top + 1;
      if (covered && !v.paused) v.pause();
      else if (!covered && v.paused && v.dataset.started) v.play().catch(() => {});
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(check); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);
  return (
    <video
      className="hx-c-video"
      data-playing={playing ? "" : undefined}
      src={src}
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
      ref={(el) => {
        ref.current = el;
        /* React sets `muted` as a property, after the element exists; set it
           first and start playback by hand so autoplay is never refused. */
        if (!el || el.dataset.started) return;
        el.dataset.started = "1";
        el.muted = true;
        el.play().catch(() => {});
      }}
    />
  );
}
