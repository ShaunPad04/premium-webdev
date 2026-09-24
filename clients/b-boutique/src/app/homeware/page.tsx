import type { Metadata } from "next";
import Link from "next/link";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { PageMasthead } from "@/components/PageMasthead";
import { ProductGrid } from "@/components/ProductGrid";
import { productsIn } from "@/lib/catalogue";
import { categories, shop } from "@/lib/shop";
import { RevealText } from "@/components/RevealText";

const homeware = categories.find((c) => c.slug === "homeware")!;

export const metadata: Metadata = {
  title: "Homeware",
  description:
    "Homeware at B Boutique, 18 Sea View Street, Cleethorpes — available online or in the shop.",
  alternates: { canonical: "/homeware" },
};

/* /homeware — the category's own page, built 2026-09-22.
 *
 * Until today "Homeware" in the corner menu, the header's Shop menu, the
 * footer and the Accessories page all pointed at /#homeware: a section on the
 * home page carrying stock photography of shelves, not one of the three
 * pieces she actually sells. The client clicked it, landed on the home page,
 * and asked where the homeware was. Clothing had real category pages; this
 * one had been left as an anchor.
 *
 * It lists what the catalogue holds in Homeware — the Tomato Vase, the Banana
 * Jar and the Bell Vase today — through the same ProductGrid the clothing
 * rails use, so prices, quick-add and the "Price to confirm" state all come
 * from the one place. It is not under /clothing because a clothing page
 * listing ceramic vases is not a clothing page (see lib/pages.ts).
 *
 * The lede is the shop's own category line from shop.ts, not new copy. */
export default function HomewarePage() {
  const items = productsIn("Homeware");

  return (
    <>
      <MotionLayer />
      <Nav />
      <main id="main" className="flex-1">
        <PageMasthead
          eyebrow="For the home"
          title="Homeware"
          lede={homeware.note}
          aside={
            <p className="pm-phone">
              <span className="pm-phone-label">In this category</span>
              <span className="pm-phone-number">
                {items.length} {items.length === 1 ? "piece" : "pieces"}
              </span>
            </p>
          }
          texture="homeware"
        />

        <section aria-labelledby="home-items" className="page-section">
          <div className="page-inner">
            <div className="page-head">
              <RevealText id="home-items" className="page-h2">
                What is in.
              </RevealText>
            </div>

            {items.length ? (
              <ProductGrid items={items} />
            ) : (
              /* Same honest empty state as a clothing rail: the category
                 exists, so it renders and says so rather than 404ing. */
              <p className="page-body">
                No homeware online at the moment. Email{" "}
                <a href={`mailto:${shop.email}`} className="cf-fail-link">
                  {shop.email}
                </a>{" "}
                and ask what has just come in, or{" "}
                <Link href="/shop" className="cf-fail-link">
                  see everything in the shop
                </Link>
                .
              </p>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
