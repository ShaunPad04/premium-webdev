"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { PRIMARY } from "@/lib/nav";
import { AnnounceBar } from "./AnnounceBar";
import { BagLink } from "./BagLink";
import { CornerMenu } from "./CornerMenu";
import { NavSearch } from "./NavSearch";

/* The campaign header.
 *
 * Printed onto the photograph rather than sitting in a container: transparent
 * at the top, with no pill, no capsule and no strip. Once the hero starts
 * leaving, it settles into a near-black bar — black, never the bone it used
 * to turn, which put a cream band across the top of a black page.
 *
 * Three parts, and the centre is a real nav landmark. Every href in PRIMARY
 * is an anchor that exists on this page; see the note in lib/nav.ts about
 * Clothing and Accessories both landing on the rails.
 *
 * ── `solid`: for routes that open on light ────────────────────────────────
 * Transparent-at-the-top is correct over a dark full-bleed image, and every
 * route that is not the home page was given a PageMasthead precisely so this
 * header has something dark to sit on — read the note at the top of that
 * component, it says so outright.
 *
 * The product page is the one route that never got one. It opens straight
 * into the split layout: photograph on the left, white on the right. The
 * centre nav and SEARCH / BAG / MENU all sit over the white half, so at
 * scroll 0 they rendered white-on-white and the scrim under them — tuned to
 * keep 10px type off a bright highlight in a photograph — did almost nothing
 * against #FAF5F3. The client spotted it on a screenshot.
 *
 * Fixed here rather than by adding a black band to the product page, because
 * the garment photograph is the point of that screen and a masthead above it
 * would push the thing being sold below the fold.
 *
 * Two states, deliberately separate rather than one flag:
 *   opaque  — draws the bar. `solid` forces it on from the first paint.
 *   scrolled — the reader has actually moved, and is the ONLY thing that may
 *              collapse the announcement strip.
 * Collapsing them into one would put the strip away before the product page
 * had been scrolled at all, which is a visible regression on a route that
 * currently shows it. */
export function Nav({ solid = false }: { solid?: boolean } = {}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    /* 64px, not the hero's full height: the bar has to be readable the moment
       the photograph starts sliding out from under it, not a screen later. */
    const onScroll = () => setScrolled(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const opaque = solid || scrolled;

  return (
    <header
      /* z-[60] keeps the Menu trigger above the panel it opens (z-50); the
         panel reserves top padding for exactly this. */
      className="fixed inset-x-0 top-0 z-[60] text-bb-white"
      style={{
        /* SOLID ink, the same token as the announcement strip above it —
           at the client's request, 2026-09-22. It was rgba(26,20,22,.90)
           with a 14px blur: the right colour at 90%, so the warm pink page
           showed through and turned the bar a muddy grey-brown sitting
           under a strip of the true ink. Two shades of "dark" stacked on
           top of each other read as a mistake. One colour, one band. */
        background: opaque ? "var(--bb-black)" : "transparent",
        borderBottom: `1px solid ${opaque ? "rgba(255,255,255,.10)" : "transparent"}`,
        transition:
          "background 480ms var(--bb-ease), border-color 480ms var(--bb-ease)",
      }}
    >
      {/* A whisper of a scrim, only while transparent, and only at the very
          top edge. The photograph is the point — a heavy overlay turns its red
          to burgundy. This exists so 10px type stays legible over a highlight,
          nothing more. */}
      {!opaque ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[120px]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(26, 20, 22, .42) 0%, rgba(26, 20, 22, .16) 55%, transparent 100%)",
          }}
        />
      ) : null}

      {/* The announcement bar, above the nav row.
       *
       * Rendered here rather than per-page: Nav appears on twelve routes and
       * the bar belongs on all of them, so putting it anywhere else means
       * twelve places to forget it.
       *
       * It COLLAPSES on scroll rather than following the page down. An
       * announcement that follows a reader forty screens has stopped being an
       * announcement and become furniture, and the header is fixed, so a
       * permanent bar would eat a line of every 100svh hero. `scrolled` is
       * the state the header already keeps for its own background, so this
       * costs no new listener and cannot drift out of step with it.
       *
       * Collapsed by max-height with overflow hidden, and `inert` with it: a
       * screen reader should not be offered a link inside a strip the page
       * has visibly put away, and neither should the Tab key.
       *
       * It was `aria-hidden` until 2026-09-22, which does only the first of
       * those. The link inside stayed focusable, so a keyboard user tabbing
       * after scrolling landed on an invisible link that a screen reader
       * would then not announce — axe's `aria-hidden-focus`, serious, on
       * every page once scrolled past 64px. The accessibility suite audits
       * each page at scroll 0, where the strip is open, so it never saw it;
       * found by auditing a filled-in bag after scrolling to its form.
       * `inert` removes the subtree from the accessibility tree AND from
       * focus, which is the whole of what this needed. */}
      <div
        className="announce-shell"
        data-collapsed={scrolled ? "" : undefined}
        inert={scrolled || undefined}
      >
        <AnnounceBar />
      </div>

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

              SEARCH was a link to that field — `/shop#find` — which kept the
              catalogue in exactly one place but threw away whatever page you
              were on to get there. The client asked for that to stop, and it
              is a fair objection: somebody halfway down /about who wants to
              know whether there is a camel coat should not lose /about to
              find out.

              It is now a panel that opens under the header, in NavSearch. The
              rule the link was protecting is untouched — the panel calls the
              same `searchProducts` over the same catalogue /shop filters, so
              this is a second SURFACE onto the search, never a second copy of
              it. */}
          <NavSearch />
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
