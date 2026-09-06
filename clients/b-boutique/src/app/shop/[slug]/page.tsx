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
              alt={`${product.name}, photographed in the shop`}
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
                  and a photograph, and everything a product description
                  usually says — fabric, origin, fit, care — is a claim about
                  a garment nobody has confirmed. What can honestly be said is
                  where it is and how it is sold. */}
              <p className="pdp-note">
                Photographed in the shop at 18 Sea View Street. If you would
                rather see it in person before deciding, it is on the rail.
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
