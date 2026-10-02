import { DELIVERY_P, FREE_DELIVERY_OVER_P, isBuyable, products } from "@/lib/catalogue";
import { absolute } from "@/lib/site";
import { readStock } from "@/lib/stock";

/* The product feed Google Merchant Center reads (2026-10-02, Brad), so her
 * pieces can show free in Google's Shopping tab. Merchant Center fetches it
 * on a schedule; nothing links to it.
 *
 * One item per piece, colour and size, which is how Google models clothing
 * and how stock is counted here. Built from the same catalogue as the pages,
 * so a price she changes on /stock reaches this feed in the same rebuild.
 *
 * Deliberately left out, for the reasons lib/product-schema.ts gives:
 *  - brand: a supplier is not a brand. identifier_exists=no says these have
 *    no brand or barcode, which is true of boutique stock.
 *  - sale_price: the "was" price is a £10 reference, not a price she charged,
 *    and Google requires a sale's regular price to be a real one.
 *  - pieces whose price is not confirmed, and any size nobody has counted:
 *    Google requires in or out of stock, and "never counted" is neither. */

export const dynamic = "force-dynamic";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const gbp = (p: number) => `${(p / 100).toFixed(2)} GBP`;

export async function GET() {
  const stock = (await readStock().catch(() => null)) ?? [];
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const items = stock.flatMap((v) => {
    const p = bySlug.get(v.slug);
    if (!p || !isBuyable(p) || v.qty === null) return [];
    const cw = p.colourways.find((c) => c.colour === v.colour) ?? p.colourways[0];
    const apparel = p.category !== "Homeware";
    const tags = [
      /* Her SKU plus the size: plain ASCII and under Google's 50 characters,
         which the variant id (middle dots, up to 57) is not. */
      ["g:id", `${cw.sku}-${v.size.toUpperCase().replace(/[^A-Z0-9]+/g, "")}`],
      ["g:item_group_id", p.slug],
      ["g:title", cw.colour ? `${p.name} - ${cw.colour}` : p.name],
      ["g:description", p.full || p.short],
      ["g:link", absolute(`/shop/${p.slug}`)],
      ["g:image_link", absolute(`/img/product/${cw.image}-1280.jpg`)],
      ["g:availability", v.qty > 0 ? "in_stock" : "out_of_stock"],
      ["g:price", gbp(p.priceP)],
      ["g:condition", "new"],
      ["g:identifier_exists", "no"],
      ["g:product_type", p.category],
      ...(cw.colour ? [["g:color", cw.colour]] : []),
      ...(apparel ? [["g:size", v.size], ["g:gender", "female"], ["g:age_group", "adult"]] : []),
    ];
    const shipping = p.priceP >= FREE_DELIVERY_OVER_P ? 0 : DELIVERY_P;
    return [
      `<item>${tags.map(([k, val]) => `<${k}>${esc(val)}</${k}>`).join("")}` +
        `<g:shipping><g:country>GB</g:country><g:price>${gbp(shipping)}</g:price></g:shipping></item>`,
    ];
  });

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel>` +
    `<title>B Boutique</title><link>${absolute("/")}</link>` +
    `<description>B Boutique, 18 Sea View Street, Cleethorpes</description>\n` +
    items.join("\n") +
    `\n</channel></rss>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}
