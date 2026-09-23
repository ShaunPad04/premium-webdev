/* A word that flips on hover (2026-09-23, after the Arike Framer site Brad
 * pointed at): the text sits on the front of a thin 3D cube; on hover of the
 * nearest `.flip-host` (or the flip itself) the cube turns up and a copy on
 * its lower face rotates into place. CSS only, no JavaScript. The copy is
 * aria-hidden, so the label is read once. Reduced motion: no turn. */
export function FlipText({ children }: { children: string }) {
  return (
    <span className="flip">
      <span className="flip-cube">
        <span className="flip-front">{children}</span>
        <span className="flip-back" aria-hidden="true">
          {children}
        </span>
      </span>
    </span>
  );
}
