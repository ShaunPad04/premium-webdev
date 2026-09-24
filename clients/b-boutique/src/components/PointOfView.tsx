import { philosophy } from "@/lib/about";
import TextRevealScroll from "@/components/TextRevealScroll";

/* One definition of the approved sentence and its annotation, imported here
   and by the About page. They used to be two copies of the same signed-off
   words, which is one edit away from disagreeing. */
const SECONDARY = philosophy.lines;

/* Our philosophy.
 *
 * A server component; the one client piece is the TextRevealScroll inside
 * the heading, which lights the sentence word by word on scroll.
 *
 * The copy is sentence case in the markup and uppercased in CSS. A screen
 * reader given literal caps can fall back to spelling words out; the visual
 * result is identical either way, so the markup carries the readable form.
 *
 * The line breaks are NOT authored. The heading wraps at whatever the width
 * gives it, and each word lights on its own timeline wherever it lands — the
 * same decision made for the hero copy, for the same reason: hard-coded
 * breaks are wrong at every width except the one they were measured at.
 *
 * An earlier 165vh sticky section lit the statement word by word; it was a
 * lot of viewport for one sentence. The 2026-09-23 fade-in keeps the effect
 * the client asked for without the pin: the page scrolls normally. */
export function PointOfView() {
  return (
    <section
      id="our-story"
      aria-labelledby="pov-heading"
      className="pov"
    >
      <div className="pov-inner">
        <div>
          <p className="pov-eyebrow">Our philosophy</p>
          {/* Word-by-word reveal on scroll (TextRevealScroll, Brad,
              2026-09-24; it replaced the CSS .pov-w view timeline). Only the
              words are wrapped: the quote marks are ::before/::after on the
              outer span and stay put. dimOpacity 0, not 0.15: a word waiting
              at 15% is pale grey on white and fails contrast (axe, serious,
              all three widths); an invisible one is not yet on the page.
              The heading's name is the plain sentence; reduced motion shows
              the whole sentence at once. */}
          <h2 id="pov-heading" className="pov-statement" aria-label={philosophy.statement}>
            <span aria-hidden="true">
              <TextRevealScroll as="span" by="words" dimOpacity={0}>
                {philosophy.statement}
              </TextRevealScroll>
            </span>
          </h2>
        </div>

        {/* An editorial annotation, not a card: a hairline and four lines of
            small caps hanging off it. */}
        <div className="pov-note" aria-hidden="false">
          <span className="pov-rule" aria-hidden="true" />
          <p className="pov-note-text">
            {SECONDARY.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
