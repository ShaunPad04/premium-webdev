"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DELIVERY_P, FREE_DELIVERY_OVER_P, formatPrice } from "@/lib/catalogue";
import { openingSummary, shop } from "@/lib/shop";
import { useInView } from "@/lib/useInView";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { ImageSlot } from "./ImageSlot";

/* Come in, or have it sent.
 *
 * ── What this replaces, and why ───────────────────────────────────────────
 * A six-quote review rail. The client said on 2026-09-21 that she has three
 * reviews, not six — and the six on the page were invented, every one of
 * them, which `lib/testimonials.ts` said in capitals at the top of the file.
 *
 * Cutting six fictional quotes down to three real ones was not the ask and
 * would not have been an improvement: three reviews is a thin wall of
 * reviews, and a section whose whole composition is "lots of people say
 * this" reads as weaker with three than with none. So the section is gone
 * and its place on the page is taken by something a boutique of this size
 * actually has to say. The invented file goes with it.
 *
 * ── The reference ─────────────────────────────────────────────────────────
 * This is the service band that sits low on the homepage at Arket, COS,
 * Sézane, Toteme — a short numbered list of how buying from them works,
 * set as editorial type against one photograph rather than as three icons in
 * three boxes. It is the pattern those shops use precisely where a smaller
 * site puts reviews, and for the same reason: at the point a customer is
 * nearly convinced, the useful thing is how it works, not who else liked it.
 *
 * No icons, no cards, no boxes. DESIGN.md says the system is flat and square
 * and the site has no card vocabulary; the separator here is a hairline rule,
 * which is how everything else on this page separates things. The index
 * numbers are the same tracked micro-type the rest of the site uses.
 *
 * ── Every line is a fact somebody confirmed ───────────────────────────────
 * This section makes three claims to a customer and not one of them was
 * written here:
 *
 *   01  the hours and the address come out of `shop.ts`, both client-
 *       confirmed (locked decision 9 and the 2026-09-20 answers).
 *   02  £4.35 / free over £120 / Royal Mail / next working day — confirmed
 *       2026-09-20, and read from the SAME constants `/api/checkout` prices
 *       the basket with, so the homepage cannot quote a postage the bag
 *       does not charge.
 *   03  returns come back to the shop, the customer pays return postage on a
 *       change of mind — confirmed 2026-09-20.
 *
 * What is deliberately NOT here: a returns WINDOW. How long a customer has is
 * one of the four `required` slots still open on `/returns`, and a number
 * printed on the homepage is a term of the contract of sale whatever anybody
 * meant by it. The row sends the reader to the page that carries the full
 * terms instead of summarising terms that are not settled.
 *
 * ── The photograph ────────────────────────────────────────────────────────
 * Kept from the section this replaces, including its slow independent clock.
 * It is the shop's own room — rails, shelves, marble — and never a portrait. */

/** The shop, not a customer. Three interiors on a slow rotation. */
const SHOTS: { slot: string; alt: string }[] = [
  {
    slot: "panel-all",
    alt: "A rail of womenswear against the boutique's black marble wall",
  },
  {
    slot: "panel-knitwear",
    alt: "Folded knitwear on a brass and smoked-glass shelf in the boutique",
  },
  {
    slot: "panel-trousers",
    alt: "Tailored trousers hanging on a polished brass rail in the boutique",
  },
];

/** Slow on purpose. Nothing else in this section moves, so the photograph is
 *  the only clock in it and has no second hand to keep time with. */
const SHOT_INTERVAL = 9000;

export function Service() {
  const reduced = usePrefersReducedMotion();
  const [shot, setShot] = useState(0);
  const [tabHidden, setTabHidden] = useState(false);
  /* The photographs only need to change while somebody can see them. */
  const [section, inView] = useInView<HTMLElement>();

  useEffect(() => {
    const onVis = () => setTabHidden(document.visibilityState === "hidden");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (reduced || tabHidden || !inView || SHOTS.length < 2) return;
    const t = window.setTimeout(
      () => setShot((i) => (i + 1) % SHOTS.length),
      SHOT_INTERVAL,
    );
    return () => window.clearTimeout(t);
  }, [shot, reduced, tabHidden, inView]);

  const rows = [
    {
      title: "Open seven days",
      body: openingSummary(),
      meta: `${shop.street}, ${shop.town} ${shop.postcode}`,
      href: "/#visit",
      link: "Find the shop",
    },
    {
      title: "UK delivery",
      body: `${formatPrice(DELIVERY_P)} by Royal Mail, next working day.`,
      meta: `Free on orders over ${formatPrice(FREE_DELIVERY_OVER_P)}.`,
      href: "/delivery",
      link: "Delivery in full",
    },
    {
      title: "Returns",
      body: "Send it back, or bring it into the shop.",
      meta: "Return postage is yours if you change your mind.",
      href: "/returns",
      link: "Returns in full",
    },
  ];

  return (
    <section
      id="service"
      ref={section}
      aria-labelledby="svc-heading"
      className="svc"
    >
      <div className="svc-media">
        {SHOTS.map((s, i) => (
          <div
            key={s.slot}
            className={`svc-shot ${i === shot ? "is-active" : ""}`}
            aria-hidden={i !== shot}
          >
            <ImageSlot
              tone="marble"
              seed={31 + i}
              slot={s.slot}
              alt={i === shot ? s.alt : ""}
              sizes="(min-width: 1024px) 47vw, 100vw"
              className="absolute inset-0 h-full w-full"
            />
          </div>
        ))}
      </div>

      <div className="svc-body">
        <div className="svc-inner">
          <p className="svc-eyebrow">In the shop, or sent to you</p>
          {/* The italic axis, used the way the typography note asks: one word
              in a statement, never a whole heading and never body copy. */}
          <h2 id="svc-heading" className="svc-h2">
            Come in, or have it <em>sent</em>.
          </h2>

          <ol className="svc-list">
            {rows.map((r, i) => (
              <li key={r.title} className="svc-row">
                <span className="svc-num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="svc-row-body">
                  <h3 className="svc-row-title">{r.title}</h3>
                  <p className="svc-row-text">{r.body}</p>
                  <p className="svc-row-meta">{r.meta}</p>
                  <Link href={r.href} className="svc-row-link">
                    {r.link}
                    <span className="svc-row-arrow" aria-hidden="true">
                      &rarr;
                    </span>
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
