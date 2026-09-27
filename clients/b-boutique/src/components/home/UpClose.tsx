import { StickyContentWrapper, type StickyContentItem } from "@/components/ui/sticky-content-wrapper";
import { stocklist } from "@/lib/stocklist";

/* Up close (2026-09-26, Brad: the 21st.dev sticky content component, three
 * fabrics instead of seven). Each fabric's close-up on one side; on the
 * other, the fabric: what it is and how to look after it, and a link to
 * the piece it comes from. No sizes or colours (Brad, 2026-09-26: the
 * material, not the listing). The words are the stocklist's own: the
 * material sentences lifted from each piece's description, and its care
 * line, so nothing here says more than the product page does.
 * The three are the ones the section has always named: boucle, the
 * knitted-in Fair Isle yoke and embroidered velvet. The vertical image stack
 * and the full-screen version it replaces are kept in components/ui.
 *
 * The close-ups are generated texture studies of each piece's fabric
 * (assets/fabric); the alt text says whose fabric, not that it is a
 * photograph of the garment. */
/* `material`: the material sentences of the piece's `full` description in
   lib/stocklist.ts, trimmed to the cloth. Change them there first. */
const FRAMES = [
  {
    short: "Boucle", src: "boucle", slug: "cosy-hooded-boucle-coat", fabric: "Soft curly boucle",
    material: "A warm brown boucle with a curly, textured surface, cut into a relaxed cocoon-shaped coat.",
  },
  {
    short: "Jacquard knit", src: "fairisle", slug: "fair-isle-jumper", fabric: "Knitted-in jacquard",
    material: "The Fair Isle pattern across the yoke is knitted in, not printed, so it keeps its definition wash after wash.",
  },
  {
    short: "Velvet", src: "velvet", slug: "leopard-embroidered-velvet-bomber", fabric: "Velvet, metallic embroidery",
    material: "Plush velvet, with running leopards embroidered across the front and down the sleeves in metallic gold and tan.",
  },
];

/* Laid out as a specimen (2026-09-27, Brad: "looks unfinished", "about 5
   different fonts"): a counter, the fabric's name, one sentence, then a
   ruled sheet with its care and the piece it is found in. No composition
   row: none of the three has a published fibre content (fabricPublished is
   false in the stocklist), and a percentage is not something to guess. */
const wide = (n: string, ext: string) => [1600, 2400, 3200].map((w) => `/img/fabric/${n}-wide-${w}.${ext} ${w}w`).join(", ");
const tall = (n: string, ext: string) => [800, 1200, 1800].map((w) => `/img/fabric/${n}-tall-${w}.${ext} ${w}w`).join(", ");

const LIVE = FRAMES.filter((f) => stocklist.some((x) => x.slug === f.slug));

const ITEMS: StickyContentItem[] = LIVE.map((f, i) => {
  const p = stocklist.find((x) => x.slug === f.slug)!;
  return {
    kicker: `${String(i + 1).padStart(2, "0")} / ${String(LIVE.length).padStart(2, "0")}`,
    heading: f.fabric,
    paragraphs: [f.material],
    specs: [
      ...(p.care ? [{ label: "Care", value: p.care }] : []),
      { label: "Found in", value: p.name, href: `/shop/${p.slug}`, srText: " (view the piece)" },
    ],
    /* 4K Higgsfield recreations of the earlier close-ups (2026-09-27, Brad:
       the old 1728px portraits were soft full-bleed): a tall 9:16 set for
       portrait screens and a wide 16:9 set for landscape ones, so neither
       is cropped out of the other. Built by scripts/build-fabric.py. */
    image: `/img/fabric/${f.src}-wide-1600.jpg`,
    sources: [
      { media: "(max-aspect-ratio: 1/1)", type: "image/avif", srcSet: tall(f.src, "avif"), sizes: "max(100vw, 56svh)" },
      { media: "(max-aspect-ratio: 1/1)", type: "image/webp", srcSet: tall(f.src, "webp"), sizes: "max(100vw, 56svh)" },
      { type: "image/avif", srcSet: wide(f.src, "avif") },
      { type: "image/webp", srcSet: wide(f.src, "webp") },
    ],
    alt: `Close-up of the fabric of the ${p.name}`,
  };
});

export function UpClose() {
  return (
    <StickyContentWrapper
      className="ucs2"
      items={ITEMS}
      index={LIVE.map((f) => f.short)}
      labelledBy="uc-h"
      /* The wide 16:9 set on landscape screens: drawn at the wider of the
         screen and 1.78 x its height. The tall set carries its own. */
      sizes="max(100vw, 178svh)"
      header={
        <>
          <p className="label ucs-eyebrow">Up close</p>
          <h2 id="uc-h" className="ucs-h">Made to be <em>touched.</em></h2>
        </>
      }
    />
  );
}
