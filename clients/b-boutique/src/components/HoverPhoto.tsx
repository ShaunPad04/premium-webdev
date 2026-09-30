"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { usePainted } from "@/lib/painted";
import { ProductPhoto } from "./ProductPhoto";

/* A product card's hover photograph (the next colour, or the model where the
 * card shows a packshot), for the hover cross-fade (2026-09-28, PageSpeed).
 * Only where a pointer can hover, and only once the first screen has
 * painted: it used to be server-rendered on every card, which on /clothing
 * was half of the page's image markup, sent twice (the HTML and the data
 * React hydrates from), for a photo a phone hides with display:none and
 * never loads. The card's CSS keys off .prod-photo--alt being present, so a
 * touch screen simply has no alt layer.
 *
 * And only once the card is within ~400px of the screen (2026-09-30): every
 * card's hover photo downloaded as the page opened, 30 extra images on a
 * desktop /clothing and 15 on the home page. Until then an empty marker
 * stands in, so there is something to watch. */
const HOVER = "(hover: hover)";
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(HOVER);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

export function HoverPhoto(props: { photo: string; square: boolean; sizes: string }) {
  const hover = useSyncExternalStore(subscribe, () => window.matchMedia(HOVER).matches, () => false);
  const painted = usePainted();
  const marker = useRef<HTMLSpanElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = marker.current;
    if (!el || near) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "400px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [near, hover, painted]);
  if (!hover || !painted) return null;
  if (!near) return <span ref={marker} aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />;
  return <ProductPhoto {...props} alt="" className="prod-photo prod-photo--alt absolute inset-0 h-full w-full object-cover" />;
}
