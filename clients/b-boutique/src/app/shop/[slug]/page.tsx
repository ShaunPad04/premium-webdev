import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { AddToBag } from "@/components/AddToBag";
import { ProductPhoto } from "@/components/ProductPhoto";
import { Visit } from "@/components/Visit";
import {
  formatPriceShort,
  isBuyable,
  productBySlug,
  products,
} from "@/lib/catalogue";
import { shop } from "@/lib/shop";

/* Prerender every product. There are thirteen of them and they change when
   the code changes, so there is nothing to gain from rendering them on
   demand and a fast static page to gain from not doing so. */
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    /* Deliberately does not put the price in the description. It is invented,
       and a price in a search result outlives the page it came from. */
    description: `${product.name} — ${product.category} at B Boutique, 18 Sea View Street, Cleethorpes.`,
    alternates: { canonical: `/shop/${product.slug}` },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <MotionLayer />
      <Nav />
      <main id="main" className="flex-1">
        <section className="pdp" aria-labelledby="pdp-name">
          <div className="pdp-media">
            <ProductPhoto
              photo={product.photo}
              square={product.category === "Homeware"}
              /* Names the piece and stops there. It used to say "photographed
                 in the shop", which was a claim about where the picture was
                 taken — and these are generated images of pieces she stocks,
                 not photographs of 18 Sea View Street. Alt text is heard by
                 the people who cannot see the image and have no way to judge
                 it, so it is the last place to assert something unverified.
                 It also must not describe the garment beyond the stock list:
                 a detail read off a generated picture is a claim about the
                 product sourced from the picture rather than from her. */
              alt={product.name}
              /* Measured: the media column is 52% of the page above 1024 and
                 full width below it. */
              sizes="(min-width: 1024px) 52vw, 100vw"
              priority
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <div className="pdp-body">
            <div className="pdp-inner">
              <p className="pdp-cat">
                <Link href="/shop" className="pdp-back">
                  Shop
                </Link>
                <span aria-hidden="true"> / </span>
                {product.category}
              </p>

              <h1 id="pdp-name" className="pdp-name">
                {product.name}
              </h1>

              {/* Same rule as the grid: a placeholder is not a price, and
                  this is the page where somebody decides to spend money. */}
              {isBuyable(product) ? (
                <p className="pdp-price">{formatPriceShort(product.priceP)}</p>
              ) : (
                <p className="pdp-price pdp-price--pending">Price to confirm</p>
              )}

              {/* Per PIECE, not per page: this one names the piece in front
                  of you rather than the state of the catalogue. */}
              {product.demo ? (
                <p className="page-pending pdp-pending">
                  [The price for this piece is not confirmed yet, so it cannot
                  be bought. Everything else about it is the shop&rsquo;s own.]
                </p>
              ) : null}

              {/* No invented description. The data holds a name, a category
                  and a picture, and everything a product description usually
                  says — fabric, origin, fit, care — is a claim about a garment
                  nobody has confirmed. What can honestly be said is where it
                  is and how it is sold.

                  This used to open "Photographed in the shop at 18 Sea View
                  Street." That was false: lib/images.ts resolves every slot to
                  generated art direction on a CDN, so the claim was about a
                  photograph that was never taken. The second sentence was
                  always true, is the half that actually sells a boutique
                  against an online-only seller, and is all that remains. */}
              <p className="pdp-note">
                If you would rather see it in person before deciding, it is on
                the rail at 18 Sea View Street.
              </p>

              {/* No bag button for a piece whose price is a placeholder.
                  The rest of the page — the photograph, the description, the
                  sizes, the fabric — is hers and is shown; only the
                  transaction is withheld, because the one number needed to
                  make it honest is missing. */}
              {isBuyable(product) ? (
                <AddToBag product={product} />
              ) : (
                <p className="pdp-note">
                  This one is in the shop but not yet priced online. Email{" "}
                  <a href={`mailto:${shop.email}`} className="pdp-ask">
                    {shop.email}
                  </a>{" "}
                  and ask, or come and see it on the rail.
                </p>
              )}
            </div>
          </div>
        </section>

        <Visit />
      </main>
      <Footer />
    </>
  );
}
