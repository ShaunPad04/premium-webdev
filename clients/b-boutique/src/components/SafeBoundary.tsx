"use client";

import { Component, type ReactNode } from "react";

/* A crash in one decorative section must never take the page down with it.
 *
 * Added 2026-09-22 after the home page twice fell to Next's "This page
 * couldn't load" screen because of an animation in the hero. Without a
 * boundary, an error thrown by any component bubbles to the route and the
 * WHOLE page is replaced — the shop, the prices, the address, all gone for
 * the sake of a title effect. With one, the failing section is swapped for
 * its `fallback` (a still version, or nothing) and everything around it
 * keeps working.
 *
 * It is a class because React still has no hook for catching render and
 * commit errors. The error is logged, so it is not silent to anyone looking. */
export class SafeBoundary extends Component<
  { fallback: ReactNode; children: ReactNode; name?: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`[${this.props.name ?? "section"}] fell back to its still version:`, error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
