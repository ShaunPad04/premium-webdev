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
 * ── Editorial scale ───────────────────────────────────────────────────────
 * The client called this section generic three times. The first fix changed
 * the typeface. The second rebuilt the layout properly — an index with the
 * answer in a facing column, no number gutter, no row shift. Both were real
 * improvements and it was still eight hairline rows with a plus on each,
 * which is the most common FAQ pattern on the web. Each round had made the
 * existing pattern better instead of changing the pattern.
 *
 * So: questions at up to 44px Bodoni, a large ghosted numeral beside each
 * one, hundred-pixel rows, and the answer opening underneath its own
 * question. The section now reads as a magazine's information page rather
 * than a support centre, and the work is done by scale and air rather than by
 * anything drawn.
 *
 * Still the same markup, still no JavaScript, still a server component. The
 * first row carries `open`, so the section always says something.
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
                  {/* Decorative, and aria-hidden for it. The list position is
                      already carried by the order of the questions, and
                      "zero three" announced before every one of them is noise
                      to anybody listening. It is here for the composition —
                      which is also why it was right to delete it from the
                      52px rows it used to sit in, where it was neither
                      decoration nor information. */}
                  <span className="faq-n" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="faq-q">{item.q}</span>
                  {/* One plus that turns 45° into a cross — the same two strokes
                      rotating, so the shape morphs rather than swapping glyph.
                      It sits directly after the question now. At the far right
                      of a 1440 row it was 700px from the words it applied to,
                      which is an affordance pointing at nothing. */}
                  {/* Two hairlines at the section's own weight, not a "+"
                      glyph. The vertical one collapses as the row opens while
                      the whole mark rotates, so a plus becomes a minus in one
                      move rather than swapping one character for another. */}
                  <span className="faq-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                      <path className="faq-icon-h" d="M2 12h20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <path className="faq-icon-v" d="M12 2v20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
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
