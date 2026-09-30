import { UpCloseTilt } from "@/components/Deferred";
import type { Fabric } from "@/components/home/UpCloseTilt";
import { stocklist } from "@/lib/stocklist";

/* Up close (2026-09-27, Brad: "only an image of the material, and then a
 * little line like 'velvet'"). Eight fabric close-ups, each named by its
 * material only. Since 2026-09-28 a tilted two-column grid after the 21st.dev
 * "ScrollTiltedGrid" (UpCloseTilt.tsx), Brad's pick of three scroll-driven
 * directions. It replaced the pinned "Scroll Gallery" wipe
 * (UpCloseGallery.tsx), which is kept, as are the Circular Split Roll and the
 * swipe pile in components/ui.
 *
 * Every close-up is a Higgsfield macro generated from that piece's own
 * product photograph (assets/fabric, 2026-09-24), so each name is the
 * material of a real piece in her stock; the alt text says whose. A fabric
 * whose piece has left the stocklist drops out. */

/* Eight, so the two columns come out even (2026-09-28, Brad): Faux feather
   joined as the eighth. Names checked against each close-up and her own data
   the same day: "Jacquard knit" became "Fair Isle knit" (the pattern shown,
   and her piece's name) and "Lace" became "Lace & ruffle" (the card is mostly
   the ruffle). Each card is a 3:4 centre crop at 600/900/1200
   (scripts/build-fabric.py). */
const FABRICS = [
  { id: "velvet", title: "Velvet", slug: "leopard-embroidered-velvet-bomber" },
  { id: "boucle", title: "Bouclé", slug: "cosy-hooded-boucle-coat" },
  { id: "fairisle", title: "Fair Isle knit", slug: "fair-isle-jumper" },
  { id: "lace", title: "Lace & ruffle", slug: "lace-blouse-with-layered-ruffle" },
  { id: "tweed", title: "Tweed check", slug: "check-tweed-shirt" },
  { id: "knit", title: "Chunky knit", slug: "chunky-knit-flower-cardigan" },
  { id: "velour", title: "Velour", slug: "velour-lounge-set" },
  { id: "feather", title: "Faux feather", slug: "faux-feather-sleeveless-jumper" },
];

const set = (id: string, ext: string) => [600, 900, 1200].map((w) => `/img/fabric/${id}-card-${w}.${ext} ${w}w`).join(", ");

const ITEMS: Fabric[] = FABRICS.flatMap((f) => {
  const piece = stocklist.find((p) => p.slug === f.slug);
  return piece
    ? [{
        ...f,
        piece: piece.name,
        src: `/img/fabric/${f.id}-card-600.webp`,
        sources: [
          { type: "image/avif", srcSet: set(f.id, "avif") },
          { type: "image/webp", srcSet: set(f.id, "webp") },
        ],
        alt: `${f.title} close-up, from the ${piece.name}`,
      }]
    : [];
});

export function UpClose() {
  return (
    <section id="up-close" className="uc3" aria-labelledby="uc-h">
      <div className="uc3-head">
        <h2 id="uc-h" className="uc3-h">Made to be <em>touched</em></h2>
      </div>
      <UpCloseTilt items={ITEMS} />
    </section>
  );
}
