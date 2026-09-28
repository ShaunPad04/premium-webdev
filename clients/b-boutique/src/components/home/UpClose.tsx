import { UpCloseGallery, type Fabric, type FabricSource } from "@/components/home/UpCloseGallery";
import { stocklist } from "@/lib/stocklist";

/* Up close (2026-09-27, Brad: "only an image of the material, and then a
 * little line like 'velvet'"). Seven fabric close-ups, each named by its
 * material only. Since later the same day the 21st.dev "Scroll Gallery"
 * (soralabs), Brad's pick of three scroll effects (B Stacking Cards,
 * C Immersive Scroll Gallery): pinned full-bleed, each fabric wiping up over
 * the last as the page scrolls (UpCloseGallery.tsx). It replaced the
 * Circular Split Roll on desktop and the swipe pile on phones; both
 * components are kept in components/ui.
 *
 * Every close-up is a Higgsfield macro generated from that piece's own
 * product photograph (assets/fabric, 2026-09-24), so each name is the
 * material of a real piece in her stock; the alt text says whose. A fabric
 * whose piece has left the stocklist drops out. */

/* `wide`: the fabric has wide (1600/2400/3200) and portrait (800/1200/1800)
   builds; the others are square-ish builds at 1000/2000 (and 3000 for knit). */
const FABRICS = [
  { id: "velvet", title: "Velvet", slug: "leopard-embroidered-velvet-bomber", base: "velvet", wide: true },
  { id: "boucle", title: "Bouclé", slug: "cosy-hooded-boucle-coat", base: "boucle", wide: true },
  { id: "fairisle", title: "Jacquard knit", slug: "fair-isle-jumper", base: "fairisle", wide: true },
  { id: "lace", title: "Lace", slug: "lace-blouse-with-layered-ruffle", base: "lace", wide: false },
  { id: "tweed", title: "Tweed check", slug: "check-tweed-shirt", base: "tweed", wide: false },
  { id: "knit", title: "Chunky knit", slug: "chunky-knit-flower-cardigan", base: "knit", wide: false },
  { id: "velour", title: "Velour", slug: "velour-lounge-set", base: "velour", wide: false },
];

const set = (names: string[], ext: string) =>
  names.map((n) => `/img/fabric/${n}.${ext} ${n.match(/(\d+)$/)![1]}w`).join(", ");

function sourcesFor(base: string, wide: boolean): { src: string; sources: FabricSource[] } {
  if (wide) {
    const tall = [800, 1200, 1800].map((w) => `${base}-tall-${w}`);
    const land = [1600, 2400, 3200].map((w) => `${base}-wide-${w}`);
    return {
      src: `/img/fabric/${base}-wide-2400.webp`,
      sources: [
        { media: "(orientation: portrait)", type: "image/avif", srcSet: set(tall, "avif") },
        { media: "(orientation: portrait)", type: "image/webp", srcSet: set(tall, "webp") },
        { type: "image/avif", srcSet: set(land, "avif") },
        { type: "image/webp", srcSet: set(land, "webp") },
      ],
    };
  }
  const sizes = base === "knit" ? [1000, 2000, 3000] : [1000, 2000];
  const names = sizes.map((w) => `${base}-${w}`);
  return {
    src: `/img/fabric/${base}-2000.webp`,
    sources: [
      { type: "image/avif", srcSet: set(names, "avif") },
      { type: "image/webp", srcSet: set(names, "webp") },
    ],
  };
}

const ITEMS: Fabric[] = FABRICS.flatMap((f) => {
  const piece = stocklist.find((p) => p.slug === f.slug);
  return piece
    ? [{ id: f.id, title: f.title, slug: f.slug, piece: piece.name, ...sourcesFor(f.base, f.wide), alt: `Close-up of the ${f.title.toLowerCase()} of the ${piece.name}` }]
    : [];
});

export function UpClose() {
  return (
    <section id="up-close" className="uc3" aria-labelledby="uc-h">
      <div className="uc3-head">
        <p className="label uc3-eyebrow">Up close</p>
        <h2 id="uc-h" className="uc3-h">Made to be <em>touched</em></h2>
      </div>
      <UpCloseGallery items={ITEMS} />
    </section>
  );
}
