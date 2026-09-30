/* Colourways that have a garment-only packshot on white, shown when a card
 * is hovered (2026-09-29, Brad: model photo first, the piece on its own on
 * hover). Keyed by the colourway's photo; the files are built by
 * scripts/build-packshot.mjs into /img/product/pack/. A colourway is listed
 * here only once its packshot has been checked against her photo: it must
 * show no detail the real piece does not have. Used by the product grid's
 * hover only: the home "Just in" slides (ui/product-slides.tsx) always show
 * the model photo (Brad, 2026-09-29). */
export const PACKSHOTS: ReadonlySet<string> = new Set([
  "bb-fairisle-bei", "bb-leopardcoat", "bb-tweedshirt-cam",
  "bb-plaidjkt-bei", "bb-trench-snd", "bb-zebrajean-zeb", "bb-laceblouse-bur", "bb-fauxfeather-blk",
  "bb-paisleyvest-bur", "bb-stripezip-tau", "bb-longtrench-bur", "bb-amourzip-nav", "bb-denimset-den",
  "bb-barrel-nav", "bb-jewelcard-blk", "bb-multijmp-brn", "bb-argylevest-brn", "bb-asymjmp-brn",
  "bb-linedtop-blk", "bb-set-kha", "bb-straight-blk", "bb-trouser-bei", "bb-sheerdress-bur", "bb-jeanjog-blu",
  "bb-paisleyjmp-brn", "bb-bomber-red", "bb-itknitbow-brn", "bb-itknit49-crm", "bb-itknitrib-crm",
  "bb-chunkcard-brn", "bb-barrelcord-bei", "bb-leobomber-bei", "bb-tweedshort-bur", "bb-pinshirt-cho", "bb-amourtrack-cho",
  "bb-stripetop-cho", "bb-hoodcoat-brn", "bb-tieskirt-bur", "bb-tartanbls-brn", "bb-barreltail-blk",
]);

export const packshotFor = (photo: string): string | null => (PACKSHOTS.has(photo) ? `pack/${photo}` : null);
