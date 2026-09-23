/* The band under the hero since 2026-09-23 (Brad's reference): NEW ARRIVAL
 * in the hero's Anton caps, white on black, a red dot between each, moving.
 *
 * It replaced StatementRail. The marquee mechanics are that band's, reused
 * as they were (the stmt-* track, its seamless -50% loop, its edge fades and
 * its reduced-motion fallback); only the type and the separator are new.
 *
 * It says one thing over and over, so it is decorative: the whole band is
 * hidden from assistive technology rather than announcing "new arrival"
 * sixteen times. New In, directly below the fold, carries the real list. */
const REPEAT = 8;

export function NewArrivalRail() {
  const items = Array.from({ length: REPEAT }, (_, i) => (
    <span key={i} className="stmt-item">
      <span className="stmt-text">New arrival</span>
      <span className="arr-dot" />
    </span>
  ));

  return (
    <div className="stmt-rail arr-rail" aria-hidden="true">
      <div className="stmt-viewport">
        <div className="stmt-track">
          <div className="stmt-set">{items}</div>
          <div className="stmt-set">{items}</div>
        </div>
      </div>
    </div>
  );
}
