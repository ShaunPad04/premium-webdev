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
/* 2026-09-24, Brad: three words now, NEW ARRIVAL · ONE OF ONE ·
   CLEETHORPES. "One of one" stands on the shop's own FAQ ("most pieces
   here are one of one"). */
/* 2026-09-24, Brad's rebuild: NEW IN · ONE OF ONE · SEA VIEW STREET,
   CLEETHORPES, and it pauses under the pointer (globals.css). */
const WORDS = ["New in", "One of one", "Sea View Street, Cleethorpes"];
const REPEAT = 4;

export function NewArrivalRail() {
  const items = Array.from({ length: REPEAT }).flatMap((_, i) =>
    WORDS.map((w) => (
      <span key={`${i}-${w}`} className="stmt-item">
        <span className="stmt-text">{w}</span>
        <span className="arr-dot" />
      </span>
    )),
  );

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
