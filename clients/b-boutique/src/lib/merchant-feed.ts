import "server-only";
import { isBuyable, products, type Product } from "./catalogue";
import { merchantItemId } from "./product-schema";
import { readStock } from "./stock";

/** Her shop's store code in Google Business Profile. The in-store feed
 *  (/feeds/google-local.txt) names the shop by it, and Google matches it
 *  character for character, case included, so it must equal the "Store code"
 *  field on her profile (to be set there, 2026-10-16). Change both together. */
export const GOOGLE_STORE_CODE = "BB-CLEETHORPES";

export type FeedVariant = {
  product: Product;
  colourway: Product["colourways"][number];
  size: string;
  /** The Merchant Center item id, also the page variant's sku. */
  id: string;
  inStock: boolean;
};

/** Every variant BOTH Merchant Center feeds list (2026-10-16): the online
 *  feed (/feeds/google.xml) and the in-store one (/feeds/google-local.txt).
 *  One list, so an in-store row can never name an item the online feed does
 *  not have, which Google rejects.
 *
 *  Priced pieces only, and counted sizes only: Google needs in or out of
 *  stock, and "never counted" is neither. No counts leave this function. */
export async function feedVariants(): Promise<FeedVariant[]> {
  const stock = (await readStock().catch(() => null)) ?? [];
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  return stock.flatMap((v) => {
    const product = bySlug.get(v.slug);
    if (!product || !isBuyable(product) || v.qty === null) return [];
    const colourway = product.colourways.find((c) => c.colour === v.colour) ?? product.colourways[0];
    return [{ product, colourway, size: v.size, id: merchantItemId(colourway.sku, v.size), inStock: v.qty > 0 }];
  });
}
