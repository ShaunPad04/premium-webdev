"use client";

import { ProductPhoto } from "@/components/ProductPhoto";
import { ProductSlides } from "@/components/Deferred";
import type { ProductSlide } from "@/components/ui/product-slides";

/* The browser half of Shop the collection (NewInSlides.tsx). The server sends
 * each piece's photo NAMES and builds nothing heavy; the <picture> tags are
 * made here. Until 2026-09-29 the server built every colourway's photo,
 * thumbnail and swatch for all ten pieces (four widths, two formats each)
 * and sent them as props: 152 KB of the home page's 241 KB of HTML, ahead
 * of the phone's LCP image. The markup that renders is the same. */

/* Measured slot: the model is 304-448px wide from 1024px up (62% of the
   screen's height, 4:5), and at most 60% of the screen below that. */
const SIZES = "(min-width: 1024px) 448px, 60vw";
const CLS = "absolute inset-0 h-full w-full object-cover";

export type SlideData = Omit<ProductSlide, "image" | "variants"> & {
  photo: string;
  alt: string;
  square: boolean;
  /** Where a swatch crop of the photo is centred (a background-position). */
  swatchAt: string;
  ways?: { label: string; photo: string; alt: string }[];
};

export function NewInSlidesView({ items, label }: { items: SlideData[]; label: string }) {
  const slides: ProductSlide[] = items.map(({ photo, alt, square, swatchAt, ways, ...rest }) => {
    const pic = (name: string, a: string, sizes = SIZES) => <ProductPhoto photo={name} square={square} alt={a} sizes={sizes} className={CLS} />;
    return {
      ...rest,
      image: pic(photo, alt),
      variants: ways?.map((w) => ({
        label: w.label,
        image: pic(w.photo, w.alt),
        thumb: pic(w.photo, w.alt, "40px"),
        swatch: { src: `/img/product/${w.photo}-640.jpg`, at: swatchAt },
      })),
    };
  });
  return <ProductSlides slides={slides} label={label} loop />;
}
