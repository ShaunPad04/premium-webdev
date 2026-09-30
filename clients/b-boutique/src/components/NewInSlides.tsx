/* New In as Product Slides (2026-09-26, Brad: a test in place of the 3D
 * coverflow, which stays in components/ui for a switch back).
 *
 * Since 2026-09-29 (Brad) "Shop the collection": the `newIn` pieces
 * after those in the New arrivals grid above it (NewArrivals.tsx), on the
 * model, so nothing repeats. Everything a slide
 * shows comes from the stocklist: the one-line description written for a
 * card (`short`), the price the checkout charges, and, where a piece comes
 * in more than one colourway, each colourway's photograph under its
 * supplier colour name. A size picked here carries to the product page
 * (?size=, 2026-09-26, Brad), where Add to bag is. */
import { newIn } from "@/lib/shop";
import { NEW_ARRIVALS } from "@/components/NewArrivals";
import { stocklist } from "@/lib/stocklist";
import { swatchPosition } from "@/lib/variants";
import { Price } from "@/components/Price";
import { RevealText } from "@/components/RevealText";
import { NewInSlidesView, type SlideData } from "@/components/NewInSlidesView";

/* Plain data only: photo names, words and the price. The photographs are
   built in the browser (NewInSlidesView.tsx), 2026-09-29. */
export function NewInSlides() {
  const items: SlideData[] = newIn.slice(NEW_ARRIVALS).map((piece) => {
    const stock = stocklist.find((p) => p.slug === piece.slug);
    const altFor = (img: string) => {
      const c = stock?.colourways.find((w) => w.image === img)?.colour;
      return c ? `${piece.name} in ${c}` : piece.name;
    };
    const ways = stock?.colourways ?? [];
    return {
      id: piece.slug,
      title: piece.name,
      caption: piece.category,
      description: stock?.short,
      price: piece.priced ? <Price priceP={piece.priceP} slug={piece.slug} /> : "Price to confirm",
      sizes: stock ? [...stock.sizes] : undefined,
      href: `/shop/${piece.slug}`,
      photo: piece.photo,
      alt: altFor(piece.photo),
      square: piece.category === "Homeware",
      /* Swatches as on the product page: a crop of each colourway's own
         photograph, positioned on the fabric (2026-09-27, Brad). */
      swatchAt: swatchPosition(piece.category),
      ways: ways.length > 1 ? ways.map((c) => ({ label: c.colour, photo: c.image, alt: altFor(c.image) })) : undefined,
    };
  });

  if (items.length === 0) return null;
  return (
    <section id="collection" aria-labelledby="cf-heading" className="cf nis">
      <div className="cf-head">
        <RevealText id="cf-heading" className="cf-h2">
          Shop the <em>collection</em>
        </RevealText>
      </div>
      <NewInSlidesView items={items} label="The collection" />
    </section>
  );
}
