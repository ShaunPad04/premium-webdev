"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/* One colour selection, shared by the photograph and the buy panel.
 *
 * ── Why this exists ─────────────────────────────────────────────────────
 * The colour control and the picture it changes are in different columns of
 * the product page, and for a few hours they were different components with
 * different state: swatches over the photograph that moved the photograph,
 * and a Colour radio group beside the size that decided what went in the bag.
 * Two controls for one decision, capable of disagreeing — you could be
 * looking at the camel coat with burgundy in the bag.
 *
 * The client asked for the selector to sit "near the sizing like an ecommerce
 * store... and when you click the other colour the other image which
 * correlates to the colour they chose comes up", which is the same thing said
 * from the other side: ONE control, and the image follows it.
 *
 * So the state is lifted here. The swatch row over the photograph is gone —
 * the radio group beside the size is the control, and the photograph is an
 * output of it.
 *
 * ── Why context rather than props ───────────────────────────────────────
 * The provider wraps the whole section so a SERVER-rendered page can sit
 * between the two consumers. Passing a prop down would mean making the
 * product page, the body column and everything in them client components to
 * carry a string past them. This way exactly two leaves are client: the
 * gallery and the buy panel.
 *
 * ── null is a real value and is not "the first colour" ──────────────────
 * On a piece with several colourways nothing is selected to begin with,
 * deliberately: presenting a default choice as though the customer made it is
 * how somebody ends up with the wrong coat. The GALLERY still has to show
 * something, so it falls back to the first frame for display only — see
 * `index`. The bag reads `colour`, which is still null until a person picks,
 * and AddToBag refuses to add without one.
 */

type ColourState = {
  /** What the customer has chosen. null = not chosen yet. */
  colour: string | null;
  setColour: (c: string | null) => void;
  /** Which frame to SHOW. Falls back to 0 while nothing is chosen. */
  index: number;
};

const Ctx = createContext<ColourState | null>(null);

export function ColourProvider({
  colours,
  children,
}: {
  colours: readonly string[];
  children: ReactNode;
}) {
  /* A piece with one colourway has nothing to choose, so that colour is
     selected from the start — it is a fact about the garment rather than a
     question, and AddToBag states it instead of asking. */
  const [colour, setColour] = useState<string | null>(
    colours.length === 1 ? colours[0] : null,
  );

  const value = useMemo<ColourState>(() => {
    const i = colour === null ? -1 : colours.indexOf(colour);
    return { colour, setColour, index: i < 0 ? 0 : i };
  }, [colour, colours]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Throws rather than returning a default. A consumer rendered outside the
 *  provider would silently stop sharing the selection, which is exactly the
 *  bug this file was written to remove — better to fail the build's first
 *  render than to ship two controls that disagree again. */
export function useColour(): ColourState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useColour must be used inside <ColourProvider>");
  return v;
}
