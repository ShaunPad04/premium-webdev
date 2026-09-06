import { philosophy } from "@/lib/about";

/* One definition of the approved sentence and its annotation, imported here
   and by the About page. They used to be two copies of the same signed-off
   words, which is one edit away from disagreeing. */
const SECONDARY = philosophy.lines;

/* Our philosophy.
 *
 * A server component. It renders the finished sentence as plain HTML and
 * nothing else; the masked line reveal is layered on afterwards by
 * PremiumMotion, which means no JavaScript is required to read it, there is
 * nothing to hydrate and no chance of a server/client mismatch. With JS off,
 * with reduced motion, or before the script arrives, the statement is simply
 * there.
 *
 * The copy is sentence case in the markup and uppercased in CSS. A screen
 * reader given literal caps can fall back to spelling words out; the visual
 * result is identical either way, so the markup carries the readable form.
 *
 * The line breaks are NOT authored. The heading wraps at whatever the width
 * gives it and the reveal splits on the lines that actually rendered — the
 * same decision made for the hero copy, for the same reason: hard-coded
 * breaks are wrong at every width except the one they were measured at.
 *
 * This replaces a 165vh sticky section that lit the statement word by word as
 * you scrolled. It was a lot of viewport for one sentence, and the brief asks
 * for a controlled block rather than a chapter of empty scrolling. */
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
          <h2 id="pov-heading" data-lines className="pov-statement">
            {philosophy.statement}
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
