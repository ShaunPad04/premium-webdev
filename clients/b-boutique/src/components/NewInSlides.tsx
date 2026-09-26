/* New In as Product Slides (2026-09-26, Brad: a test in place of the 3D
 * coverflow, which stays in components/ui for a switch back).
 *
 * The same ten pieces as before (`newIn`, lib/shop.ts). Everything a slide
 * shows comes from the stocklist: the one-line description written for a
 * card (`short`), the price the checkout charges, and, where a piece comes
 * in more than one colourway, each colourway's photograph under its
 * supplier colour name. Sizes are shown as information; the choosing is
 * done on the product page. */
import { newIn } from "@/lib/shop";
import { stocklist } from "@/lib/stocklist";
import { ProductPhoto } from "@/components/ProductPhoto";
import { Price } from "@/components/Price";
import { RevealText } from "@/components/RevealText";
import { ProductSlides, type ProductSlide } from "@/components/ui/product-slides";

/* Measured slot: the model is 304-448px wide from 1024px up (62% of the
   screen's height, 4:5), and at most 60% of the screen below that. */
const SIZES = "(min-width: 1024px) 448px, 60vw";

export function NewInSlides() {
  const slides: ProductSlide[] = newIn.map((piece) => {
    const stock = stocklist.find((p) => p.slug === piece.slug);
    const photo = (name: string, sizes = SIZES) => (
      <ProductPhoto
        photo={name}
        square={piece.category === "Homeware"}
        alt=""
        sizes={sizes}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
    const ways = stock?.colourways ?? [];
    return {
      id: piece.slug,
      title: piece.name,
      caption: piece.category,
      description: stock?.short,
      price: piece.priced ? <Price priceP={piece.priceP} slug={piece.slug} /> : "Price to confirm",
      sizes: stock ? [...stock.sizes] : undefined,
      href: `/shop/${piece.slug}`,
      image: photo(piece.photo),
      variants: ways.length > 1 ? ways.map((c) => ({ label: c.colour, image: photo(c.image), thumb: photo(c.image, "40px") })) : undefined,
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
