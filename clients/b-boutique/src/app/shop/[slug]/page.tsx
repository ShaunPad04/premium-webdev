import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { AddToBag } from "@/components/AddToBag";
import { ColourProvider } from "@/components/ColourChoice";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductGrid } from "@/components/ProductGrid";
import { PdpActions } from "@/components/pdp/PdpActions";
import { SizeGuide } from "@/components/pdp/SizeGuide";
import { Reserve } from "@/components/pdp/Reserve";
import { StickyBuy } from "@/components/pdp/StickyBuy";
import { RecentlyViewed } from "@/components/pdp/RecentlyViewed";
import { styleWith } from "@/lib/pairs";
import { newIn } from "@/lib/shop";
import {
  DELIVERY_P,
  FREE_DELIVERY_OVER_P,
  formatPriceShort,
  isBuyable,
  productBySlug,
  products,
  relatedTo,
} from "@/lib/catalogue";
import { openingPhrase, shop } from "@/lib/shop";
import { productSchema } from "@/lib/product-schema";
import { jsonLd } from "@/lib/site";

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

  const related = relatedTo(product);
  const homeware = product.category === "Homeware";
  const pairs = styleWith(product);
  const pairSlugs = new Set(pairs.map((p) => p.slug));
  const also = related.filter((p) => !pairSlugs.has(p.slug));
  const minis = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    photo: p.photo,
    price: isBuyable(p) ? formatPriceShort(p.priceP) : "Price to confirm",
    square: p.category === "Homeware",
  }));

  return (
    <>
      {/* Serialised, never string-concatenated. See `jsonLd` — it escapes the
          one character JSON.stringify leaves alone. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(productSchema(product)) }}
      />
      <MotionLayer />
      {/* The one route with no PageMasthead — it opens on the split layout,
          and the nav sits over the white column. See the `solid` note in
          Nav.tsx. */}
      <Nav solid />
      <main id="main" className="flex-1">
        {/* The provider spans BOTH columns, which is the whole reason it is
            context rather than a prop: everything between it and its two
            consumers stays server-rendered. */}
        <ColourProvider colours={product.colourways.map((c) => c.colour)}>
        <section className="pdp" aria-labelledby="pdp-name">
          {/* Every colourway, switchable. See ProductGallery — 22 of the 54
              photographs were sitting unused because this was one <picture>. */}
          <ProductGallery product={product} />

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

              <PdpActions
                slug={product.slug}
                name={product.name}
                isNew={newIn.some((n) => n.slug === product.slug)}
              />

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

              {/* No bag button for a piece whose price is a placeholder.
                  The rest of the page — the photograph, the description, the
                  sizes, the fabric — is hers and is shown; only the
                  transaction is withheld, because the one number needed to
                  make it honest is missing. */}
              {isBuyable(product) ? (
                <>
                  <AddToBag product={product} />
                  <div className="pdp-helpers">
                    {homeware ? null : (
                      <SizeGuide
                        name={product.name}
                        sizes={product.sizes}
                        sizeNote={product.sizeNote}
                        fitsLike={product.fitsLike}
                      />
                    )}
                    <Reserve name={product.name} sizes={homeware ? [] : product.sizes} />
                  </div>
                </>
              ) : (
                <p className="pdp-note">
                  This one is in the shop but not yet priced online. Email{" "}
                  <a href={`mailto:${shop.email}`} className="pdp-ask">
                    {shop.email}
                  </a>{" "}
                  and ask, or come and see it on the rail.
                </p>
              )}

              {/* The delivery threshold, where somebody is deciding. Her own
                  confirmed terms (2026-09-20), read from lib/catalogue.ts so
                  this cannot drift from what the bag and the checkout use. */}
              <p className="pdp-ship">
                Free UK delivery over {formatPriceShort(FREE_DELIVERY_OVER_P)}
                <span aria-hidden="true"> &middot; </span>
                {formatPriceShort(DELIVERY_P)} otherwise, Royal Mail next
                working day
                <span aria-hidden="true"> &middot; </span>
                Secure checkout
              </p>

              {/* ── The detail, folded ──────────────────────────────────────
                  The client asked for this: "a nice drop down of like
                  'specifications' 'details' etc like an ecommerce store". It
                  is also the right call on its own merits. The flat version
                  put a paragraph, a four-item feature list and a four-row
                  spec table between the price and the Add to bag button, so
                  the one control on the page that earns money was pushed a
                  screen down on a laptop. Everything is still here and none
                  of it is a click away from being read — it is just no longer
                  in front of the thing the page is for.

                  <details> and <summary>, not a div with an onClick. They are
                  open/closed state that the browser already owns: keyboard
                  operable, announced as "expanded/collapsed", findable by the
                  browser's own Find on some engines, and correct before a
                  single byte of JavaScript arrives. This page stays a server
                  component.

                  Details is open by default and the other two are closed. On
                  a garment the description is what somebody actually reads;
                  composition and postage are what they check. */}
              <div className="pdp-folds">
                <details className="pdp-fold" open>
                  <summary className="pdp-fold-head">
                    Details
                    <span aria-hidden="true" className="pdp-fold-mark" />
                  </summary>
                  <div className="pdp-fold-body">
                    <p className="pdp-desc">{product.full}</p>
                    {product.features.length > 0 ? (
                      <ul className="pdp-feat">
                        {product.features.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </details>

                <details className="pdp-fold">
                  <summary className="pdp-fold-head">
                    Specifications
                    <span aria-hidden="true" className="pdp-fold-mark" />
                  </summary>
                  <div className="pdp-fold-body">
                    <dl className="pdp-spec">
                      {product.fabric ? (
                        <>
                          {/* The heading is the gate. `fabricPublished` is
                              true for only 9 of 32: those carry a supplier
                              composition WITH percentages and are labelled
                              "Composition". The rest describe how the cloth
                              looks and handles and are labelled "Fabric",
                              which promises nothing measurable.

                              One row is the reason this exists: "Acrylic,
                              Polyester, Nylon, Elastane (percentages not
                              published)" names fibres with no percentages,
                              which is exactly the shape of a claim that fails
                              the Textile Products (Labelling and Fibre
                              Composition) Regulations. Flag off, prints under
                              "Fabric". */}
                          <dt>{homeware ? "Material" : product.fabricPublished ? "Composition" : "Fabric"}</dt>
                          <dd>{product.fabric}</dd>
                        </>
                      ) : null}
                      {product.weight ? (
                        <>
                          <dt>Weight</dt>
                          <dd>{product.weight}</dd>
                        </>
                      ) : null}
                      {homeware && product.dimensions ? (
                        <>
                          <dt>Dimensions</dt>
                          <dd>{product.dimensions}</dd>
                        </>
                      ) : null}
                      {product.care ? (
                        <>
                          <dt>Care</dt>
                          <dd>{product.care}</dd>
                        </>
                      ) : null}
                      {homeware ? null : (
                        <>
                          <dt>Size</dt>
                          <dd>
                            {product.sizes.join(" · ")}
                            {product.sizeNote ? ` — ${product.sizeNote}` : ""}
                          </dd>
                        </>
                      )}
                      <dt>Colours</dt>
                      {/* Supplier's own colour names off supplier's own
                          reference codes, never read off the photograph. */}
                      <dd>{product.colourways.map((c) => c.colour).join(" · ")}</dd>
                    </dl>
                  </div>
                </details>

                <details className="pdp-fold">
                  <summary className="pdp-fold-head">
                    Delivery &amp; returns
                    <span aria-hidden="true" className="pdp-fold-mark" />
                  </summary>
                  <div className="pdp-fold-body">
                    {/* Both figures come from lib/catalogue.ts, which is where
                        the bag and /api/checkout read them, so the price
                        quoted on a product page cannot drift from the price
                        charged at the till. Client-confirmed 2026-09-20. */}
                    <p className="pdp-desc">
                      {formatPriceShort(DELIVERY_P)} by Royal Mail, next working
                      day. Free on orders over{" "}
                      {formatPriceShort(FREE_DELIVERY_OVER_P)}. UK only.
                    </p>
                    <p className="pdp-desc">
                      Changed your mind? Send it back or bring it into the shop
                      within 14 days. Return postage is yours on a change of
                      mind.{" "}
                      <Link href="/returns" className="pdp-ask">
                        Returns in full
                      </Link>
                      .
                    </p>
                  </div>
                </details>
              </div>

              {/* One line and a link, not the address, hours and map again
                  (2026-09-24, Brad): those live in Visit and the footer. */}
              <p className="pdp-visit">
                On the rail at {shop.street}, {shop.town}, open {openingPhrase()}.{" "}
                <Link href="/#visit" className="pdp-ask">Visit the shop</Link>
              </p>
            </div>
          </div>
        </section>
        </ColourProvider>

        {pairs.length > 0 ? (
          <section aria-labelledby="pdp-style" className="also also--style">
            <div className="also-inner">
              <h2 id="pdp-style" className="also-h2">
                {homeware ? "Pairs well with" : "Style it with"}
              </h2>
              <ProductGrid items={pairs} morph={false} />
            </div>
          </section>
        ) : null}

        {also.length > 0 ? (
          <section aria-labelledby="pdp-also" className="also">
            <div className="also-inner">
              <h2 id="pdp-also" className="also-h2">
                You may also like
              </h2>
              {/* Nearest first — same category, then same supplier. Pieces
                  that cannot be bought yet sort last rather than being
                  hidden: they are real stock and somebody may well come in
                  for one, but leading an upsell with something unbuyable is
                  showing a customer a thing and then taking it away.
                  See `relatedTo` in lib/catalogue.ts. */}
              {/* `morph={false}`: this grid is a destination, not an origin.
                  With it on, any piece that also sits on the page the customer
                  just left forms a second view-transition pair and flies
                  across the screen alongside the one they actually clicked —
                  measured on /shop → /shop/fair-isle-jumper. See ProductGrid. */}
              <ProductGrid items={also} morph={false} />
            </div>
          </section>
        ) : null}

        <RecentlyViewed current={product.slug} all={minis} />

        {isBuyable(product) ? (
          <StickyBuy name={product.name} price={formatPriceShort(product.priceP)} />
        ) : null}
      </main>
      <Footer />
    </>
  );
}
