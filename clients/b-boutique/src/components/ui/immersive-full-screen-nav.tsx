"use client";

import gsap from "gsap";
import Link from "next/link";
import { useEffect, useRef, type RefObject } from "react";

import { MENU, directionsHref, socials } from "@/lib/nav";
import { addressLines, openingSummary, phoneDisplay, shop } from "@/lib/shop";
import { SocialMark } from "@/components/SocialMark";

/* The menu as a full-screen panel (2026-09-27, Brad: "let's try this menu
 * section"), after Hyperiux Vault's Immersive Full Screen Nav.
 *
 * Kept from the original: the clip-path wipe that opens the whole screen
 * from one edge, the links rising in a stagger after it, the images scaling
 * up beside them, the socials and the location along the foot, and the
 * letter-by-letter hover on each link (every character slides up and its
 * copy slides in under it).
 *
 * Changed, each for a reason:
 *   - No header or toggle of its own. CornerMenu already owns the trigger,
 *     Escape, the focus trap, the scroll lock, `inert` on the page and the
 *     lazy load; a second copy of each would fight the first. This is only
 *     the panel, with the same props CornerMenuPanel takes.
 *   - Its content is the site's: the MENU links, the photographs from
 *     "Follow us" (generated mood images, so alt=""), the real socials, and
 *     the address, hours and contact from lib/shop.ts. No stock images, no
 *     "#" links, no tagline nobody has written.
 *   - Links are Next <Link>s and close the panel.
 *   - Colours are the site's ink and white; the wipe comes down from the
 *     header, where the trigger is.
 *   - Reduced motion: a 0.2s fade, no wipe, no stagger, no letter roll. */

const CLIP_OPEN = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
const CLIP_TOP = "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)";
const CLIP_BOTTOM = "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";

const PHOTOS = [
  { src: "/img/look/follow-suit-800.webp", key: "suit" },
  { src: "/img/look/follow-casual-800.webp", key: "casual" },
];

function RollLink({ label, href, onClick, reduced }: { label: string; href: string; onClick: () => void; reduced: boolean }) {
  if (reduced) {
    return <Link href={href} onClick={onClick} className="ifn-link">{label}</Link>;
  }
  return (
    <Link href={href} onClick={onClick} className="ifn-link group/roll">
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="relative inline-block overflow-hidden align-bottom leading-[1.1]">
        {[...label].map((char, i) => (
          <span
            key={i}
            className="relative inline-block whitespace-pre transition-transform duration-500 ease-[cubic-bezier(0.625,0.05,0,1)] group-hover/roll:-translate-y-[1.1em] group-focus-visible/roll:-translate-y-[1.1em]"
            style={{ textShadow: "0 1.1em currentColor", transitionDelay: `${i * 0.015}s` }}
          >
            {char}
          </span>
        ))}
      </span>
    </Link>
  );
}

export default function ImmersiveMenuPanel({
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
  const inner = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const el = panel.current;
    const body = inner.current;
    if (!el || !body) return;
    const q = gsap.utils.selector(body);
    const links = q("[data-ifn-link]");
    const photos = q("[data-ifn-photo]");
    const foot = q("[data-ifn-foot]");

    // First render: closed, nothing to animate.
    if (first.current) {
      first.current = false;
      if (!open) {
        gsap.set(el, { clipPath: CLIP_TOP, visibility: "hidden" });
        return;
      }
    }

    gsap.killTweensOf([el, ...links, ...photos, ...foot]);

    if (reduced) {
      if (open) {
        gsap.set(el, { clipPath: CLIP_OPEN, visibility: "visible", autoAlpha: 0 });
        gsap.set([...links, ...photos, ...foot], { clearProps: "all" });
        gsap.to(el, { autoAlpha: 1, duration: 0.2, ease: "power2.out" });
      } else {
        gsap.to(el, { autoAlpha: 0, duration: 0.2, ease: "power2.out" });
      }
      return;
    }

    if (open) {
      gsap.set(el, { visibility: "visible", autoAlpha: 1, clipPath: CLIP_TOP });
      gsap.set(body, { scale: 1, opacity: 1 });
      gsap.set(links, { y: 40, opacity: 0 });
      gsap.set(photos, { scale: 0.82, opacity: 0 });
      gsap.set(foot, { y: 14, opacity: 0 });
      const tl = gsap.timeline();
      tl.to(el, { clipPath: CLIP_OPEN, duration: 1.0, ease: "power4.inOut" })
        .to(links, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.06 }, 0.55)
        .to(photos, { scale: 1, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.08 }, 0.65)
        .to(foot, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.05 }, 0.8);
    } else {
      const tl = gsap.timeline({
        onComplete: () => { gsap.set(el, { visibility: "hidden", clipPath: CLIP_TOP }); },
      });
      tl.to(body, { scale: 0.96, opacity: 0.4, duration: 0.6, ease: "power2.in" }, 0)
        .to(el, { clipPath: CLIP_BOTTOM, duration: 0.9, ease: "power4.inOut" }, 0);
    }
  }, [open, reduced, panel]);

  return (
    <div
      ref={panel}
      id={panelId}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      inert={!open}
      className="ifn fixed inset-0 z-50 overflow-y-auto bg-[#0A0A0A] text-white"
      style={{ clipPath: CLIP_TOP, visibility: "hidden" }}
    >
      <div ref={inner} className="ifn-inner">
        <div className="ifn-main">
          <ul className="ifn-links">
            {MENU.map((item) => (
              <li key={item.href} data-ifn-link>
                <span className="ifn-n" aria-hidden="true">{item.n}</span>
                <RollLink label={item.label} href={item.href} onClick={close} reduced={reduced} />
              </li>
            ))}
          </ul>
          <div className="ifn-photos" aria-hidden="true">
            {PHOTOS.map((p) => (
              <div key={p.key} className="ifn-photo" data-ifn-photo>
                <img src={p.src} alt="" loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        </div>

        <div className="ifn-foot">
          <div className="ifn-foot-col" data-ifn-foot>
            <address className="ifn-meta not-italic">
              {addressLines.map((l) => <span key={l} className="block">{l}</span>)}
            </address>
            <p className="ifn-meta">{openingSummary()}</p>
          </div>
          <div className="ifn-foot-col" data-ifn-foot>
            {shop.email ? <a href={`mailto:${shop.email}`} className="ifn-meta ifn-a">{shop.email}</a> : null}
            {shop.phone ? <a href={`tel:${shop.phone.replace(/\s+/g, "")}`} className="ifn-meta ifn-a">{phoneDisplay}</a> : null}
            <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="ifn-meta ifn-a">
              Find us<span className="sr-only"> (opens Google Maps in a new tab)</span> &#8599;&#xFE0E;
            </a>
          </div>
          {socials.length ? (
            <ul className="ifn-socials" data-ifn-foot aria-label="Follow B Boutique">
              {socials.map((s) => (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="ifn-social">
                    <SocialMark name={s.name} />
                    <span className="sr-only">{s.name} (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
