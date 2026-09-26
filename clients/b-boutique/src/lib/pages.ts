import { products, productsIn } from "./catalogue";
import { categories, newIn } from "./shop";

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

/** A category card carrying a real photograph of something actually in that
 *  category.
 *
 *  ── What this replaced, and why it is an improvement rather than a swap ──
 *  These cards used to be `featured` model shots for four categories and
 *  generated `panel-*` artwork for the other four. The panels were a known
 *  defect, recorded in lib/images.ts and never fixed: they were generated as
 *  fake magazine spreads carrying GIBBERISH TYPOGRAPHY, and two of the four
 *  have MALFORMED HANDS. They were rendering anyway, from the CDN, because
 *  not vendoring a file does not stop a page requesting it.
 *
 *  There is now something better to put there: 54 photographs of the actual
 *  stock. A card for Knitwear showing a jumper she actually has is both more
 *  honest and a better picture than an invented magazine spread with broken
 *  lettering on it.
 *
 *  The photograph is the first piece in the category, which is stable because
 *  the stock list has a fixed order. It is decorative — the category name is
 *  real text beside it — so it carries no alt text and makes no claim about
 *  the individual garment. */
function fromStock(slug: string): CategoryCard {
  const c = byName(slug);
  const first = productsIn(c.name)[0];
  if (!first) {
    throw new Error(
      `${slug}: no products in "${c.name}" — a category rail with nothing ` +
        `behind it must not be rendered; remove it from the categories list instead`,
    );
  }
  return {
    slug,
    name: c.name,
    note: c.note,
    image: `/img/product/${first.photo}-960.webp`,
    alt: "",
  };
}

/** The clothing categories, in the order the rails run.
 *
 *  Homeware is deliberately absent: a "clothing" page that lists ceramic
 *  vases is not a clothing page. It has its own section on the home page.
 *
 *  Accessories used to be excluded here for the same reason and is now
 *  absent for a different one — there are none in this drop. See the note on
 *  `categories` in shop.ts. */
export const clothingCards: CategoryCard[] = [
  "knitwear",
  "coats-jackets",
  "trousers",
  "tops",
  "skirts",
  "co-ords",
  "dresses",
].map(fromStock);

/** Category slugs this site used to have, and where they go now.
 *
 *  ── Why a redirect and not a 404 ────────────────────────────────────────
 *  These nine were live URLs. They were in the header menu on every page,
 *  they are in the sitemap of any crawl taken before 2026-09-22, and they are
 *  in anyone's bookmarks. When the taxonomy changed to follow the client's
 *  real stock they started returning 404, which is the worst outcome
 *  available: a customer who saved "coats" gets a dead end instead of the
 *  coats, which are still there under a different name.
 *
 *  So each one points at the nearest live category, or at /clothing when
 *  there is no honest nearest. `coats` and `jackets` both go to the rail that
 *  now holds both. `shirts` goes to Tops, which is where a lace blouse
 *  actually is. `denim` and `accessories` have no equivalent (`skirts` did too, until
 *  the tartan tie skirt arrived on 2026-09-25 and it became a live category) — this
 *  drop contains none — so they land on the full list rather than on a
 *  category that would be a lie about what is in it.
 *
 *  A 308 rather than a 307: this is permanent, and it passes the ranking of
 *  the old URL to the new one instead of asking a crawler to keep both. */
export const RETIRED_CATEGORIES: Record<string, string> = {
  jackets: "/clothing/coats-jackets",
  coats: "/clothing/coats-jackets",
  shirts: "/clothing/tops",
  denim: "/clothing/trousers",
  accessories: "/clothing",
  /* Homeware IS a live category with three pieces in it, and it deliberately
     has no /clothing page — a clothing page that lists ceramic vases is not a
     clothing page. That left /clothing/homeware returning a 404 for a slug
     that appears in `categories`: nothing on the site links to it, but it is
     a URL somebody can reach by editing the address bar or by following an
     old sitemap, and the client's rule is that nothing 404s. It went to the
     homeware section on the home page until 2026-09-22; it goes to the
     category's own page, /homeware, now that one exists. */
  homeware: "/homeware",
};

/** New In, filtered to a set of categories.
 *
 *  The same pieces the home page rail carries — this is the one list of stock
 *  in the project and there is no second one. Prices are absent
 *  here for the same reason they are absent there: none are known, the shop
 *  sells in person, and stock turns faster than a page does. */
export function newInFor(categoryNames: readonly string[]) {
  return newIn.filter((p) => categoryNames.includes(p.category));
}

/** Every clothing product, in catalogue order.
 *
 *  Added 2026-09-21, when /clothing stopped being a lookbook of nine large
 *  category photographs and became what the client asked for: the products.
 *
 *  Derived from the catalogue and the category list rather than hand-listed,
 *  so a product added to a clothing category appears here with no edit, and
 *  a category renamed in shop.ts cannot silently drop its stock out of this
 *  page. Accessories and Homeware fall out by not being in the list. */
export function clothingProducts() {
  /* From clothingCards, the same list the category bar counts from. It read
     a hand-typed CLOTHING_CATEGORY_NAMES until 2026-09-22 that still named
     "Jackets", "Coats", "Shirts", "Skirts" and "Denim" from the invented
     catalogue — so /clothing said "28 pieces" beside a bar reading
     "Everything 37", and every coat, jacket and co-ord was missing from it. */
  const names = clothingCards.map((c) => c.name);
  return products.filter((p) => names.includes(p.category));
}

/** How many pieces sit in each clothing category, for the category bar.
 *  A count beside a label is a promise the page then has to keep, so it is
 *  counted from the catalogue at render rather than written down. */
export function clothingCounts() {
  return clothingCards.map((c) => ({
    ...c,
    count: productsIn(c.name).length,
  }));
}

