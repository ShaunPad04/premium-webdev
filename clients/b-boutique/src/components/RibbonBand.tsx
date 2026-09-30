import { CurvedLoop } from "@/components/ui/curved-text-loop";
import { openingSummary, shop } from "@/lib/shop";

/* The /contact band, between the form and the map. Since 2026-09-29 the
 * 21st.dev Curved Text Loop (Brad), in place of two crossing ribbons
 * (ui/infinite-ribbon.tsx, kept) and, briefly, a perspective marquee
 * (ui/perspective-marquee.tsx, kept).
 *
 * Every word is derived: street, town and hours from shop.ts, the rest is the
 * shop describing what it sells. aria-hidden: the Visit section directly
 * below says all of it as real text. The separator is the middle dot the
 * site uses elsewhere: Hanken's bullet is square. */
export function RibbonBand() {
  const line = [shop.street, shop.town, openingSummary().replace(/\.$/, ""), "Womenswear & homeware", "Come and say hello"]
    .join("  ·  ")
    .toUpperCase();
  return (
    <div className="rb-curve" aria-hidden="true">
      <CurvedLoop marqueeText={`${line}  ·  `} speed={1.2} curveAmount={160} direction="left" className="rb-curve-text" />
    </div>
  );
}
