"use client";

/* The footer's "Back to top". Lenis owns the scroll when it is running, so
   it is asked first; otherwise the browser scrolls, instantly under reduced
   motion. Focus goes to the skip link at the top of the page, so a keyboard
   user lands where the scroll did. */
export function BackToTop() {
  return (
    <button
      type="button"
      className="ft-top-btn"
      onClick={() => {
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        /* Lenis only when it agrees with the page. Tabbing to this button
           scrolls the page natively, and a Lenis that missed that thinks it
           is already at the top and does nothing (measured). */
        const lenis = window.__lenis;
        if (lenis && Math.abs(lenis.scroll - window.scrollY) < 2) lenis.scrollTo(0, { immediate: still });
        else window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });
        document.querySelector<HTMLElement>("body a[href], body button")?.focus({ preventScroll: true });
      }}
    >
      Back to top <span aria-hidden="true">&uarr;</span>
    </button>
  );
}
