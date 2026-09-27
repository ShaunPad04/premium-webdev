/* The site's one font (Hanken Grotesk) has no arrow glyphs, so a text arrow
   fell back to Arial. Drawn instead, sized to the text it sits in. */
export function Arrow({ up = false }: { up?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="0.9em" height="0.9em" aria-hidden="true" focusable="false" style={{ display: "inline-block", verticalAlign: "-0.1em", transform: up ? "rotate(-90deg)" : undefined }}>
      <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
