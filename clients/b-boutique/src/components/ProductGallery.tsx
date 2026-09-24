"use client";

import { ViewTransition, useEffect, useRef, useState } from "react";

import type { Product } from "@/lib/catalogue";
import { useColour } from "./ColourChoice";
import { ProductPhoto } from "./ProductPhoto";

/* The product gallery (2026-09-24, Brad: 4 to 6 images, thumbnails, zoom,
 * swipe on a phone).
 *
 * The slides are the chosen colourway's photographs: its main image plus any
 * `extra` shots in lib/stocklist.ts. Most pieces have one photograph so far,
 * so a single, clearly labelled "more photographs to follow" slot stands in
 * where the others will go; it is never dressed up as a real image.
 *
 * - Phone: a horizontal scroll-snap track, so a swipe is the browser's own
 *   gesture, momentum and all. Dots show where you are.
 * - Desktop: thumbnails beside the photograph; hovering the photograph zooms
 *   it 2x toward the pointer (transform only).
 * - Anywhere: the expand button opens the photograph full screen at its full
 *   resolution in a native <dialog>, which pans by scrolling or dragging.
 *
 * Colour stays the one control: ColourChoice picks the colourway, this shows
 * it. The first slide keeps the view-transition name, so the card-to-page
 * morph still lands on it. */

export function ProductGallery({ product }: { product: Product }) {
  const { index: active } = useColour();
  const square = product.category === "Homeware";
  const way = product.colourways[active];
  const shots = [way.image, ...(way.extra ?? [])];
  const needMore = shots.length < 4;

  const track = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [slide, setSlide] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  /* A new colour starts at its first photograph. */
  useEffect(() => {
    track.current?.scrollTo({ left: 0 });
    setSlide(0);
  }, [active]);

  const go = (i: number) => {
    const t = track.current;
    if (!t) return;
    t.scrollTo({ left: i * t.clientWidth, behavior: "smooth" });
    setSlide(i);
  };

  const count = shots.length + (needMore ? 1 : 0);
  const alt = `${product.name} in ${way.colour}`;

  return (
    <div className="pg" data-square={square ? "" : undefined}>
      {count > 1 ? (
        <ol className="pg-thumbs" aria-label="Photographs">
          {shots.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                className="pg-thumb"
                aria-current={slide === i ? "true" : undefined}
                aria-label={`Photograph ${i + 1} of ${shots.length}`}
                onClick={() => go(i)}
              >
                <ProductPhoto photo={s} square={square} sizes="80px" className="absolute inset-0 h-full w-full object-cover" />
              </button>
            </li>
          ))}
          {needMore ? (
            <li>
              <button
                type="button"
                className="pg-thumb pg-thumb--soon"
                aria-current={slide === shots.length ? "true" : undefined}
                onClick={() => go(shots.length)}
              >
                <span>More soon</span>
              </button>
            </li>
          ) : null}
        </ol>
      ) : null}

      <div className="pg-main">
        <div
          ref={track}
          className="pg-track"
          onScroll={(e) => {
            const t = e.currentTarget;
            const i = Math.round(t.scrollLeft / Math.max(1, t.clientWidth));
            if (i !== slide) setSlide(i);
          }}
        >
          {shots.map((s, i) => {
            const img = (
              <div
                className="pg-slide"
                data-zoom={zoom && slide === i ? "" : undefined}
                style={zoom && slide === i ? ({ "--zx": `${zoom.x}%`, "--zy": `${zoom.y}%` } as React.CSSProperties) : undefined}
                onPointerMove={(e) => {
                  if (e.pointerType !== "mouse") return;
                  const r = e.currentTarget.getBoundingClientRect();
                  setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
                }}
                onPointerLeave={() => setZoom(null)}
              >
                <ProductPhoto
                  photo={s}
                  square={square}
                  alt={i === 0 ? alt : `${alt}, photograph ${i + 1}`}
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  priority={i === 0}
                  className="pg-img absolute inset-0 h-full w-full"
                />
              </div>
            );
            return i === 0 ? (
              <ViewTransition key={s} name={`product-${product.slug}`} share="morph" default="none">
                {img}
              </ViewTransition>
            ) : (
              <div key={s} className="contents">{img}</div>
            );
          })}
          {needMore ? (
            <div className="pg-slide pg-soon" role="note">
              <p className="pg-soon-h">More photographs to follow</p>
              <p className="pg-soon-p">
                Back, detail and styled shots of this piece are on their way. Until then it is on the rail in the shop.
              </p>
            </div>
          ) : null}
        </div>

        <button type="button" className="pg-expand" onClick={() => dialog.current?.showModal()}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span className="sr-only">View photograph full screen</span>
        </button>

        {count > 1 ? (
          <div className="pg-dots" aria-hidden="true">
            {Array.from({ length: count }, (_, i) => (
              <span key={i} data-on={slide === i ? "" : undefined} />
            ))}
          </div>
        ) : null}

        <p className="pdp-colour-now" aria-live="polite">{way.colour}</p>
      </div>

      <dialog
        ref={dialog}
        className="pg-full"
        aria-label={`${alt}, full screen`}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="pg-full-scroll">
          {/* The full-resolution file, so zooming shows real detail. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/img/product/${shots[Math.min(slide, shots.length - 1)]}-1280.webp`} alt={alt} className="pg-full-img" />
        </div>
        <button type="button" className="pg-full-close" onClick={() => dialog.current?.close()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="sr-only">Close</span>
        </button>
      </dialog>
    </div>
  );
}
