import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SocialStrip } from "@/components/SocialStrip";
import { ShortFaq } from "@/components/ShortFaq";
import { MotionLayer } from "@/components/MotionLayer";
import { ClothingShelf } from "@/components/ClothingShelf";
import { ProductGrid } from "@/components/ProductGrid";
import { Visit } from "@/components/Visit";
import { productsIn } from "@/lib/catalogue";
import { clothingCards, RETIRED_CATEGORIES } from "@/lib/pages";
import { shop } from "@/lib/shop";
import { pageMeta } from "@/lib/site";

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
  return pageMeta({
    path: `/clothing/${card.slug}`,
    title: `${card.name} for women`,
    description: `${card.name} at B Boutique, 18 Sea View Street, Cleethorpes. ${card.note} Buy online with UK delivery or in the shop.`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  /* A URL this site used to serve goes to its nearest live category rather
     than to a dead end. See RETIRED_CATEGORIES — these were in the header
     menu on every page until 2026-09-22 and are in everybody's history. */
  const moved = RETIRED_CATEGORIES[category];
  if (moved) permanentRedirect(moved);

  const card = cardFor(category);
  /* Still a 404 for a slug that was never real. An unknown path must not
     render a page: inventing a category for any string a crawler tries is how
     a site grows infinite soft-404s. The EMPTY case is different and is
     handled below — a category that exists and happens to have nothing in it
     renders, because "nothing in this one right now" is information and a 404
     is not. */
  if (!card) notFound();

  const items = productsIn(card.name);

  return (
    <>
      <MotionLayer />
      {/* No PageMasthead (2026-09-26, Brad): the photograph band above the
          rails is gone and the header is solid, as on the bag. The page's one
          h1 is the category name, over the pieces. */}
      <Nav solid />
      <main id="main" className="flex-1">

        {/* The sibling rails sit beside the pieces (see ClothingShelf), so
            moving from Coats to Knitwear never means scrolling past every
            coat first. */}
        <ClothingShelf title={card.name} current={card.slug} count={items.length}>
          {items.length ? (
            <ProductGrid items={items} lead={3} />
          ) : (
            /* An honest empty state rather than a page that looks broken,
               and never a 404 — the client asked for exactly this: "worst
               case you click one and it has no products, it shouldn't 404".
               A category that exists and is empty is information; a 404 is
               a dead end that reads as a bug.

               "Ring the shop" was here until 2026-09-22 and was wrong: the
               phone number came off the site on 2026-09-21 (locked decision
               10), which makes email the only route. A dead end that also
               points at a channel the site no longer publishes is two
               defects in one sentence. */
            <p className="page-body">
              Nothing on this rail at the moment. Email{" "}
              <a href={`mailto:${shop.email}`} className="cf-fail-link">
                {shop.email}
              </a>{" "}
              and ask what has just come in, or{" "}
              <Link href="/clothing" className="cf-fail-link">
                see everything in the shop
              </Link>
              .
            </p>
          )}
        </ClothingShelf>

        <Visit />
      </main>
      <SocialStrip />
      <ShortFaq />
      <Footer />
    </>
  );
}
