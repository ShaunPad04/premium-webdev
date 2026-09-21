import { statements } from "@/lib/statements";

/* The thin band directly under the hero — one breath between the photograph
 * and the editorial statement.
 *
 * ── What this replaces ────────────────────────────────────────────────────
 * A marquee of eight brand logos. The logos are gone because the shop does
 * not stock those labels; the full account is at the top of lib/statements.ts
 * and it is a correctness matter rather than a design one.
 *
 * The MARQUEE itself was never the problem and is kept exactly as it was: the
 * same 38s linear pass, the same doubled track translating by -50% so copy
 * two lands precisely where copy one began and the loop has no seam to hide,
 * the same narrow edge masks so items arrive and leave rather than being
 * clipped, and the same reduced-motion behaviour — the band stops and becomes
 * an ordinary scrollable row with everything still readable.
 *
 * The classes were renamed brand-* to stmt-* rather than left alone. A band
 * called `brand-rail` that contains no brands is the exact drift this project
 * keeps being caught by, and the next person to read the stylesheet would
 * have gone looking for logos.
 *
 * ── Words, not artwork ────────────────────────────────────────────────────
 * The logo version needed per-mark measured ink bounds, CSS masks and six
 * custom properties each to sit on one optical axis. Text has a baseline
 * already, so all of that is gone with it — the item is a span, and the
 * separator is the same em dash the old rail used between marks.
 *
 * The second copy is aria-hidden, so the row is announced once. */
export function StatementRail() {
  const items = statements.map((text) => (
    <span key={text} className="stmt-item">
      <span className="stmt-text">{text}</span>
      <span className="stmt-sep" aria-hidden="true">
        &mdash;
      </span>
    </span>
  ));

  return (
    /* No id. It used to be `#brands`, and two navigation entries pointed at
       it; both are gone, because offering a customer "Brands" and landing
       them on a band that names none is a broken promise in the menu. */
    <section aria-labelledby="stmt-heading" className="stmt-rail">
      <h2 id="stmt-heading" className="sr-only">
        About the shop
      </h2>
      <div className="stmt-viewport">
        <div className="stmt-track">
          <div className="stmt-set">{items}</div>
          <div className="stmt-set" aria-hidden="true">
            {items}
          </div>
        </div>
      </div>
    </section>
  );
}
