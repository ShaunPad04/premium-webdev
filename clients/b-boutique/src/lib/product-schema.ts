import type { Product } from "./catalogue";
import { DELIVERY_P, FREE_DELIVERY_OVER_P, isBuyable } from "./catalogue";
import { shop } from "./shop";
import { absolute } from "./site";
import { variantId } from "./variants";

/** Counted stock for one piece: variant id -> how many. A variant nobody has
 *  counted is ABSENT, never 0. `null` when there is no database to ask. */
export type StockCounts = ReadonlyMap<string, number>;

/** The id Merchant Center knows a variant by: her SKU plus the size, plain
 *  ASCII and under Google's 50 characters (the variant id, with its middle
 *  dots, is neither). The feed and the page both use this one function, so
 *  Google can match a page variant to its feed item. */
export const merchantItemId = (sku: string, size: string) =>
  `${sku}-${size.toUpperCase().replace(/[^A-Z0-9]+/g, "")}`;

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
 * `availability` FOR A SIZE NOBODY HAS COUNTED. Since 2026-10-16 (Search
 * Console flagged the missing field) a counted size says InStock or
 * OutOfStock, read from the stock table when the page is built and rebuilt
 * whenever that piece's count changes (see `refreshProductPage` in
 * lib/stock.ts), the same rule as the Merchant Center feed. "Never counted"
 * is still neither, so that size's offer carries no availability: a missing
 * field is a warning, a wrong one is a wrong statement about her rail.
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
 * A piece with one colour and one size is a Product. Anything else is a
 * ProductGroup with one variant per colour AND size, which is how stock is
 * counted, how the Merchant Center feed lists it, and the only level at
 * which "in stock" is true: a black 12 being in does not put the black 14 in.
 * The variants were per colour only until 2026-10-16, which left nowhere to
 * say which size had sold out. Each variant's `sku` is its feed id.
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

/** Delivery and returns as the policy pages state them (confirmed by her,
 *  2026-09-20): Royal Mail within the UK, free from the threshold; 14 days to return by post, the customer paying return postage.
 *  Built from the same constants the bag charges, so they cannot drift. */
const pounds = (p: number) => (p / 100).toFixed(2);
function shipping(priceP: number) {
  return {
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: priceP >= FREE_DELIVERY_OVER_P ? "0.00" : pounds(DELIVERY_P),
      currency: "GBP",
    },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "GB" },
    /* The times her Merchant Center account already gives Google (set
       2026-10-04: handling 1 day Mon-Fri, Royal Mail 1-3 days), added
       2026-10-16 when Search Console flagged the missing field. Before that
       this said nothing, because she confirmed posting the next business day
       and not Royal Mail's transit; Google now shows these days on her free
       listings either way, so the page says what Merchant Center says. Change
       both together. */
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 1, unitCode: "DAY" },
      transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
      businessDays: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d) => `https://schema.org/${d}`),
      },
    },
  };
}
const returnPolicy = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "GB",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 14,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
  merchantReturnLink: absolute("/returns"),
};

function offer(product: Product, priceP: number, availability: string | null) {
  return {
    "@type": "Offer",
    url: absolute(`/shop/${product.slug}`),
    /* Pounds, as a string, to two places. `priceP` is pence and an integer
       everywhere else in this codebase precisely so this is the only division
       — see locked decision 12. */
    price: (priceP / 100).toFixed(2),
    priceCurrency: "GBP",
    ...(availability ? { availability } : {}),
    seller: seller(),
    shippingDetails: shipping(priceP),
    hasMerchantReturnPolicy: returnPolicy,
  };
}

/** InStock / OutOfStock for a counted variant; null for one nobody counted
 *  (or with no database), which publishes no availability at all. */
function availabilityOf(counts: StockCounts | null, id: string): string | null {
  const qty = counts?.get(id);
  if (qty === undefined) return null;
  return qty > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
}

export function productSchema(product: Product, counts: StockCounts | null = null) {
  const context = "https://schema.org";
  const base = {
    name: product.name,
    description: product.short,
    category: product.category,
    url: absolute(`/shop/${product.slug}`),
  };

  const priced = isBuyable(product);
  /* The feed sends a size for clothing only; the page does the same, except
     where a piece really comes in more than one (then size is what varies). */
  const showSize = product.category !== "Homeware" || product.sizes.length > 1;

  const variants = product.colourways.flatMap((c) =>
    product.sizes.map((size) => ({
      "@type": "Product",
      name: [
        product.name,
        [c.colour, product.sizes.length > 1 ? `size ${size}` : ""].filter(Boolean).join(", "),
      ]
        .filter(Boolean)
        .join(" — "),
      /* Google reads description per variant for merchant listings, and
         Search Console flagged it missing (2026-10-16). The piece's own line,
         the same one the page prints under the name. */
      description: product.short,
      sku: merchantItemId(c.sku, size),
      ...(c.colour ? { color: c.colour } : {}),
      ...(showSize ? { size } : {}),
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
         JSON-LD before the fix: "price":"40.00". `priced` is isBuyable(). */
      ...(c.priceConfirmed && priced
        ? { offers: offer(product, c.priceP, availabilityOf(counts, variantId(product.slug, size, c.colour))) }
        : {}),
    })),
  );

  /* One colour, one size: the piece IS its variant, under its own name. */
  if (variants.length === 1) return { "@context": context, ...variants[0], ...base };

  return {
    "@context": context,
    ...base,
    "@type": "ProductGroup",
    productGroupID: product.slug,
    variesBy: [
      ...(product.colourways.length > 1 ? ["https://schema.org/color"] : []),
      ...(product.sizes.length > 1 ? ["https://schema.org/size"] : []),
    ],
    image: product.colourways.map((c) => imageUrl(c.image)),
    hasVariant: variants,
  };
}

/** The trail the product page shows, as a BreadcrumbList, so search results
 *  can print "Clothing › Knitwear" instead of a bare URL. Same items as the
 *  visible trail, plus the page itself as the last step. */
export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absolute(it.href),
    })),
  };
}
