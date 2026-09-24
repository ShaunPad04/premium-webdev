/* The Edit: three looks built from real pieces (2026-09-24, Brad).
 *
 * The photographs are GENERATED (Higgsfield seedream_v4_5, basic quality)
 * from the shop's own product photographs as references. They show real
 * pieces on a model who is not a real customer, in places that are not the
 * shop. So they are drafts: they render on previews only (lib/drafts.ts)
 * and carry a flag until Hayley approves each image as a fair picture of
 * her stock.
 * CLIENT INPUT REQUIRED: Hayley to approve each look image, or supply her
 * own styled photographs. Known differences from the real pieces: the
 * trench is drawn a little shorter than hip length and without its belt;
 * the restaurant fascia in "dinner" has indistinct lettering. Sources in
 * assets/edit/.
 *
 * `pieces` are slugs from lib/stocklist.ts; names and prices are read from
 * there at build time, so a look can never show a price the checkout does
 * not charge. `at` places each numbered hotspot on the photograph, as a
 * percentage from the top-left, over the garment it names. */

export type Look = {
  id: string;
  title: string;
  image: string;
  alt: string;
  pieces: { slug: string; at: [number, number] }[];
};

export const looks: Look[] = [
  {
    id: "seafront",
    title: "Saturday on the seafront",
    image: "seafront",
    alt: "A woman on the promenade in the Short Trench Coat, Striped Asymmetric Knit Top and Jean Jogger",
    pieces: [
      { slug: "short-trench-coat", at: [36, 34] },
      { slug: "striped-asymmetric-knit-top", at: [52, 30] },
      { slug: "jean-jogger", at: [51, 64] },
    ],
  },
  {
    id: "dinner",
    title: "Dinner in town",
    image: "dinner",
    alt: "A woman outside a restaurant in the Leopard Embroidered Velvet Bomber, Lace Blouse and Pleated Barrel Trouser",
    pieces: [
      { slug: "leopard-embroidered-velvet-bomber", at: [36, 40] },
      { slug: "lace-blouse-with-layered-ruffle", at: [50, 27] },
      { slug: "pleated-barrel-trouser", at: [50, 67] },
    ],
  },
  {
    id: "home",
    title: "Cosy at home",
    image: "home",
    alt: "A woman at home in the Velour Lounge Set with the Chunky Knit Flower Cardigan over it",
    pieces: [
      { slug: "chunky-knit-flower-cardigan", at: [70, 34] },
      { slug: "velour-lounge-set", at: [40, 66] },
    ],
  },
];
