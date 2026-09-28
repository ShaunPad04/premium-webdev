"use client";

import { lazy, type ComponentType } from "react";

/* The four home sections that animate with `motion` (2026-09-28, PageSpeed).
 *
 * Unchanged components, loaded later. The server still renders each one's
 * full HTML, so the first paint is the same; in the browser React leaves
 * that HTML as it is and attaches the component once its code has arrived,
 * after the first paint instead of before it. The animation code is the
 * same code: only when it downloads has moved. Imported directly anywhere
 * else on the home page, a section would pull `motion` back into the
 * first-paint scripts. */
function deferred<P extends object>(server: ComponentType<P> | null, load: () => Promise<ComponentType<P>>) {
  /* On the server the section renders in place from `server`, a plain
     require inside a typeof-window branch that the browser build drops. An
     import() there would stream it instead: a placeholder, with the section
     moved in later by a script (empty without JavaScript). `lazy` is handed
     an already-settled thenable, which React reads synchronously. */
  const Lazy = lazy(() =>
    server
      ? ({ then: (ok: (m: { default: ComponentType<P> }) => void) => ok({ default: server }) } as unknown as Promise<{ default: ComponentType<P> }>)
      : load().then((c) => ({ default: c })),
  );
  /* No <Suspense> of its own: React outlines a finished boundary that holds
     images or follows 12.8 KB of page (streams it to the end of the HTML and
     moves it in with a script). Without one the server renders it in place,
     and in the browser hydration simply waits for this section's code. */
  return function Deferred(props: P) {
    return <Lazy {...props} />;
  };
}

const onServer = typeof window === "undefined";

/* eslint-disable @typescript-eslint/no-require-imports */
export const ScrollVelocityRow = deferred(
  onServer ? require("./ui/scroll-velocity-text").ScrollVelocityRow : null,
  () => import("./ui/scroll-velocity-text").then((m) => m.ScrollVelocityRow),
);
export const ProductSlides = deferred(
  onServer ? require("./ui/product-slides").ProductSlides : null,
  () => import("./ui/product-slides").then((m) => m.ProductSlides),
);
export const UpCloseTilt = deferred(
  onServer ? require("./home/UpCloseTilt").UpCloseTilt : null,
  () => import("./home/UpCloseTilt").then((m) => m.UpCloseTilt),
);
export const Reviews = deferred(
  onServer ? require("./home/Reviews").Reviews : null,
  () => import("./home/Reviews").then((m) => m.Reviews),
);
