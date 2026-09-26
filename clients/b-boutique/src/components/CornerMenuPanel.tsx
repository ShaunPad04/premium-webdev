"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { RefObject } from "react";

import { MENU, directionsHref, socials } from "@/lib/nav";
import { addressLines, openingSummary, phoneDisplay, shop } from "@/lib/shop";
import { SocialMark } from "./SocialMark";

const EASE = [0.22, 1, 0.36, 1] as const;

/* The menu's panel, split out of CornerMenu (2026-09-25) so that the motion
   library it animates with is not part of every page's first download. The
   trigger, the focus trap and the scroll lock stay in CornerMenu; this file
   is only what is drawn while the menu is open, and it is loaded when the
   browser goes idle or the trigger is approached, well before any tap. */
export default function CornerMenuPanel({
  open,
  close,
  reduced,
  panelId,
  panel,
}: {
  open: boolean;
  close: () => void;
  reduced: boolean;
  panelId: string;
  panel: RefObject<HTMLDivElement | null>;
}) {
  const panelMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 },
        transition: { duration: 0.01 } }
    : /* A drawer at every width since 2026-09-22, so it slides along the
         edge it is attached to: x only, no scale, no y. */
      {
          initial: { opacity: 0, x: 40 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 28, transition: { duration: 0.26, ease: EASE } },
          transition: { duration: 0.42, ease: EASE },
        };

  return (
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

            {/* ── Two shapes, one panel ────────────────────────────────────
                BELOW 640 it is a drawer: flush to the right edge, flush top
                and bottom, square on the right and rounded on the left only.

                It was a 384px corner card at every width, and a corner card
                on a phone has no corner to sit in. Measured on the shipped
                build at 898px tall: below 421 the width formula was still on
                its vw term so the margins stayed even by luck, and from 421
                up it hit the 384 cap and went lopsided — 30px left against
                18 right at 432, 98 against 18 at 500, 237 against 18 at 639
                — while never being more than 85% of the viewport tall, so it
                floated with background showing underneath. That is what the
                client photographed.

                A drawer has no margins, so it cannot have uneven ones.

                AT 640 AND ABOVE nothing changes: the corner card, its 24/32px
                inset, and its right edge landing on the same line as the
                CLOSE button above it. right-[18px] / sm:right-6 / lg:right-8
                are the header's own horizontal padding, which is what keeps
                that true at any width.

                The height moved off an inline style and onto classes so the
                two can differ. The inner scroller's max-height had to move
                with it — left behind, it clamps the drawer to the card's
                height and the drawer is full-height in name only. */}
            <motion.div
              key="panel"
              id={panelId}
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              /* SQUARE, and that is the single biggest change here.
                 This carried rounded-l-[22px] / sm:rounded-[22px] and a
                 0 30px 80px / .6 drop shadow. DESIGN.md is explicit that the
                 system is flat and square with no card vocabulary — every
                 other surface on this site has a hard corner and a hairline
                 — so a 22px-radius drawer under a heavy shadow was the one
                 element announcing that it came from somewhere else. That is
                 what the client was reading as "a cheap web designer": not
                 any single detail being ugly, but this panel not belonging to
                 the same site as the page behind it.
                 The shadow is kept but quietened, and a hairline does the
                 work of separating the panel from the photograph, which is
                 how everything else here separates things. */
              /* Tucked into the right edge at EVERY width since 2026-09-22.
                 Above 640 it was a card floating 24-32px in from the edge
                 and 20px down; the client asked why it was not tucked into
                 the right. A drawer has no margins to look adrift in. */
              className="pointer-events-auto fixed inset-y-0 right-0 z-50 h-svh max-h-svh w-full overflow-hidden border-l border-bone/15 bg-[#0A0A0A] text-bone shadow-[0_18px_60px_rgba(0,0,0,.45)] sm:w-[24rem]"
              {...panelMotion}
            >
              <div className="grain cm-scroll relative flex h-full max-h-svh flex-col overflow-y-auto p-6 pt-[7.75rem] sm:px-8">
                <p className="mb-3 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-bone/70">
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
                      <Link
                        href={item.href}
                        onClick={close}
                        className="group flex min-h-[44px] items-center gap-3.5 py-2.5 transition-[padding] duration-200 ease-out hover:pl-1.5 focus-visible:pl-1.5"
                      >
                        <span className="w-6 shrink-0 font-mono text-[0.625rem] leading-none text-bone/65 transition-colors duration-200 group-hover:text-gold-lift group-focus-visible:text-gold-lift">
                          {item.n}
                        </span>
                        {/* Bodoni, sentence case, regular weight.
                            It was `font-grotesk text-[1.6rem] font-extrabold
                            uppercase` — 29px of extrabold grotesque caps. That
                            is a streetwear or agency register, and it is the
                            loudest type on a womenswear boutique whose signed-
                            off display face is a Didone. The menu was shouting
                            SHOP / WOMENSWEAR / ACCESSORIES in a voice the rest
                            of the site never uses.
                            The typography table in CLAUDE.md gives large
                            editorial statements to Bodoni via `.display`, and
                            a full-height navigation panel is exactly that: it
                            is the most editorial surface on the site, not a
                            utility list. Caps also cost the descenders and
                            ascenders a Didone is built around. */}
                        {/* Bolder, 2026-09-21 — the second correction to this
                            line, and the client is right both times.
                            It was 29px extrabold grotesque CAPS, which read
                            as streetwear on a womenswear boutique. I swung
                            to Bodoni 400 sentence case and overshot: correct
                            register, no presence, and the primary navigation
                            ended up quieter than the body copy under it.
                            This is the middle position. Still Bodoni, still
                            sentence case — but larger, and at a REAL 600 off
                            the variable axis. `.display` pins font-weight 400
                            with the note "never a faked bold Bodoni", and
                            that note is about SYNTHETIC bold, which a browser
                            invents by smearing a 400 face and which destroys
                            the thick/thin stress. This is not that: no weight
                            is pinned in layout.tsx, so next/font loads Bodoni
                            Moda variable across 400-900 and 600 is a drawn
                            weight that costs no extra download. On a Didone a
                            heavier axis widens the stems while the hairlines
                            hold, so the contrast that is the whole reason for
                            the face gets stronger, not weaker.
                            Tailwind's font-semibold beats the base-layer
                            .display rule, which is exactly why CLAUDE.md
                            insists .display stays in @layer base. */}
                        <span className="cm-link">
                          {item.label}
                        </span>
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"
                          className="ml-auto shrink-0 self-center opacity-50 transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:opacity-90 group-focus-visible:translate-x-0.5 group-focus-visible:opacity-90">
                          <path d="M3 11L11 3M11 3H4.5M11 3v6.5" stroke="currentColor" strokeWidth="1.6"
                            strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
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
                  <p className="mb-2.5 mt-8 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-bone/70">
                    Contact
                  </p>
                  {/* Rendered only once real details exist — see lib/shop.ts */}
                  {shop.email ? (
                    <a
                      href={`mailto:${shop.email}`}
                      className="flex min-h-[44px] items-center text-[0.75rem] leading-[1.8] text-bone/85 transition-colors hover:text-bone"
                    >
                      {shop.email}
                    </a>
                  ) : null}
                  {shop.phone ? (
                    <a
                      href={`tel:${shop.phone.replace(/\s+/g, "")}`}
                      className="flex min-h-[44px] items-center text-[0.75rem] leading-[1.8] text-bone/85 transition-colors hover:text-bone"
                    >
                      {/* phoneDisplay, not the raw field. This printed
                          07305534342 as one unbroken eleven-digit run while
                          every other phone number on the site reads
                          07305 534342 — the client spotted it in the menu.
                          The href keeps the raw digits, which is what tel:
                          wants; only the visible text is grouped. */}
                      {phoneDisplay}
                    </a>
                  ) : null}
                  <address className="mt-2 not-italic text-[0.75rem] leading-[1.8] text-bone/85">
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
                  <p className="mt-2.5 text-[0.75rem] leading-[1.8] text-bone/80">
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
                            /* The mark beside the label, same as the footer,
                               from the same SocialMark component — the client
                               asked for the logos here too. min-h-[44px]
                               because these are the last tap targets in the
                               panel and were 20px tall as bare text.
                               The underline goes with the icon: a glyph and
                               an underlined word together read as two
                               controls, and the whole row is one link. */
                            /* A small lift on hover (2026-09-24, Brad);
                               none under reduced motion. */
                            className="inline-flex min-h-[44px] items-center gap-2 text-[0.6875rem] uppercase tracking-[0.12em] text-bone/85 transition-[color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] hover:text-bone focus-visible:-translate-y-[3px] motion-reduce:transition-colors motion-reduce:hover:translate-y-0 motion-reduce:focus-visible:translate-y-0"
                          >
                            <SocialMark name={sn.name} />
                            <span>{sn.name}</span>
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
      </AnimatePresence>
  );
}
