import CircularSplitRoll, { type CircularSplitRollItem } from "@/components/ui/circular-split-roll";
import { SwipeCards } from "@/components/ui/image-stack-carousel";
import { stocklist } from "@/lib/stocklist";

/* Up close (2026-09-27, Brad: the 21st.dev Circular Split Roll, "only an
 * image of the material, and then a little line like 'velvet'"). Seven
 * fabric close-ups, each named by its material only, rolling past as the
 * page scrolls on a desktop. Phones and tablets get the 21st.dev Image
 * Stack Carousel instead (Brad, same day: the grid "is not good" on a
 * phone): the seven in a pile, swiped or tapped to the back, the front
 * one's name under it. Under reduced motion, a plain grid of the same. It replaced the sticky swing-tag version
 * (StickyContentWrapper, kept in components/ui).
 *
 * Every close-up is a Higgsfield macro generated from that piece's own
 * product photograph (assets/fabric, 2026-09-24), so each name is the
 * material of a real piece in her stock; the alt text says whose. Squares
 * cut from assets/fabric at 640px into public/img/fabric/roll. A fabric
 * whose piece has left the stocklist drops out. */

const FABRICS = [
  { id: "velvet", title: "Velvet", slug: "leopard-embroidered-velvet-bomber" },
  { id: "boucle", title: "Bouclé", slug: "cosy-hooded-boucle-coat" },
  { id: "fairisle", title: "Jacquard knit", slug: "fair-isle-jumper" },
  { id: "lace", title: "Lace", slug: "lace-blouse-with-layered-ruffle" },
  { id: "tweed", title: "Tweed check", slug: "check-tweed-shirt" },
  { id: "knit", title: "Chunky knit", slug: "chunky-knit-flower-cardigan" },
  { id: "velour", title: "Velour", slug: "velour-lounge-set" },
];

const ITEMS: CircularSplitRollItem[] = FABRICS.flatMap((f) => {
  const piece = stocklist.find((p) => p.slug === f.slug);
  return piece
    ? [{ id: f.id, title: f.title, avif: `/img/fabric/roll/${f.id}.avif`, webp: `/img/fabric/roll/${f.id}.webp`, alt: `Close-up of the ${f.title.toLowerCase()} of the ${piece.name}` }]
    : [];
});

/* Five on phones (Brad, 2026-09-27: seven "takes too long swiping"); the
   desktop roll keeps all seven. Tweed check and velour are the two left out:
   the five kept are the most different from one another. */
const PHONE = ITEMS.filter((i) => ["velvet", "boucle", "fairisle", "lace", "knit"].includes(i.id));

export function UpClose() {
  return (
    <section id="up-close" className="uc3" aria-labelledby="uc-h">
      <div className="uc3-head">
        <p className="label uc3-eyebrow">Up close</p>
        <h2 id="uc-h" className="uc3-h">Made to be <em>touched.</em></h2>
      </div>
      <CircularSplitRoll items={ITEMS} cardSize={280} />
      <div className="uc3-stack">
        <SwipeCards cards={PHONE} />
        <p className="uc3-hint" aria-hidden="true">Swipe or tap</p>
      </div>
    </section>
  );
}
