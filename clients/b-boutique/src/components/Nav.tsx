"use client";

import { useEffect, useState } from "react";

import { PRIMARY } from "@/lib/nav";
import { CornerMenu } from "./CornerMenu";

/* The campaign header.
 *
 * Printed onto the photograph rather than sitting in a container: transparent
 * at the top, with no pill, no capsule and no strip. Once the hero starts
 * leaving, it settles into a near-black bar — black, never the bone it used
 * to turn, which put a cream band across the top of a black page.
 *
 * Three parts, and the centre is a real nav landmark. Every href in PRIMARY
 * is an anchor that exists on this page; see the note in lib/nav.ts about
 * Clothing and Accessories both landing on the rails. */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    /* 64px, not the hero's full height: the bar has to be readable the moment
       the photograph starts sliding out from under it, not a screen later. */
    const onScroll = () => setScrolled(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      /* z-[60] keeps the Menu trigger above the panel it opens (z-50); the
         panel reserves top padding for exactly this. */
      className="fixed inset-x-0 top-0 z-[60] text-bb-white"
      style={{
        background: scrolled ? "rgba(5,5,5,.90)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,.10)" : "transparent"}`,
        transition:
          "background 480ms var(--bb-ease), backdrop-filter 480ms var(--bb-ease), border-color 480ms var(--bb-ease)",
      }}
    >
      {/* A whisper of a scrim, only while transparent, and only at the very
          top edge. The photograph is the point — a heavy overlay turns its red
          to burgundy. This exists so 10px type stays legible over a highlight,
          nothing more. */}
      {!scrolled ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[120px]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(5,5,5,.42) 0%, rgba(5,5,5,.16) 55%, transparent 100%)",
          }}
        />
      ) : null}

      <div className="relative flex h-[72px] items-center justify-between px-[18px] sm:px-6 lg:px-8">
        {/* LEFT — the wordmark, small. The giant one lives in the footer. */}
        <a
          href="#top"
          aria-label="B Boutique, home"
          /* py-3 for the same reason as the MENU button: a 20px-tall link in
             a 72px items-center row becomes a 44px target and nothing moves. */
          className="display shrink-0 py-3 text-[20px] leading-none tracking-[-0.02em] lg:text-[21px]"
        >
          B Boutique
        </a>

        {/* CENTRE */}
        <nav
          aria-label="Primary"
          className="pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 lg:block"
        >
          {/* 2.8vw, not 3.2. The centre nav gained a sixth item (Contact) when
              the site gained pages, and at exactly 1024 — the width where this
              nav first appears — the old spacing left 8px between CONTACT and
              the Menu button. It cleared, but only just.

              The floor is not what fixes it: at 1024 the clamp is on its vw
              term, so lowering the 28px did nothing at all (measured: no
              change). Narrowing the vw term is what moves it. Measured after:
              the nav's right edge goes 767 -> 757 at 1024 against a Menu
              button starting at 775, so 18px of clearance instead of 8. At
              1440 the gap goes 46px -> 40px, which is the price. */}
          <ul className="flex items-center" style={{ gap: "clamp(22px, 2.8vw, 50px)" }}>
            {PRIMARY.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="nav-link nav-link--bar text-[10px] font-semibold uppercase leading-none tracking-[0.14em]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* RIGHT */}
        <div className="flex shrink-0 items-center gap-5 sm:gap-7">
          {/* Search and Bag are part of the approved composition, and neither
              has anything behind it: there is no search index and no cart. So
              they are spans, not links or buttons — nothing to click, nothing
              to tab to, and hidden from assistive tech, because announcing a
              control that does nothing is worse than not announcing it. The
              moment either becomes real, swap the span for an <a>/<button>
              and delete the aria-hidden. */}
          <span
            aria-hidden="true"
            className="hidden select-none text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-bb-white/70 lg:inline"
          >
            Search
          </span>
          <span
            aria-hidden="true"
            className="hidden select-none text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-bb-white/70 lg:inline"
          >
            Bag (0)
          </span>

          <CornerMenu />
        </div>
      </div>
    </header>
  );
}
