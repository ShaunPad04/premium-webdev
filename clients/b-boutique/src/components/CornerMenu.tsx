"use client";

import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/* The panel, and the motion library it animates with, load on their own:
   when the browser is idle, or as soon as the trigger is hovered, focused or
   touched, whichever is first. Nothing about the menu is needed to draw the
   page, and loading it up front put ~50KB in front of the first paint. */
const CornerMenuPanel = dynamic(() => import("./CornerMenuPanel"), { ssr: false });

/* Corner menu.
 *
 * Anchored to the top-right and expands inward from that corner — transform
 * origin sits at top right so the panel grows out of the trigger rather than
 * appearing in the middle of the photograph.
 *
 * Every destination is a real <a href> to a section that exists, so the links
 * are crawlable and work with JavaScript disabled. The animation is layered
 * on top of working markup, not a prerequisite for it. */
/* The trigger sits on a dark ground in both header states now — transparent
   over the photograph, near-black once scrolled — so it no longer needs to
   know which. The `scrolled` prop it used to take was only ever there to flip
   the chip between bone and onyx, and the chip is gone. */
export function CornerMenu() {
  const [open, setOpen] = useState(false);
  /* The overlay is portalled to <body>, and a portal needs a DOM target that
     does not exist during the server render. Gating on mount also means the
     server sends no panel markup at all, which is correct: a closed dialog
     has nothing to say to a crawler, and every link in it is already in the
     footer. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [armed, setArmed] = useState(false);
  const arm = useCallback(() => setArmed(true), []);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (h: number) => void };
    const h = w.requestIdleCallback ? w.requestIdleCallback(arm, { timeout: 4000 }) : window.setTimeout(arm, 2500);
    return () => (w.cancelIdleCallback ?? window.clearTimeout)(h);
  }, [arm]);
  const reduced = usePrefersReducedMotion();
  const panelId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    // Focus returns to where it came from.
    trigger.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;

      // Focus trap: cycle within the panel rather than escaping to the page
      // behind it.
      const focusables = panel.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);

    // Lock the page and take the rest of it out of the a11y tree.
    /* Locking the body removes a classic (Windows) scrollbar, and the page
       and the fixed header both widen into the space it left: the client saw
       MENU jump right on click. The gap is handed back as padding on the
       body and as `--lock-gap`, which the header reads for its right edge,
       so nothing moves. The drawer is not given it, so it sits flush on the
       real edge of the window. Zero with overlay scrollbars. */
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prev = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (gap > 0) {
      document.body.style.paddingRight = `${gap}px`;
      document.documentElement.style.setProperty("--lock-gap", `${gap}px`);
    }
    const main = document.getElementById("main");
    const footer = document.querySelector("footer");
    main?.setAttribute("inert", "");
    footer?.setAttribute("inert", "");

    /* The panel is portalled to <body>, so the header — a z-60 stacking
       context — now paints above it rather than below. For the trigger that
       is exactly right, and the panel reserves top padding for it. For the
       centre nav it is not: at 1024 and up those links run into the panel's
       left edge. This attribute fades them out for as long as the menu is
       open; the rule lives beside the nav's own styles in globals.css.
       An attribute rather than a prop because Nav owns that markup and this
       is the only thing CornerMenu needs from it. */
    document.body.setAttribute("data-menu-open", "");

    // Move focus into the panel.
    const t = window.setTimeout(
      () => panel.current?.querySelector<HTMLElement>("a[href]")?.focus(),
      reduced ? 0 : 260,
    );

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      document.body.style.paddingRight = prevPad;
      document.documentElement.style.removeProperty("--lock-gap");
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      document.body.removeAttribute("data-menu-open");
      window.clearTimeout(t);
    };
  }, [open, close, reduced]);


  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => {
          arm();
          setOpen((v) => !v);
        }}
        onPointerEnter={arm}
        onFocus={arm}
        onTouchStart={arm}
        aria-expanded={open}
        aria-controls={panelId}
        /* relative z-[60] keeps the trigger above the panel. The panel is a
           sibling inside <header>, so its z-50 competes here, not against the
           header's own z-index — raising the header alone changed nothing. */
        /* No pill, no capsule, no container — the header is printed onto the
           photograph and a filled chip broke that. Just the word and two thin
           rules, in the same 10px Inter as the rest of the header. The old
           bone-filled chip is gone with the bone header it belonged to. */
        /* py-[17px] is hit area, not spacing: 10px of type is a 10px-tall
           tap target, and this is the primary navigation control on a phone.
           The header is a fixed 72px flex row with items-center, so a taller
           button changes nothing visible — verified pixel-identical. */
        className="group relative z-[60] inline-flex shrink-0 items-center gap-2.5 py-[17px] text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-bb-white transition-opacity duration-200 hover:opacity-70"
      >
        <span className="nb-word">{open ? "Close" : "Menu"}</span>
        {/* Two 1px rules, not a hamburger. On open they cross into a close
            mark, which keeps one mark doing both jobs rather than swapping
            glyphs. */}
        <span aria-hidden="true" className="relative block h-[9px] w-[18px]">
          <span
            className="absolute left-0 block h-px w-full bg-current transition-transform duration-300 ease-out"
            style={{ top: open ? "4px" : "1px", transform: open ? "rotate(45deg)" : "none" }}
          />
          <span
            className="absolute left-0 block h-px w-full bg-current transition-transform duration-300 ease-out"
            style={{ top: open ? "4px" : "7px", transform: open ? "rotate(-45deg)" : "none" }}
          />
        </span>
      </button>

      {/* ── Why this is a portal ──────────────────────────────────────────
          The panel used to render here, inside <header>, and it was
          MEASURABLY in the wrong place.

          Two faults, compounding:

          1. The header sets `backdrop-filter: blur(14px)` once the page is
             scrolled. A backdrop-filter makes an element the containing
             block for every `position: fixed` DESCENDANT — so the panel was
             never anchored to the window at all, it was anchored to the
             header's box. It only looked right because the header happens to
             be full-width today. Any future header container, transform or
             filter would have moved the menu with no edit to this file.

          2. The panel sat inside a `max-w-[100rem] mx-auto` rail, written to
             match "the header's own max-width". The header has no
             max-width. So above 1600px the rail stopped growing while the
             trigger kept going right, and the panel drifted toward the
             centre of the screen. Measured on the shipped build: at 1920 the
             panel's right edge was 1736 against a CLOSE button ending at
             1888 — 152px adrift. At 2560 it was 2056 against 2528, which is
             472px, and reads as a panel floating in the middle of the page.
             That is what the client reported, and it reproduces exactly.

          Portalling to <body> removes fault 1 as a class rather than as an
          instance, and anchoring to the viewport's right edge at the
          header's own padding removes fault 2. The panel's position now
          depends on nothing but the window. */}
      {mounted && armed
        ? createPortal(
            <CornerMenuPanel open={open} close={close} reduced={reduced} panelId={panelId} panel={panel} />,
            document.body,
          )
        : null}
    </>
  );
}
