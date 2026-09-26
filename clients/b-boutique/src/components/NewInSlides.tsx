/* New In as Product Slides (2026-09-26, Brad: a test in place of the 3D
 * coverflow, which stays in components/ui for a switch back).
 *
 * The same ten pieces as before (`newIn`, lib/shop.ts). Everything a slide
 * shows comes from the stocklist: the one-line description written for a
 * card (`short`), the price the checkout charges, and, where a piece comes
 * in a second colourway, that colourway's photograph under its supplier
 * colour name. */
import { newIn } from "@/lib/shop";
import { stocklist } from "@/lib/stocklist";
import { ProductPhoto } from "@/components/ProductPhoto";
import { Price } from "@/components/Price";
import { RevealText } from "@/components/RevealText";
import { ProductSlides, type ProductSlide } from "@/components/ui/product-slides";

/* Measured slot: the photograph is 250-360px wide from 1024px up, and at most
   62% of the screen below that. */
const SIZES = "(min-width: 1024px) 360px, 62vw";

export function NewInSlides() {
  const slides: ProductSlide[] = newIn.map((piece) => {
    const stock = stocklist.find((p) => p.slug === piece.slug);
    const [first, second] = stock?.colourways ?? [];
    const photo = (name: string) => (
      <ProductPhoto
        photo={name}
        square={piece.category === "Homeware"}
        alt=""
        sizes={SIZES}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
    return {
      id: piece.slug,
      title: piece.name,
      caption: piece.category,
      description: stock?.short,
      price: piece.priced ? <Price priceP={piece.priceP} slug={piece.slug} /> : "Price to confirm",
      href: `/shop/${piece.slug}`,
      image: photo(piece.photo),
      secondaryImage: second && second.image !== piece.photo ? photo(second.image) : undefined,
      imageLabel: first?.colour,
      secondaryLabel: second?.colour,
    };
  });

  if (slides.length === 0) return null;
  return (
    <section id="new-in" aria-labelledby="cf-heading" className="cf nis">
      <div className="cf-head">
        <p className="cf-eyebrow">New arrivals</p>
        <RevealText id="cf-heading" className="cf-h2">
          Just <em>in</em>
        </RevealText>
      </div>
      <ProductSlides slides={slides} label="New arrivals" loop />
    </section>
  );
}
