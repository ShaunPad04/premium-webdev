import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { AddToBag } from "@/components/AddToBag";
import { ImageSlot, type Tone } from "@/components/ImageSlot";
import { Visit } from "@/components/Visit";
import { formatPrice, productBySlug, products } from "@/lib/catalogue";

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
            <ImageSlot
              tone={product.tone as Tone}
              seed={17}
              slot={product.slot}
              /* Names the piece and stops there. It used to say "photographed
                 in the shop", which was a claim about where the picture was
                 taken — and the pictures are generated art direction from a
                 CDN, not photographs of 18 Sea View Street. Alt text is heard
                 by the people who cannot see the image and have no way to
                 judge it, so it is the last place to assert something
                 unverified. */
              alt={product.name}
              /* Measured: the media column is 52% of the page above 1024 and
                 full width below it. */
              sizes="(min-width: 1024px) 52vw, 100vw"
              priority
              className="absolute inset-0 h-full w-full"
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

              <p className="pdp-price">{formatPrice(product.priceP)}</p>

              {product.demo ? (
                <p className="page-pending pdp-pending">
                  [Demo price — invented for this build, not the shop&rsquo;s
                  own]
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

              <AddToBag product={product} />
            </div>
          </div>
        </section>

        <Visit />
      </main>
      <Footer />
    </>
  );
}
