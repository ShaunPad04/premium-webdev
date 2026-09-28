"use client";

/* StickyContentWrapper, after the 21st.dev "Sticky Content" component
 * (2026-09-26, Brad: for Up close, three fabrics).
 *
 * A tall section with a sticky screen inside: words on one side, a
 * photograph on the other. Scrolling steps through the items; the words
 * slide and fade over, and the photograph wipes up to reveal the next one
 * while it eases in from a slight zoom. The scroll snaps to each item.
 *
 * What changed on the way in:
 *   - The layout and the first item are rendered on the server, and GSAP is
 *     imported only as the section comes near, so the page's first load
 *     carries none of it and nothing moves when it arrives.
 *   - Links go where they say (the original prevented every click).
 *   - The demo's inline images and copy are gone; items are passed in, and
 *     each photograph can carry <picture> sources and its own `sizes`.
 *   - The "scroll" hint sits inside the sticky screen, not position: fixed
 *     over the whole page, and does not animate under reduced motion.
 *   - The site's own type and colours instead of screen-width font sizes and
 *     shadcn theme tokens this project does not define.
 *   - Snapping pauses the site's smooth scroll (Lenis) while it runs, and
 *     ScrollTrigger is kept in step with it. */

import Link from "@/components/Link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import "./sticky-content-wrapper.css";

/** `media` picks a set by screen shape (the tall crops on portrait screens);
 *  `sizes` overrides the component's own for that set. */
export type StickySource = { type: string; srcSet: string; media?: string; sizes?: string };

export type StickySpec = { label: string; value: string; href?: string; srText?: string };

export type StickyContentItem = {
  heading: string;
  /** A small line above the heading, e.g. "01 / 03". */
  kicker?: string;
  /** A ruled spec sheet under the words: label left, value right. A value
   *  with an `href` is a link. */
  specs?: StickySpec[];
  paragraphs?: string[];
  list?: string[];
  link?: { href: string; text: string; srText?: string };
  image: string;
  sources?: StickySource[];
  alt: string;
};

type Props = {
  items: StickyContentItem[];
  /** Above the changing words: an eyebrow and the section heading. */
  header?: ReactNode;
  labelledBy?: string;
  /** `sizes` for the photographs. */
  sizes?: string;
  /** Short names, one per item, shown as an index at the foot of the words
   *  in place of the scroll hint. The current one is marked; each jumps to
   *  its step. */
  index?: string[];
  className?: string;
  contentEnterYPercent?: number;
  contentExitYPercent?: number;
  contentTransitionDuration?: number;
  contentDelay?: number;
  stepGap?: number;
  initialImageScale?: number;
  activeImageScale?: number;
  exitImageScale?: number;
};

type LenisLike = { stop: () => void; start: () => void; on: (e: "scroll", f: () => void) => void; off: (e: "scroll", f: () => void) => void };

export function StickyContentWrapper({
  items,
  header,
  labelledBy,
  sizes = "50vw",
  index,
  className = "",
  contentEnterYPercent = 2,
  contentExitYPercent = -2,
  contentTransitionDuration = 0.9,
  contentDelay = 0.35,
  stepGap = 2,
  initialImageScale = 1.5,
  activeImageScale = 1.2,
  exitImageScale = 1,
}: Props) {
  const section = useRef<HTMLElement>(null);
  const contents = useRef<(HTMLDivElement | null)[]>([]);
  const images = useRef<(HTMLDivElement | null)[]>([]);
  const n = items.length;
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = section.current;
    if (!el || n === 0) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const start = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const lenis = (window as Window & { __lenis?: LenisLike }).__lenis;

      const ctx = gsap.context(() => {
        const cs = contents.current;
        const is = images.current;
        cs.forEach((c, i) => gsap.set(c, { autoAlpha: i === 0 ? 1 : 0, yPercent: i === 0 ? 0 : contentEnterYPercent, zIndex: n - i }));
        is.forEach((im, i) =>
          gsap.set(im, {
            autoAlpha: reduced ? (i === 0 ? 1 : 0) : 1,
            zIndex: n - i,
            clipPath: "inset(0% 0% 0% 0%)",
            scale: reduced ? 1 : i === 0 ? activeImageScale : initialImageScale,
            transformOrigin: "center center",
          }),
        );

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            onUpdate: (self) => setActive(Math.round(self.progress * (n - 1))),
            snap: n > 1
              ? {
                  snapTo: Array.from({ length: n }, (_, i) => i / (n - 1)),
                  duration: { min: 0.2, max: 0.5 },
                  ease: "power2.inOut",
                  delay: 0.1,
                  inertia: false,
                  onStart: () => lenis?.stop(),
                  onComplete: () => lenis?.start(),
                }
              : undefined,
          },
        });

        for (let i = 0; i < n - 1; i++) {
          const at = i * stepGap;
          tl.to(cs[i], { autoAlpha: 0, yPercent: contentExitYPercent, duration: contentTransitionDuration, ease: "power2.inOut" }, at)
            .fromTo(cs[i + 1], { autoAlpha: 0, yPercent: contentEnterYPercent }, { autoAlpha: 1, yPercent: 0, duration: contentTransitionDuration, ease: "power2.inOut" }, at + contentTransitionDuration + contentDelay)
            .to(is[i], reduced ? { autoAlpha: 0, duration: stepGap, ease: "none" } : { clipPath: "inset(0% 0% 100% 0%)", scale: exitImageScale, duration: stepGap, ease: "none" }, at);
          tl.to(is[i + 1], reduced ? { autoAlpha: 1, duration: stepGap, ease: "none" } : { scale: activeImageScale, duration: stepGap, ease: "none" }, at);
        }
        tl.duration(Math.max(1, (n - 1) * stepGap));
      }, el);

      const update = () => ScrollTrigger.update();
      (lenis as LenisLike | undefined)?.on("scroll", update);
      ScrollTrigger.refresh();

      cleanup = () => {
        (lenis as LenisLike | undefined)?.off("scroll", update);
        lenis?.start();
        ctx.revert();
      };
    };

    const io = new IntersectionObserver((e) => {
      if (e.some((x) => x.isIntersecting)) {
        io.disconnect();
        start();
      }
    }, { rootMargin: "100% 0px" });
    io.observe(el);

    return () => {
      cancelled = true;
      io.disconnect();
      cleanup?.();
    };
  }, [n, contentEnterYPercent, contentExitYPercent, contentTransitionDuration, contentDelay, stepGap, initialImageScale, activeImageScale, exitImageScale]);

  /* The section's steps are evenly spaced through its scroll, so step i
     sits at i/(n-1) of the way from its top to its bottom. */
  const go = (i: number) => {
    const el = section.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + (n > 1 ? (i / (n - 1)) * (el.offsetHeight - window.innerHeight) : 0);
    const lenis = (window as Window & { __lenis?: { scrollTo?: (y: number) => void } }).__lenis;
    if (lenis?.scrollTo) lenis.scrollTo(y);
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  if (n === 0) return null;

  return (
    <section ref={section} className={`scw relative w-full ${className}`} aria-labelledby={labelledBy} style={{ height: `${n * 100}svh` }}>
      <div className="scw-stage sticky top-0 flex h-svh w-full justify-between max-[1025px]:flex-col-reverse max-[1025px]:justify-start">
        <div className="scw-left relative flex h-full w-[42%] flex-col max-[1025px]:h-[55%] max-[1025px]:w-full">
          {header ? <div className="scw-head">{header}</div> : null}
          <div className="scw-slot relative flex-1">
          {items.map((item, i) => (
            <div
              key={item.heading}
              ref={(node) => { contents.current[i] = node; }}
              className="scw-content absolute inset-0"
              style={i === 0 ? undefined : { opacity: 0, visibility: "hidden" }}
            >
              {item.kicker ? <p className="scw-label scw-kicker">{item.kicker}</p> : null}
              <h3 className="scw-h">{item.heading}</h3>
              {item.paragraphs?.map((p) => <p key={p.slice(0, 24)} className="scw-p">{p}</p>)}
              {item.specs?.length ? (
                <dl className="scw-specs">
                  {item.specs.map((sp) => (
                    <div key={sp.label} className="scw-spec">
                      <dt className="scw-label">{sp.label}</dt>
                      <dd>
                        {sp.href ? (
                          <Link href={sp.href} className="scw-spec-link">
                            {sp.value}
                            {sp.srText ? <span className="sr-only">{sp.srText}</span> : null}
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </Link>
                        ) : sp.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {item.list?.length ? (
                <ul className="scw-list">
                  {item.list.map((li) => <li key={li}>{li}</li>)}
                </ul>
              ) : null}
              {item.link ? (
                <Link href={item.link.href} className="scw-link group">
                  <span className="scw-link-text">
                    {item.link.text}
                    {item.link.srText ? <span className="sr-only">{item.link.srText}</span> : null}
                  </span>
                  <svg className="scw-link-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ) : null}
            </div>
          ))}
          </div>
          {index?.length ? (
            <ol className="scw-index" aria-label="Materials">
              {index.map((name, i) => (
                <li key={name}>
                  <button type="button" className="scw-label scw-index-btn" aria-current={i === active ? "true" : undefined} onClick={() => go(i)}>
                    <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span> {name}
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <div className="scw-hint" aria-hidden="true">
              <span>Scroll</span>
              <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
                <polyline className="scw-chev scw-chev1" points="2,2 10,9 18,2" />
                <polyline className="scw-chev scw-chev2" points="2,10 10,17 18,10" />
                <polyline className="scw-chev scw-chev3" points="2,18 10,25 18,18" />
              </svg>
            </div>
          )}
        </div>

        <div className="scw-right relative h-full w-1/2 overflow-hidden max-[1025px]:mt-[calc(72px+3svh)] max-[1025px]:h-[37%] max-[1025px]:w-full">
          {items.map((item, i) => (
            <div
              key={item.heading}
              ref={(node) => { images.current[i] = node; }}
              className="absolute inset-0 h-full w-full"
              style={{ zIndex: n - i, transform: `scale(${i === 0 ? activeImageScale : initialImageScale})` }}
            >
              <picture>
                {item.sources?.map((s) => <source key={`${s.media ?? ""}${s.type}`} type={s.type} srcSet={s.srcSet} media={s.media} sizes={s.sizes ?? sizes} />)}
                <img src={item.image} alt={item.alt} className="h-full w-full object-cover" loading="lazy" decoding="async" />
              </picture>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
