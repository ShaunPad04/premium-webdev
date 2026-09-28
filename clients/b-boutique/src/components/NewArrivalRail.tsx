import { philosophy } from "@/lib/about";
import { ScrollVelocityRow } from "@/components/Deferred";

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
/* 2026-09-26, Brad (idea A): the philosophy section left the home page and
   its approved sentence (lib/about.ts) runs here in place of NEW ARRIVAL. */
const WORDS = [philosophy.statement.replace(/\.$/, ""), "One of one", "Cleethorpes"];
/* 2026-09-27, Brad: the 21st.dev Scroll Velocity Text drives it now. It
   drifts left on its own, speeds up with the scroll and turns round when the
   reader scrolls back up; it copies the one set to fill the band, so the old
   four repeats and the doubled CSS track are gone. It stands still under reduced
   motion. */
export function NewArrivalRail() {
  return (
    <div className="stmt-rail arr-rail" aria-hidden="true">
      <div className="stmt-viewport">
        <ScrollVelocityRow baseVelocity={6} direction={1}>
          {WORDS.map((w) => (
            <span key={w} className="stmt-item">
              <span className="stmt-text">{w}</span>
              <span className="arr-dot" />
            </span>
          ))}
        </ScrollVelocityRow>
      </div>
    </div>
  );
}
