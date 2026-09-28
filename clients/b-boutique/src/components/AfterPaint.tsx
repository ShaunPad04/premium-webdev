"use client";

import type { ReactNode } from "react";

import { usePainted } from "@/lib/painted";

/* Renders its children once the first screen has painted (2026-09-28).
 * For below-the-fold photographs that Chrome would otherwise fetch while a
 * phone is still painting the first screen (they sit inside its lazy-load
 * distance). Only for boxes that keep their size without the image, so
 * nothing moves when it arrives. Without JavaScript, <noscript> shows them.
 * Waits for the paint itself (lib/painted.ts), not a frame: a frame can run
 * well before the paint on a slow phone. */
export function AfterPaint({ children }: { children: ReactNode }) {
  return usePainted() ? <>{children}</> : <noscript>{children}</noscript>;
}
