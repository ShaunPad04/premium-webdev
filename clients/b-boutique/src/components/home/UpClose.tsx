import { UpCloseGallery, type Fabric } from "@/components/home/UpCloseGallery";
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

const FABRICS = [
  { id: "velvet", title: "Velvet", slug: "leopard-embroidered-velvet-bomber", src: "velvet-wide-2400" },
  { id: "boucle", title: "Bouclé", slug: "cosy-hooded-boucle-coat", src: "boucle-wide-2400" },
  { id: "fairisle", title: "Jacquard knit", slug: "fair-isle-jumper", src: "fairisle-wide-2400" },
  { id: "lace", title: "Lace", slug: "lace-blouse-with-layered-ruffle", src: "lace-2000" },
  { id: "tweed", title: "Tweed check", slug: "check-tweed-shirt", src: "tweed-2000" },
  { id: "knit", title: "Chunky knit", slug: "chunky-knit-flower-cardigan", src: "knit-2000" },
  { id: "velour", title: "Velour", slug: "velour-lounge-set", src: "velour-2000" },
];

const ITEMS: Fabric[] = FABRICS.flatMap((f) => {
  const piece = stocklist.find((p) => p.slug === f.slug);
  return piece
    ? [{ id: f.id, title: f.title, slug: f.slug, piece: piece.name, src: `/img/fabric/${f.src}.webp`, alt: `Close-up of the ${f.title.toLowerCase()} of the ${piece.name}` }]
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
