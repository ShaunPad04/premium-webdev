"use client";

import { useEffect, useRef, useState } from "react";

/** True while the element is on screen (or near it).
 *
 *  Both marquees on this page — New In and the review rail — write to the DOM
 *  on every animation frame for as long as they are mounted, whether or not
 *  anybody can see them. That is most of the page's idle main-thread work: the
 *  reviews are two thirds of the way down and New In is a third of the way,
 *  so on arrival the browser is compositing two rails nobody is looking at.
 *
 *  requestAnimationFrame already stops in a hidden TAB. It does not stop for a
 *  section scrolled out of the viewport, which is the common case.
 *
 *  Defaults to true, deliberately: if IntersectionObserver is missing the
 *  motion runs as it always did rather than freezing everything.
 *
 *  `rootMargin` starts the rail slightly before it appears, so it is already
 *  moving when it comes into frame instead of visibly starting. */
export function useInView<T extends HTMLElement>(rootMargin = "300px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? true),
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return [ref, inView] as const;
}
