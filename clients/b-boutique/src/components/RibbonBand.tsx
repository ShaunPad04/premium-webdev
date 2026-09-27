import { InfiniteRibbon } from "@/components/ui/infinite-ribbon";
import { openingSummary, shop } from "@/lib/shop";

/* The /contact ribbons, between the form and the map (2026-09-27: Brad
 * picked two crossing ribbons over the curved band and a scroll marquee).
 * CSS only, so this renders on the server and ships no JavaScript.
 *
 * Every word is derived: street, town and hours from shop.ts, the rest is the
 * shop describing what it sells. aria-hidden: the Visit section directly
 * below says all of it as real text, and a screen reader would otherwise hear
 * the address twice, as a run-on of bullets. Reduced motion: the ribbons
 * stand still (infinite-ribbon's CSS). */
export function RibbonBand() {
  const line = [shop.street, shop.town, openingSummary().replace(/\.$/, ""), "Womenswear & homeware", "Come and say hello"]
    .join("  ·  ")
    .toUpperCase();

  return (
    <div className="rb-ribbons" aria-hidden="true">
      <InfiniteRibbon className="rb-ribbon rb-ribbon--back" duration={48} rotation={4}>
        {`${line}  ·`}
      </InfiniteRibbon>
      <InfiniteRibbon className="rb-ribbon" duration={48} reverse rotation={-4}>
        {`${line}  ·`}
      </InfiniteRibbon>
    </div>
  );
}
