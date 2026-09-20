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
 * ── Index and facing page ─────────────────────────────────────────────────
 * On a wide screen this is NOT an accordion. The questions are an index down
 * the left, under the heading, and the open answer is set in the facing
 * column — which is the half of the section that used to be empty. The
 * previous version put an eight-row accordion beside a heading that stopped
 * a third of the way down, leaving roughly 500px of dead cream, a plus sign
 * 700px from the question it belonged to, and nothing open, so a visitor
 * scrolling past learned nothing at all. That is a support-centre layout, and
 * the client called it generic twice; the first fix changed the typeface,
 * which was treating a structural problem as a typographic one.
 *
 * It is still the same markup and still no JavaScript. The answers are
 * positioned into the facing column by CSS; `name="faq"` already guarantees
 * exactly one is open, so one panel is all that can ever show. Below 1024px
 * the positioning is dropped and it stacks as an ordinary accordion, which is
 * the right shape on a phone.
 *
 * The first row carries `open`, so the section always says something.
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
              /* `open` on the first row only. An index whose facing page is
                 blank is a worse version of the problem this replaces. */
              <details key={item.q} name="faq" className="faq-row" open={i === 0}>
                <summary className="faq-summary">
                  <span className="faq-q">{item.q}</span>
                  {/* One plus that turns 45° into a cross — the same two strokes
                      rotating, so the shape morphs rather than swapping glyph.
                      It sits directly after the question now. At the far right
                      of a 1440 row it was 700px from the words it applied to,
                      which is an affordance pointing at nothing. */}
                  <span className="faq-icon" aria-hidden="true">
                    <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
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
