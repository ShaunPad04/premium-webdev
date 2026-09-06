import { categories, featured, newIn } from "./shop";

/** What the category pages show, derived rather than re-typed.
 *
 *  Names and notes come out of `categories` in shop.ts by slug, so renaming a
 *  category in one place renames it on the page too and the two cannot end up
 *  disagreeing. Only the photograph is decided here.
 *
 *  Photographs: the four that have an approved model shot use it — those are
 *  the `featured` files, the strongest images in the project. Tops has no
 *  model shot, so it uses the garment photograph from the New In set, which
 *  came out of the same shoot. Nothing is generated for this page. */
export type CategoryCard = {
  slug: string;
  name: string;
  note: string;
  /** A path under /img for an approved model shot… */
  image?: string;
  alt?: string;
  /** …or a slot key for the shared ImageSlot, which carries its own designed
   *  fallback when the photograph is missing. */
  slot?: string;
};

function byName(slug: string) {
  const c = categories.find((x) => x.slug === slug);
  if (!c) throw new Error(`Unknown category slug: ${slug}`);
  return c;
}

function fromFeatured(slug: string): CategoryCard {
  const c = byName(slug);
  const f = featured.find((x) => x.slug === slug);
  return { slug, name: c.name, note: c.note, image: f?.image, alt: f?.alt };
}

/** The five clothing categories, in the order the rails run.
 *  Accessories and Homeware are deliberately absent — each has its own place
 *  on the site, and a "clothing" page that lists candles is not a clothing
 *  page. */
export const clothingCards: CategoryCard[] = [
  fromFeatured("jackets"),
  fromFeatured("trousers"),
  fromFeatured("dresses"),
  {
    ...byName("tops"),
    slug: "tops",
    slot: "new-cotton-tee",
  },
  fromFeatured("knitwear"),
];

export const accessoriesCard: CategoryCard = fromFeatured("accessories");

/** New In, filtered to a set of categories.
 *
 *  The same nine pieces the home page rail carries — this is the one list of
 *  real stock in the project and there is no second one. Prices are absent
 *  here for the same reason they are absent there: none are known, the shop
 *  sells in person, and stock turns faster than a page does. */
export function newInFor(categoryNames: readonly string[]) {
  return newIn.filter((p) => categoryNames.includes(p.category));
}

export const CLOTHING_CATEGORY_NAMES = [
  "Jackets",
  "Trousers",
  "Dresses",
  "Tops",
  "Knitwear",
] as const;
