/* The About page's words.
 *
 * Rebuilt 2026-09-22 when the client said the page "looks like an FAQ page,
 * it's not, it's an about us page". It was three numbered rows — a label, a
 * question-shaped heading, an answer — which is exactly the anatomy of an
 * FAQ, and it sat under a heading reading "How it works."
 *
 * The words did not need replacing, only the shape. Every body line below is
 * hers or already approved:
 *   - "We try not to reorder items, so that we can keep the stock fresh and
 *     moving." — her form, 2026-09-22.
 *   - "You are welcome to browse at your own leisure." — her form, same day.
 *   - The first principle is the page's existing description of the shop,
 *     derived from shop.ts facts (street, town, what it sells).
 * The TITLES are ours — short editorial headings, and none of them asserts a
 * fact she has not given. Nothing here names a fabric, a size range, a
 * supplier or a service; the demo copy that once did (natural cloth,
 * alterations) is gone and must not come back without her.
 *
 * Her longer words — the owner bio — live in shop.ts as `owner.bio`, because
 * the home page's owner card reads them too. One copy, two surfaces. */

export type Principle = {
  n: string;
  title: string;
  body: string;
};

export const principles: Principle[] = [
  {
    n: "01",
    title: "One shop, one street.",
    body: "B Boutique is an independent shop at 18 Sea View Street in Cleethorpes. Womenswear and a small amount of homeware, all of it in one room, all of it chosen a piece at a time.",
  },
  {
    n: "02",
    title: "Fresh, and moving.",
    body: "We try not to reorder items, so that we can keep the stock fresh and moving. What is listed is what is on the rail, and when it goes, it goes.",
  },
  {
    n: "03",
    title: "At your own leisure.",
    body: "You are welcome to browse at your own leisure. Buy online, or come in and see it first.",
  },
];

export const philosophy = {
  statement:
    "Clothes you won’t meet coming the other way down the high street.",
  lines: ["One shop", "One street", "Every piece", "chosen by hand."],
};

/* The shop, in her own photographs (assets/about, built by
   scripts/build-about.mjs). Captions describe what is in the frame and
   nothing more: a caption is a claim, and these are claims anybody standing
   in the shop could check. */
export type ShopPhoto = {
  name: string;
  widths: readonly number[];
  w: number;
  h: number;
  alt: string;
  caption: string;
};

export const shopPhotos: Record<"shopfront" | "railWindow" | "back" | "counter", ShopPhoto> = {
  shopfront: {
    name: "shopfront",
    widths: [640, 960, 1024],
    w: 1024,
    h: 1024,
    alt: "The front of B Boutique: white signs reading Ladies Fashion, B Boutique Cleethorpes and Accessories & Homeware over a black-framed window of dressed mannequins.",
    caption: "Sea View Street",
  },
  railWindow: {
    name: "rail-window",
    widths: [960, 1440, 1920],
    w: 2976,
    h: 2160,
    alt: "Gold rails of womenswear against a black and gold marble wall, beside the shop window and its dressed mannequins.",
    caption: "The rails by the window",
  },
  back: {
    name: "back",
    widths: [960, 1440, 1920],
    w: 2976,
    h: 2160,
    alt: "Looking to the back of the shop: gold rails of clothing, a round mirror and round fitting rooms with cream curtains, under a black ceiling with spotlights.",
    caption: "Towards the fitting rooms",
  },
  counter: {
    name: "counter",
    widths: [960, 1440, 1920],
    w: 2960,
    h: 2160,
    alt: "The black marble counter beside a mustard-yellow wall and shelves of homeware, with rails and the fitting rooms behind.",
    caption: "The counter",
  },
};
