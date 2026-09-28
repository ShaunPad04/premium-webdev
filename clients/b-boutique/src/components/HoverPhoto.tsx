"use client";

import { useSyncExternalStore } from "react";

import { usePainted } from "@/lib/painted";
import { ProductPhoto } from "./ProductPhoto";

/* A product card's next-colour photograph, for the hover cross-fade
 * (2026-09-28, PageSpeed). Only where a pointer can hover, and only once the
 * first screen has painted: it used to be server-rendered on every card,
 * which on /clothing was half of the page's image markup, sent twice (the
 * HTML and the data React hydrates from), for a photo a phone hides with
 * display:none and never loads. The card's CSS keys off .prod-photo--alt
 * being present, so a touch screen simply has no alt layer. */
const HOVER = "(hover: hover)";
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(HOVER);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

export function HoverPhoto(props: { photo: string; square: boolean; sizes: string }) {
  const hover = useSyncExternalStore(subscribe, () => window.matchMedia(HOVER).matches, () => false);
  const painted = usePainted();
  if (!hover || !painted) return null;
  return <ProductPhoto {...props} alt="" className="prod-photo prod-photo--alt absolute inset-0 h-full w-full object-cover" />;
}
