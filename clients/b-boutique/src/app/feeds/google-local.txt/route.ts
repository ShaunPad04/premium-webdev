import { GOOGLE_STORE_CODE, feedVariants } from "@/lib/merchant-feed";

/* Her in-store stock, for Google's free local listings (2026-10-16, Brad), so
 * a piece on the rail can show "In stock" at 18 Sea View Street on Google
 * Maps and Search. Merchant Center fetches it as a "local inventory" data
 * source; nothing links to it. It pairs with /feeds/google.xml by item id.
 *
 * Google's local inventory spec needs three columns: id, store_code and
 * availability. `quantity` is optional and deliberately absent: the shop
 * front never publishes a count (see lib/stock.ts), and this URL is public.
 * `limited_availability` is not used either, since it means "1 or 2 left".
 *
 * No pickup columns. `pickup_sla` "same day" would promise collection the
 * day of a 9pm order, and she has the piece ready the same day only during
 * opening hours. Add it here, and in Merchant Center, only if she agrees to
 * that wording. Tab-separated with a header row, which Merchant Center reads
 * as a text data source. */

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = (await feedVariants()).map(
    (v) => `${v.id}\t${GOOGLE_STORE_CODE}\t${v.inStock ? "in_stock" : "out_of_stock"}`,
  );
  return new Response(["id\tstore_code\tavailability", ...rows].join("\n") + "\n", {
    headers: {
      "Content-Type": "text/tab-separated-values; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}
