import { faq, faqTemporary } from "@/lib/faq";

/* The practical questions, set as an information spread rather than an
 * accordion.
 *
 * ── Why the accordion is gone ─────────────────────────────────────────────
 * The client called this section generic four times. Each of the first three
 * fixes improved the accordion: the typeface, then the layout (an index with
 * the answer in a facing column), then the scale (44px Bodoni questions,
 * hundred-pixel rows, a ghosted numeral). Every one of them was a real
 * improvement, and every one of them left eight hairline rows with a plus
 * sign on each — which is the single most common component on the web.
 *
 * Three rounds of making the same pattern better is the signal that the
 * pattern is the problem. So the pattern is gone. There is no accordion, no
 * row, no plus, no open state and nothing to click.
 *
 * Every answer is simply on the page, arranged in columns and read like the
 * information page at the back of a magazine. The work is done by scale,
 * measure and air. The one thing drawn is the hairline between the columns,
 * which is a typographic rule rather than a container — the section still
 * has no card, no background, no radius and no shadow anywhere in it.
 *
 * ── What this buys, beyond looking less generic ───────────────────────────
 * An accordion hides seven answers out of eight behind a click. For eight
 * short answers that is interaction for its own sake: the reader wanted the
 * answer, and the fastest route to it is for it to already be there.
 *
 * It also deletes a whole family of defects this section kept producing,
 * because there is nothing left to be in a state:
 *
 *   - No focus ring on a row, and so no more of the Chromium/Safari
 *     :focus-visible divergence that put a box round the questions.
 *   - No ::details-content, and so no paint containment creating a
 *     containing block that anchored the answer to the wrong element.
 *   - No per-word span cascade: roughly 200 elements gone from the page.
 *   - No @starting-style, no interpolate-size, no height animation, and no
 *     browsers left behind when they are unsupported.
 *
 * Headings, not summaries: each question is an <h3> under the section's <h2>,
 * so the outline is correct and a screen reader can jump question to question
 * natively. Still a server component, still no JavaScript, and now the
 * answers are plain prose in the document rather than prose inside a widget.
 *
 * ── Honesty ───────────────────────────────────────────────────────────────
 * Two of these answers are derived from confirmed data; the rest are demo
 * copy written for the client, and one notice covers the section for as long
 * as any of them remain. See the rule at the top of lib/faq.ts. */
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

        {/* CSS columns rather than a grid, deliberately. A grid would put
            each entry in a cell of its own and leave ragged space under the
            short ones; columns let the text flow and fill, which is what
            makes this read as a printed page rather than as eight tiles.
            `break-inside: avoid` keeps a question and its answer together. */}
        <div className="faq-spread">
          {faq.map((item) => (
            <div key={item.q} className="faq-entry">
              <h3 className="faq-eq">{item.q}</h3>
              <p className="faq-ea">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
