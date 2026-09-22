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

              {/* ── The description, which we HAD and were not showing ──
                  This block used to open "No invented description. The data
                  holds a name, a category and a picture, and everything a
                  product description usually says — fabric, origin, fit, care
                  — is a claim about a garment nobody has confirmed."

                  That was correct on 2026-09-08 and stopped being correct on
                  2026-09-22. The client's stock dashboard supplied a line, a
                  paragraph, a feature list, a fabric, a care instruction and a
                  supplier for all 32 pieces. It went into lib/stocklist.ts and
                  then nothing rendered it, so the page carried her words in
                  the bundle and showed the customer none of them. The client
                  asked where the descriptions were, which is a fair question.

                  The old rule is not relaxed, it is satisfied: every line
                  below is hers, and the one field that could become a false
                  claim is gated rather than printed. */}
              <p className="pdp-lede">{product.short}</p>
              <p className="pdp-desc">{product.full}</p>

              {product.features.length > 0 ? (
                <ul className="pdp-feat">
                  {product.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              ) : null}

              <dl className="pdp-spec">
                {product.fabric ? (
                  <>
                    {/* ── The one that needs the gate ──────────────────────
                        `fabricPublished` is true for only 9 of the 32, and it
                        decides the HEADING, not whether to show the text.

                        A composition label is a regulated claim: under the
                        Textile Products (Labelling and Fibre Composition)
                        Regulations it needs fibre percentages. Nine pieces
                        have them from the supplier and are labelled
                        "Composition". The rest describe how the cloth looks
                        and handles — "chunky flecked boucle knit with an
                        eyelash finish" — and are labelled "Fabric", which
                        promises nothing measurable.

                        One is a deliberate trap and the gate catches it:
                        "Acrylic, Polyester, Nylon, Elastane (percentages not
                        published)" NAMES FIBRES WITH NO PERCENTAGES, which is
                        exactly the shape of a claim that fails. It is stored
                        with the flag off, so it prints under "Fabric". */}
                    <dt>{product.fabricPublished ? "Composition" : "Fabric"}</dt>
                    <dd>{product.fabric}</dd>
                  </>
                ) : null}

                {product.care ? (
                  <>
                    <dt>Care</dt>
                    <dd>{product.care}</dd>
                  </>
                ) : null}

                {product.sizeNote ? (
                  <>
                    {/* "fits up to 14", "2 of each" — kept apart from the size
                        run in the data precisely so it can be shown as the
                        qualifier it is rather than mistaken for a size. */}
                    <dt>Fit</dt>
                    <dd>{product.sizeNote}</dd>
                  </>
                ) : null}

                {product.colourways.length > 1 ? (
                  <>
                    <dt>Colours</dt>
                    {/* The SUPPLIER'S own colour names, off the supplier's own
                        reference codes. Never read off the photograph — see
                        lib/variants.ts, which carries that rule because this
                        project once shipped a "satin skirt" that was a matte
                        brown pencil skirt. */}
                    <dd>{product.colourways.map((c) => c.colour).join(" · ")}</dd>
                  </>
                ) : null}
              </dl>

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
