import { philosophy } from "@/lib/about";

/* One definition of the approved sentence and its annotation, imported here
   and by the About page. They used to be two copies of the same signed-off
   words, which is one edit away from disagreeing. */
const SECONDARY = philosophy.lines;

/* Our philosophy.
 *
 * A server component. It renders the finished sentence as plain HTML; the
 * scroll-linked word reveal is CSS alone (see .pov-w), so no JavaScript is
 * required to read it, there is nothing to hydrate and no chance of a
 * server/client mismatch. With reduced motion, or in a browser without view
 * timelines, the statement is simply there.
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
          {/* Scroll-driven (2026-09-23, client): each word fades in as it
              rises into view, on phones and desktops alike. Pure CSS on a view timeline, so it costs no JavaScript
              and cannot fight React for the DOM (the SplitText version that
              lived here did both). The heading's name is the plain sentence;
              the word spans are hidden from assistive technology. Where view
              timelines are not supported, or motion is reduced, the words
              are simply at full strength. */}
          <h2 id="pov-heading" className="pov-statement" aria-label={philosophy.statement}>
            <span aria-hidden="true">
              {philosophy.statement.split(/\s+/).map((w, i, all) => (
                <span key={i}>
                  <span className="pov-w">{w}</span>
                  {i < all.length - 1 ? " " : null}
                </span>
              ))}
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
