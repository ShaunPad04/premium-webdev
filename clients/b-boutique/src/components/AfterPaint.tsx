"use client";

import { useEffect, useState, type ReactNode } from "react";

/* Renders its children one frame after the page is interactive (2026-09-28).
 * For below-the-fold photographs that Chrome would otherwise fetch while a
 * phone is still painting the first screen (they sit inside its lazy-load
 * distance). Only for boxes that keep their size without the image, so
 * nothing moves when it arrives. Without JavaScript, <noscript> shows them. */
export function AfterPaint({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return on ? <>{children}</> : <noscript>{children}</noscript>;
}
