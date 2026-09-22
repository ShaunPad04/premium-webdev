import type { Metadata } from "next";
import { products } from "@/lib/catalogue";
import { readStock, stockIsConfigured } from "@/lib/stock";
import { isSignedIn, stockAuthIsConfigured } from "@/lib/stock-auth";
import { listOrders } from "@/lib/orders";
import { sweepStaleOrders } from "@/lib/order-sweep";
import { OrdersPanel } from "./OrdersPanel";
import { StockBoard, type BoardPiece } from "./StockBoard";
import { StockSignIn } from "./StockSignIn";
import { StockNotReady } from "./StockNotReady";

/** What is in the shop — the page B Boutique runs from her phone.
 *
 *  Not part of the shop. It is a staff tool that happens to live on the same
 *  deployment, which is why it is noindex regardless of ALLOW_INDEXING, has
 *  no header, no footer and no link pointing at it from anywhere on the site.
 *  The only way in is the address and the passphrase.
 */
export const metadata: Metadata = {
  title: "Stock",
  robots: { index: false, follow: false, nocache: true },
};

/* Stock changes constantly and a cached copy of it is worse than useless —
   it is a lie about what is on the rail. */
export const dynamic = "force-dynamic";

export default async function StockPage() {
  if (!stockIsConfigured() || !stockAuthIsConfigured()) {
    return (
      <StockNotReady
        database={stockIsConfigured()}
        passphrase={stockAuthIsConfigured()}
      />
    );
  }

  if (!(await isSignedIn())) return <StockSignIn />;

  /* Settle anything left hanging before reading the list, so what she sees is
     current rather than a snapshot with half-finished baskets in it.

     Running it here rather than on a schedule is deliberate: she opens this
     page every day, it costs one query when there is nothing stale, and it
     means the sweep cannot silently stop working without her noticing the
     orders stop arriving. A cron would be a second mechanism to monitor. It
     never throws into the page — a provider that is down must not stop her
     seeing the rail. */
  await sweepStaleOrders().catch((err) =>
    console.error("stock: order sweep failed", err),
  );

  const [rows, orders] = await Promise.all([readStock(), listOrders()]);
  if (!rows) return <StockNotReady database={false} passphrase />;

  /* Grouped by piece, because that is how she thinks about the rail: find the
     coat, then the size. A flat list of 121 variants is a list nobody scans. */
  const byPiece = new Map<string, BoardPiece>();
  for (const product of products) {
    byPiece.set(product.slug, {
      slug: product.slug,
      name: product.name,
      category: product.category,
      variants: [],
    });
  }
  for (const row of rows) {
    byPiece.get(row.slug)?.variants.push({
      id: row.id,
      size: row.size,
      colour: row.colour,
      qty: row.qty,
      restockable: row.restockable,
    });
  }

  const pieces = [...byPiece.values()].filter((p) => p.variants.length > 0);
  return (
    <>
      {/* Above the rail, because an order has somebody's money in it and the
          rail does not. Renders nothing at all when there is nothing to
          post. */}
      {orders ? <OrdersPanel orders={orders} /> : null}
      <StockBoard pieces={pieces} />
    </>
  );
}
