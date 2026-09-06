"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { PRIMARY } from "@/lib/nav";
import { BagLink } from "./BagLink";
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
        <Link
          /* next/link rather than <a>, because the href now starts with a
             slash and this is real routing rather than a same-page anchor.
             Next's own lint rule flagged it the moment "#top" became "/#top":
             an <a> to an internal route does a full document load, throwing
             away the client cache and re-running every entrance on the page
             it lands on.

             "/#top", not "#top".
             A bare fragment means "a section of whatever page you are on", and
             #top is the hero — which exists on the home page and nowhere else.
             So on /clothing, /accessories, /about and /contact the wordmark was
             a link to nothing: it did not navigate and it did not scroll.
             With the slash it is a real link home from the four sub-pages and
             still an ordinary same-document scroll to the top of the hero when
             you are already on the home page. */
          href="/#top"
          aria-label="B Boutique, home"
          /* py-3 for the same reason as the MENU button: a 20px-tall link in
             a 72px items-center row becomes a 44px target and nothing moves. */
          className="display shrink-0 py-3 text-[20px] leading-none tracking-[-0.02em] lg:text-[21px]"
        >
          B Boutique
        </Link>

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
              1440 the gap goes 46px -> 40px, which is the price.

              Narrowed again to 2.4vw when SHOP became a seventh item. Measured
              at 1024 after: the nav's right edge is checked against the Menu
              button below rather than assumed. */}
          <ul className="flex items-center" style={{ gap: "clamp(18px, 2.4vw, 44px)" }}>
            {PRIMARY.map((item) =>
              "menu" in item && item.menu ? (
                <NavMenuItem key={item.label} item={item} />
              ) : (
                <li key={item.label} className="nav-item">
                  <a
                    href={item.href}
                    className="nav-link nav-link--bar text-[10px] font-semibold uppercase leading-none tracking-[0.14em]"
                  >
                    {item.label}
                  </a>
                </li>
              ),
            )}
          </ul>
        </nav>

        {/* RIGHT */}
        <div className="flex shrink-0 items-center gap-5 sm:gap-7">
          {/* Both of these were inert, aria-hidden spans: part of the approved
              composition with nothing behind them, because announcing a
              control that does nothing is worse than not announcing it.
              Locked decision 3 said to swap each for a real control "the
              moment it becomes real". Both moments have now happened — the
              bag when the shop was built, and search on 2026-09-06 when /shop
              gained a field that actually filters the catalogue.

              So SEARCH is a link to that field rather than a button that
              opens an overlay: the results are the shop's own grid, on the
              shop's own page, and a modal would be a second place for the
              catalogue to live. next/link, and "/shop#find" with the slash,
              for the same reason as the wordmark above — a bare fragment
              means a section of whatever page you are on. */}
          <Link
            href="/shop#find"
            /* py-3 turns a 10px line into a 44px target without moving it,
               the same trick the wordmark and MENU use. */
            className="hidden select-none py-3 text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-bb-white/70 transition-colors hover:text-bb-white lg:inline-block"
          >
            Search
          </Link>
          <BagLink />

          <CornerMenu />
        </div>
      </div>
    </header>
  );
}

/* One header item with a menu under it.
 *
 * The panel is opened by CSS — :hover for a real pointer, :focus-within for a
 * keyboard — so opening costs no state and cannot drift out of step with the
 * DOM. Exactly one thing needs JavaScript, and it is the reason this is a
 * component rather than four lines in the map above.
 *
 * ── Why Escape needs state ────────────────────────────────────────────────
 * Escape should close the panel and leave focus on the trigger, which is what
 * a keyboard user expects and where they want to carry on from. But the
 * trigger is inside the element :focus-within is watching, so focus landing
 * back on it re-opens the panel immediately — measured, not assumed: the first
 * version of this returned focus to the trigger and the panel's opacity was
 * still 1 afterwards.
 *
 * So Escape sets `dismissed`, which overrides both open rules, and anything
 * that means the user has moved on clears it again: the pointer leaving or
 * arriving, or focus leaving the item entirely. The panel can never be stuck
 * shut. */
function NavMenuItem({
  item,
}: {
  item: { label: string; href: string; menu: readonly { label: string; href: string }[] };
}) {
  const [dismissed, setDismissed] = useState(false);
  const trigger = useRef<HTMLAnchorElement>(null);

  return (
    <li
      className="nav-item has-menu"
      data-dismissed={dismissed || undefined}
      onPointerEnter={() => setDismissed(false)}
      onPointerLeave={() => setDismissed(false)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDismissed(false);
      }}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        setDismissed(true);
        trigger.current?.focus();
      }}
    >
      <a
        ref={trigger}
        href={item.href}
        className="nav-link nav-link--bar text-[10px] font-semibold uppercase leading-none tracking-[0.14em]"
      >
        {item.label}
      </a>

      <div className="nav-menu-wrap">
        <ul className="nav-menu" aria-label={`${item.label} categories`}>
          {item.menu.map((sub, i) => (
            <li key={sub.href} className="nav-menu-item" style={{ "--i": i } as React.CSSProperties}>
              <a href={sub.href} className="nav-menu-link">
                {sub.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
