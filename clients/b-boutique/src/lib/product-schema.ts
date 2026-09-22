import type { Product } from "./catalogue";
import { isBuyable } from "./catalogue";
import { shop } from "./shop";
import { absolute } from "./site";

/* schema.org for one piece of stock.
 *
 * Built from `lib/stocklist.ts`, the same file the visible page reads, so the
 * markup and the page cannot drift. Nothing here is composed by hand.
 *
 * ── Four things the brief asked for that are deliberately NOT emitted ─────
 *
 * `brand`. Every piece carries a `supplier` — "Cherry Blue (via Leivip)",
 * "yui & me paris" — and a supplier is not a brand. The field records who she
 * buys from, and publishing it as the garment's maker would be a machine-
 * readable claim about a third party of exactly the kind that got the
 * homepage's brands rail deleted on 2026-09-21. `offers.seller` names B
 * Boutique instead, which is a fact: she is the one selling it.
 *
 * `availability`. These pages are statically generated and stock lives in a
 * database that changes whenever she taps Sold. Baking `InStock` in at build
 * time would publish a claim about the rail that nobody made, and the
 * codebase's own rule is that "never counted" is not "in stock". An offer
 * without an availability is valid schema; a wrong one is a wrong statement.
 *
 * `aggregateRating` / `review`. No review of this shop exists. The brief says
 * this outright and it is worth repeating where somebody might be tempted:
 * marking up a rating that has never been given is a manual-action risk and
 * an ASA problem, and it is a lie about a real business either way.
 *
 * `offers` AT ALL, on any colourway whose piece is not on sale — 2 of the 54
 * on 2026-09-22, both colours of one jumper. A placeholder price must never
 * reach a customer, and structured data is a customer-facing surface that
 * outlives the page — a price Google caches is one somebody can hold her to.
 * A piece whose price is unconfirmed emits a Product with a name, a picture
 * and a description, and no price. That is a less rich result and an honest
 * one.
 *
 * ── Product vs ProductGroup ──────────────────────────────────────────────
 * A piece sold in one colour is a Product. A piece sold in several is a
 * ProductGroup whose variants are the colourways, which is the accurate
 * model: they share a name and a price and differ by colour, each with its
 * own SKU and its own photograph. Flattening them into one Product would
 * throw away 22 of her 54 SKUs.
 */

/** The seller, shared by every offer. Matches the ClothingStore block in
 *  `app/layout.tsx`, which is where the address and hours are published. */
function seller() {
  return {
    "@type": "ClothingStore",
    name: shop.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: shop.street,
      addressLocality: shop.town,
      addressRegion: shop.county,
      postalCode: shop.postcode,
      addressCountry: shop.country,
    },
  };
}

/** The JPEG is the one to publish. AVIF and WebP are what the browser picks
 *  between; a crawler wants a plain URL it can certainly decode, and the
 *  widest build is the one worth indexing. */
const imageUrl = (photo: string) => absolute(`/img/product/${photo}-1280.jpg`);

function offer(product: Product) {
  return {
    "@type": "Offer",
    url: absolute(`/shop/${product.slug}`),
    /* Pounds, as a string, to two places. `priceP` is pence and an integer
       everywhere else in this codebase precisely so this is the only division
       — see locked decision 12. */
    price: (product.priceP / 100).toFixed(2),
    priceCurrency: "GBP",
    seller: seller(),
  };
}

export function productSchema(product: Product) {
  const base = {
    "@context": "https://schema.org",
    name: product.name,
    description: product.short,
    category: product.category,
    url: absolute(`/shop/${product.slug}`),
  };

  const priced = isBuyable(product);

  if (product.colourways.length === 1) {
    const c = product.colourways[0];
    return {
      ...base,
      "@type": "Product",
      sku: c.sku,
      color: c.colour,
      image: [imageUrl(c.image)],
      ...(priced ? { offers: offer(product) } : {}),
    };
  }

  return {
    ...base,
    "@type": "ProductGroup",
    productGroupID: product.slug,
    variesBy: ["https://schema.org/color"],
    image: product.colourways.map((c) => imageUrl(c.image)),
    hasVariant: product.colourways.map((c) => ({
      "@type": "Product",
      name: `${product.name} — ${c.colour}`,
      sku: c.sku,
      color: c.colour,
      image: [imageUrl(c.image)],
      /* Per colourway, because `priceConfirmed` is per colourway — AND only
         while the piece as a whole is on sale.

         The second condition was missing until 2026-09-22, when the first
         mixed case arrived: the Striped Fuzzy Zip Up Jumper, Taupe confirmed
         at £40 and Red un-confirmed. `demo` is per product, so the page
         shows "Price to confirm" for both colours and sells neither, while
         this markup still published a £40 offer for the Taupe. Structured
         data asserting an offer the visible page does not make is exactly
         the drift this file exists to prevent. Measured in the rendered
         JSON-LD before the fix: "price":"40.00". `priced` is the same
         isBuyable() the single-colourway branch above already uses. */
      ...(c.priceConfirmed && priced
        ? { offers: { ...offer(product), price: (c.priceP / 100).toFixed(2) } }
        : {}),
    })),
  };
}
