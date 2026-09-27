"use client";

import type { Product } from "@/lib/catalogue";
import { useColour } from "./ColourChoice";
import { ProductPhoto } from "./ProductPhoto";

/* The product page's thumbnails (2026-09-27, Brad: "more ecommerce style").
 * One per colourway, beside the photograph on a desktop and under it on a
 * phone. They drive the same shared colour as the swatches in AddToBag, so
 * picking a thumbnail picks that colour to buy, and the two cannot disagree.
 * A piece with one colourway has nothing to switch and shows none. */
export function GalleryThumbs({ product }: { product: Product }) {
  const { colour, index, setColour } = useColour();
  if (product.colourways.length < 2) return null;
  const square = product.category === "Homeware";

  return (
    <div className="pdp-thumbs" role="group" aria-label="Colours">
      {product.colourways.map((c, i) => (
        <button
          key={c.colour}
          type="button"
          className="pdp-thumb"
          data-on={index === i ? "" : undefined}
          aria-pressed={colour === c.colour}
          aria-label={`Show ${c.colour}`}
          onClick={() => setColour(c.colour)}
        >
          <ProductPhoto photo={c.image} square={square} alt="" sizes="80px" className="pdp-thumb-img" />
        </button>
      ))}
    </div>
  );
}
