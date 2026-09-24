import { isBuyable, products } from "@/lib/catalogue";
import { newIn } from "@/lib/shop";
import { CollectionSurfer, type CollectionItem } from "@/components/ui/collection-surfer";

/* Step inside, as a CollectionSurfer (2026-09-24, Brad, from 21st.dev; see
 * components/ui/collection-surfer.tsx for what was adapted). It replaced the
 * stacked shop photographs.
 *
 * The pieces are her real stock, each a link to its page, and deliberately
 * NOT the ones in New In: the two sections sit near each other and showing
 * the same garments twice is what retired the statement pieces. Categories
 * are taken in turn so the run is a cross-section of the shop rather than
 * ten jumpers. Deterministic, so screenshots stay comparable. The count in
 * the heading is every piece that can be bought today, from the catalogue. */
const inNewIn = new Set(newIn.map((n) => n.slug));
const pool = products.filter((p) => isBuyable(p) && !inNewIn.has(p.slug));

const byCat = new Map<string, typeof pool>();
for (const p of pool) byCat.set(p.category, [...(byCat.get(p.category) ?? []), p]);
const ITEMS: CollectionItem[] = [];
while (ITEMS.length < 10 && [...byCat.values()].some((l) => l.length)) {
  for (const list of byCat.values()) {
    const p = list.shift();
    if (p && ITEMS.length < 10) {
      ITEMS.push({ slug: p.slug, name: p.name, category: p.category, photo: p.photo, square: p.category === "Homeware" });
    }
  }
}

const TOTAL = products.filter(isBuyable).length;

export function StepInside() {
  if (ITEMS.length < 3) return null;
  return (
    <section aria-labelledby="si-h" className="si-surf">
      <CollectionSurfer
        items={ITEMS}
        variant="magnetic"
        eyebrow="Step inside"
        title={<>More from <em>the rails</em></>}
        count={TOTAL}
        headingId="si-h"
      />
    </section>
  );
}
