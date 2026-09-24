/* Shop the look (2026-09-24, Brad). Her own photograph of the shop window
 * (assets/about/11-shopfront-edited.jpg), with a dot on each piece that is
 * in the stock list.
 *
 * CLIENT INPUT REQUIRED: the matches below were made by eye from the window
 * photograph against the stock list's names and product photos. Each is a
 * claim that the piece in the window IS that product, so Hayley must
 * confirm all four before this goes live; delete any she does not.
 * x / y are the dot's position as a percentage of the cropped photograph. */
export const look = {
  image: "window",
  /* A 760x550 crop of the shopfront photograph around the window, made by
     hand in the session (sharp extract 160,230); the whole shopfront made
     the mannequins too small to point at. */
  w: 760,
  h: 550,
  alt: "The B Boutique shop window: four dressed mannequins beside shelves of homeware.",
  spots: [
    { slug: "leopard-print-longline-coat", x: 35.9, y: 58 },
    { slug: "argyle-vest-t-shirt", x: 51.7, y: 39 },
    { slug: "banana-jar", x: 23.2, y: 35.5 },
    { slug: "tomato-vase", x: 21.6, y: 49.5 },
  ],
} as const;
