"use client";

import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { MENU, directionsHref, socials } from "@/lib/nav";
import { addressLines, openingSummary, shop } from "@/lib/shop";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const EASE = [0.22, 1, 0.36, 1] as const;

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
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
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
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      document.body.removeAttribute("data-menu-open");
      window.clearTimeout(t);
    };
  }, [open, close, reduced]);

  const panelMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 },
        transition: { duration: 0.01 } }
    : {
        initial: { opacity: 0, scale: 0.92, y: -10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.96, y: -6, transition: { duration: 0.28, ease: EASE } },
        transition: { duration: 0.55, ease: EASE },
      };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((v) => !v)}
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
        <span>{open ? "Close" : "Menu"}</span>
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
      {mounted
        ? createPortal(
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              key="veil"
              className="fixed inset-0 z-40 bg-onyx/55 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.01 : 0.35 }}
              onClick={close}
              aria-hidden="true"
            />

            {/* right-[18px] / sm:right-6 / lg:right-8 are the header's own
                horizontal padding, so the panel's right edge lands on the
                same line as the CLOSE button above it at every breakpoint,
                and keeps doing so at any width. */}
            <motion.div
              key="panel"
              id={panelId}
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="pointer-events-auto fixed right-[18px] top-3 z-50 w-[min(24rem,calc(100vw-2.25rem))] origin-top-right overflow-hidden rounded-[22px] bg-panel text-bone shadow-[0_30px_80px_rgba(0,0,0,.6)] sm:right-6 sm:top-5 lg:right-8"
              style={{ maxHeight: "calc(100svh - 1.5rem)" }}
              {...panelMotion}
            >
              <div className="grain relative flex max-h-[calc(100svh-1.5rem)] flex-col overflow-y-auto p-6 pt-20 sm:pt-[5.5rem]">
                <p className="mb-3 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-bone/50">
                  Navigation
                </p>

                <ul className="flex flex-col">
                  {MENU.map((item, i) => (
                    <motion.li
                      key={item.href}
                      initial={reduced ? false : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={
                        reduced
                          ? { duration: 0 }
                          : { duration: 0.42, ease: EASE, delay: 0.12 + i * 0.055 }
                      }
                      className="border-b border-bone/12 last:border-b-0"
                    >
                      <a
                        href={item.href}
                        onClick={close}
                        className="group flex min-h-[44px] items-center gap-3.5 py-2.5 transition-[padding] duration-200 ease-out hover:pl-1.5 focus-visible:pl-1.5"
                      >
                        <span className="w-6 shrink-0 font-mono text-[0.625rem] leading-none text-bone/50 transition-colors duration-200 group-hover:text-gold-lift group-focus-visible:text-gold-lift">
                          {item.n}
                        </span>
                        {/* Heavy grotesque in caps — the reference's defining
                            character. 29px / 800 / 0.98 / -0.02em. */}
                        <span className="font-grotesk text-[1.6rem] font-extrabold uppercase leading-[0.98] tracking-[-0.02em] sm:text-[1.8rem]">
                          {item.label}
                        </span>
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"
                          className="ml-auto shrink-0 self-center opacity-50 transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:opacity-90 group-focus-visible:translate-x-0.5 group-focus-visible:opacity-90">
                          <path d="M3 11L11 3M11 3H4.5M11 3v6.5" stroke="currentColor" strokeWidth="1.6"
                            strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                    </motion.li>
                  ))}
                </ul>

                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduced ? { duration: 0 } : { duration: 0.42, ease: EASE, delay: 0.12 + MENU.length * 0.055 }
                  }
                  className="mt-6"
                >
                  <a
                    href={directionsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex w-full items-center justify-between gap-3 border border-bone/40 px-4 py-3.5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-bone transition-colors hover:border-bone hover:bg-bone hover:text-onyx"
                  >
                    <span>Find us</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
                      className="shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>

                  {/* Contact set in monospace, matching the reference's
                      utility register. Real address and hours only — no
                      social accounts are held anywhere in this project. */}
                  <p className="mb-2.5 mt-8 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-bone/50">
                    Contact
                  </p>
                  {/* Rendered only once real details exist — see lib/shop.ts */}
                  {shop.email ? (
                    <a
                      href={`mailto:${shop.email}`}
                      className="mb-1 block font-mono text-[0.6875rem] leading-[1.75] text-bone/75 transition-colors hover:text-bone"
                    >
                      {shop.email}
                    </a>
                  ) : null}
                  {shop.phone ? (
                    <a
                      href={`tel:${shop.phone.replace(/\s+/g, "")}`}
                      className="mb-2 block font-mono text-[0.6875rem] leading-[1.75] text-bone/75 transition-colors hover:text-bone"
                    >
                      {shop.phone}
                    </a>
                  ) : null}
                  <address className="not-italic font-mono text-[0.6875rem] leading-[1.75] text-bone/75">
                    {addressLines.map((l) => (
                      <span key={l} className="block">
                        {l}
                      </span>
                    ))}
                  </address>
                  {/* Derived, never typed. This line read "Tue – Sun / 10:00
                      – 16:00" until now, and the shop is open SEVEN days —
                      confirmed by the client on 2026-09-20, when Monday was
                      corrected from closed to 10-4 in shop.ts.
                      So the main navigation, on every page of the site, was
                      telling customers a real shop is shut on a day it is
                      open. Two other places were found and fixed at the time;
                      this one was a hardcoded string and the sweep missed it.
                      openingSummary() reads the same hours table the Visit
                      section and the JSON-LD read, so it cannot drift again. */}
                  <p className="mt-2.5 font-mono text-[0.6875rem] leading-[1.75] text-bone/60">
                    {openingSummary()}
                  </p>

                  {/* Rendered only once real handles exist — see lib/nav.ts */}
                  {socials.length ? (
                    <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                      {socials.map((sn) => (
                        <li key={sn.name}>
                          <a
                            href={sn.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-bone/70 underline decoration-bone/25 underline-offset-4 transition-colors hover:text-bone"
                          >
                            {sn.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </motion.div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
