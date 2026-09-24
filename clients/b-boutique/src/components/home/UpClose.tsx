import { VerticalImageStack, type StackItem } from "@/components/ui/vertical-image-stack";

/* Up close (2026-09-24, Brad: the full-screen zoom "looks wrong"; he chose
 * the 21st.dev vertical image stack). An editorial intro on the left, the
 * seven fabric close-ups as a stack on the right that turns over as the
 * page scrolls through the section. Each card names the fabric and the
 * piece it comes from and links to that piece.
 *
 * The close-ups are generated texture studies of each piece's fabric
 * (assets/fabric); the alt text says whose fabric, not that it is a
 * photograph of the garment. */
const FRAMES = [
  { src: "knit", slug: "chunky-knit-flower-cardigan", piece: "Chunky Knit Flower Cardigan", fabric: "Hand-knit, embroidered" },
  { src: "boucle", slug: "cosy-hooded-boucle-coat", piece: "Cosy Hooded Boucle Coat", fabric: "Soft curly boucle" },
  { src: "fairisle", slug: "fair-isle-jumper", piece: "Fair Isle Jumper", fabric: "Knitted-in jacquard" },
  { src: "tweed", slug: "check-tweed-shirt", piece: "Check Tweed Shirt", fabric: "Brushed woven check" },
  { src: "velvet", slug: "leopard-embroidered-velvet-bomber", piece: "Leopard Embroidered Velvet Bomber", fabric: "Velvet, metallic embroidery" },
  { src: "lace", slug: "lace-blouse-with-layered-ruffle", piece: "Lace Blouse With Layered Ruffle", fabric: "Lace, layered ruffle" },
  { src: "velour", slug: "velour-lounge-set", piece: "Velour Lounge Set", fabric: "Short plush velour" },
];

const ITEMS: StackItem[] = FRAMES.map((f) => ({
  id: f.src,
  sources: [
    { type: "image/avif", srcSet: `/img/fabric/${f.src}-1000.avif 1000w, /img/fabric/${f.src}-2000.avif 2000w` },
    { type: "image/webp", srcSet: `/img/fabric/${f.src}-1000.webp 1000w, /img/fabric/${f.src}-2000.webp 2000w` },
  ],
  fallback: `/img/fabric/${f.src}-1000.jpg`,
  alt: `Close-up of the fabric of the ${f.piece}`,
  title: f.fabric,
  sub: f.piece,
  href: `/shop/${f.slug}`,
}));

export function UpClose() {
  return (
    <section className="ucs" aria-labelledby="uc-h">
      <VerticalImageStack items={ITEMS}>
        <div className="ucs-intro">
          <p className="label ucs-eyebrow">Up close</p>
          <h2 id="uc-h" className="ucs-h">Made to be <em>touched.</em></h2>
          <p className="ucs-p">
            Soft curly boucle, a knitted-in jacquard yoke, velvet with metallic
            embroidery. Carefully selected pieces that are stylish, affordable
            and made to be touched, so come in and feel them.
          </p>
        </div>
      </VerticalImageStack>
    </section>
  );
}
