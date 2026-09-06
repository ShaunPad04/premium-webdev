import { Fragment } from "react";

import { faq, faqTemporary } from "@/lib/faq";

/* The practical questions — the calmest section on the page.
 *
 * Built on native <details name="faq">, not a JavaScript accordion, and kept
 * that way deliberately. The `name` attribute is what makes the group
 * exclusive: one answer open at a time, with no script. That gives for free
 * the things a hand-rolled accordion has to reimplement and usually gets
 * wrong — keyboard operation on Enter and Space, correct expanded/collapsed
 * semantics for assistive tech, and answers that exist as real HTML in the
 * document whether or not the row is open, so a search engine can read them.
 *
 * A <summary> already exposes its expanded state to assistive technology;
 * adding aria-expanded by hand would duplicate what the element reports and
 * risk the two disagreeing. So the trigger carries no ARIA of its own — the
 * semantics come from the element, which is the point of using it.
 *
 * Rules, not boxes: each row is a hairline and some breathing room. No card,
 * no background, no radius, no shadow.
 *
 * ── The blurred reveal ────────────────────────────────────────────────────
 * The answer resolves out of a blur, a piece at a time, when a row opens.
 *
 * It is CSS, not JavaScript, and it is staggered by WORD rather than by
 * character. Both are departures from the supplied component and both are
 * deliberate:
 *
 *   JS would have cost the section its reason for existing. A framer-motion
 *   mount animation inside a <details> runs when the page loads, not when the
 *   row opens — the content is in the DOM the whole time — so making it fire
 *   per-open means tracking open state in React, which means "use client",
 *   which means unmounting closed answers to re-trigger it, which takes the
 *   answers out of the static HTML that search engines and no-JS readers rely
 *   on. Driving it from the existing [open] state costs nothing and keeps all
 *   of that.
 *
 *   Per word, because per character wraps every letter of every answer in its
 *   own element: roughly 1,600 spans here, and screen readers can pronounce
 *   letter-wrapped text a character at a time. Words carry the same cascade at
 *   a tenth of the nodes and read normally aloud.
 *
 * @starting-style is what makes it run at all — ::details-content is
 * content-visibility: hidden while closed, so the first frame of an open has
 * no previous state to interpolate from. Browsers without it simply show the
 * answer, which is the same honest degradation the height animation makes.
 *
 * ── Honesty ───────────────────────────────────────────────────────────────
 * Two of these answers are derived from confirmed data; the rest are demo copy
 * written for the client, and one notice covers the section for as long as any
 * of them remain. See the rule at the top of lib/faq.ts. */
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="faq">
      <div className="faq-inner">
        <div className="faq-intro">
          <p className="faq-eyebrow">Questions</p>
          <h2 id="faq-heading" className="faq-h2">
            A few things worth knowing.
          </h2>
          <p className="faq-lede">
            Everything you might want to know before visiting.
          </p>
          {faqTemporary ? (
            <p className="faq-pending">
              [Some answers below are placeholder copy for this demo — not
              confirmed shop policy]
            </p>
          ) : null}
        </div>

        <div className="faq-list">
          {faq.map((item, i) => {
            const words = item.a.split(" ");
            return (
              <details key={item.q} name="faq" className="faq-row">
                <summary className="faq-summary">
                  <span className="faq-n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="faq-q">{item.q}</span>
                  {/* One plus that turns 45° into a cross — the same two strokes
                      rotating, so the shape morphs rather than swapping glyph. */}
                  <span className="faq-icon" aria-hidden="true">
                    <svg viewBox="0 0 16 16" width="15" height="15" fill="none">
                      <path d="M8 1.5v13M1.5 8h13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>

                <div className="faq-answer">
                  <p>
                    {words.map((word, w) => (
                      <Fragment key={w}>
                        {/* --i is the word's place in the cascade; the delay is
                            computed from it in CSS, capped so a long answer
                            does not take a second and a half to finish. */}
                        <span
                          className="faq-w"
                          style={{ "--i": w } as React.CSSProperties}
                        >
                          {word}
                        </span>
                        {w < words.length - 1 ? " " : null}
                      </Fragment>
                    ))}
                  </p>
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
