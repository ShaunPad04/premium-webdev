import type { Metadata } from "next";
import Link from "next/link";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SocialStrip } from "@/components/SocialStrip";
import { ShortFaq } from "@/components/ShortFaq";
import { MotionLayer } from "@/components/MotionLayer";
import { ProductGrid } from "@/components/ProductGrid";
import { Visit } from "@/components/Visit";
import { productsIn } from "@/lib/catalogue";
import { categories, shop } from "@/lib/shop";

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
      {/* No PageMasthead (2026-09-26, Brad): the photograph band above the
          rails is gone and the header is solid, as on the bag. The page's one
          h1 is the category name, over the pieces. */}
      <Nav solid />
      <main id="main" className="flex-1">

        <section aria-labelledby="home-items" className="page-section cat-page">
          <div className="page-inner">
            <div className="page-head">
              <p className="cat-eyebrow">For the home</p>
              <h1 id="home-items" className="page-h2 cat-h1">Homeware</h1>
              <p className="cat-count">{items.length} {items.length === 1 ? "piece" : "pieces"}</p>
              <p className="page-lede">{homeware.note}</p>
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

        <Visit />
      </main>
      <SocialStrip />
      <ShortFaq />
      <Footer />
    </>
  );
}
