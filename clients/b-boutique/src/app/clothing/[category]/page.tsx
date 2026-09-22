import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { PageMasthead } from "@/components/PageMasthead";
import { CategoryBar } from "@/components/CategoryBar";
import { ProductGrid } from "@/components/ProductGrid";
import { Visit } from "@/components/Visit";
import { pendingPriceNotice, productsIn } from "@/lib/catalogue";
import { clothingCards } from "@/lib/pages";

/* /clothing/[category] — one rail.
 *
 * This is the page the site was missing, and the reason it read as
 * disorganised: the category grid showed nine categories and there was
 * nothing underneath any of them. A card that names Coats has to lead to the
 * coats, or it is a label on an empty shelf.
 *
 * The categories come from the same list the grid renders, so a category
 * cannot exist on one and not the other, and each page's products come from
 * `productsIn` — the single definition of what is in a category. */
function cardFor(slug: string) {
  return clothingCards.find((c) => c.slug === slug);
}

export function generateStaticParams() {
  return clothingCards.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const card = cardFor(category);
  if (!card) return { title: "Not found" };
  return {
    title: card.name,
    description: `${card.name} at B Boutique, 18 Sea View Street, Cleethorpes. ${card.note}`,
    alternates: { canonical: `/clothing/${card.slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const card = cardFor(category);
  if (!card) notFound();

  const items = productsIn(card.name);

  return (
    <>
      <MotionLayer />
      <Nav />
      <main id="main" className="flex-1">
        <PageMasthead
          eyebrow="The rails"
          title={card.name}
          lede={card.note}
          aside={
            <p className="pm-phone">
              <span className="pm-phone-label">In this category</span>
              <span className="pm-phone-number">
                {items.length} {items.length === 1 ? "piece" : "pieces"}
              </span>
            </p>
          }
        />

        <section aria-labelledby="cat-items" className="page-section">
          <div className="page-inner">
            <div className="page-head">
              <h2 id="cat-items" className="page-h2">
                What is in.
              </h2>
              <p className="page-lede">
                Stock changes weekly. What is here is what is on the rail now —
                everything is one of one or close to it, so what sells does not
                come back.
              </p>
              {pendingPriceNotice() ? (
                <p className="page-pending">{pendingPriceNotice()}</p>
              ) : null}
            </div>

            {/* The sibling rails, at the TOP. They used to be a section at
                the bottom of this page, under the grid — so moving from
                Coats to Knitwear meant scrolling past every coat first. The
                same bar heads /clothing, so the whole set is one tap from
                any of them. See CategoryBar.tsx. */}
            <CategoryBar current={card.slug} />

            {items.length ? (
              <ProductGrid items={items} />
            ) : (
              /* An honest empty state rather than a page that looks broken.
                 It should not be reachable — every category has stock — but a
                 category added without stock must say so rather than render a
                 blank grid. */
              <p className="page-body">
                Nothing on this rail at the moment. Ring the shop and ask what
                has just come in, or{" "}
                <Link href="/shop" className="cf-fail-link">
                  see everything
                </Link>
                .
              </p>
            )}
          </div>
        </section>

        <Visit />
      </main>
      <Footer />
    </>
  );
}
