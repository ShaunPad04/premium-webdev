import type { Metadata } from "next";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { PageMasthead } from "@/components/PageMasthead";
import { ProductGrid } from "@/components/ProductGrid";
import { Visit } from "@/components/Visit";
import { catalogueIsDemo, products } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Buy from B Boutique online, or come to 18 Sea View Street, Cleethorpes. Womenswear, accessories and homeware, chosen a piece at a time.",
  alternates: { canonical: "/shop" },
};

/* /shop — the catalogue.
 *
 * Every price on this page is invented. See the rule at the top of
 * lib/catalogue.ts: a displayed price is not merely a claim, it is what a
 * customer is entitled to pay, so the notice below renders for as long as any
 * product is still flagged demo and nothing can actually be charged until a
 * payment provider is configured. */
export default function ShopPage() {
  return (
    <>
      <MotionLayer />
      <Nav />
      <main id="main" className="flex-1">
        <PageMasthead
          eyebrow="Shop"
          title="Everything in."
          lede="What is on the rails this week, and how to have it sent. Stock changes weekly, so this is what is here now rather than a standing range."
        />

        <section aria-labelledby="shop-all" className="page-section">
          <div className="page-inner">
            <div className="page-head">
              <h2 id="shop-all" className="page-h2">
                In this week.
              </h2>
              <p className="page-lede">
                {products.length} pieces. Everything is one of one or close to
                it, so what sells does not come back.
              </p>
              {catalogueIsDemo ? (
                <p className="page-pending">
                  [Demo prices — every price and size on this page is invented
                  for this build and nothing can be charged]
                </p>
              ) : null}
            </div>
            <ProductGrid items={products} idPrefix="shop" />
          </div>
        </section>

        <Visit />
      </main>
      <Footer />
    </>
  );
}
