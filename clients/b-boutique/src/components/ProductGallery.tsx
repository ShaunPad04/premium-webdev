"use client";

import { ViewTransition, useCallback, useRef, useState } from "react";

import type { Product } from "@/lib/catalogue";
import { useColour } from "./ColourChoice";
import { ProductPhoto } from "./ProductPhoto";

/* The colourway gallery.
 *
 * ── Why this is the biggest thing missing from the product page ─────────
 * Every piece in the shop has between one and three colourways, and the
 * client's stock dashboard supplied a SEPARATE PHOTOGRAPH OF EACH ONE — 54
 * photographs across 32 pieces. Until now the page showed the first and the
 * other 22 sat unused in public/img/product. A customer looking at the Long
 * Trench could read the word "Camel" in a list and had no way to see it.
 *
 * On a clothing site that is not a nicety. Colour is the single thing people
 * most want to look at before buying, and a list of colour NAMES with one
 * picture is the layout of a shop that does not have the pictures. This one
 * does.
 *
 * ── Why a client component, in a codebase that avoids them ──────────────
 * Swapping the main image on click is state, and there are only two honest
 * ways to do it without JavaScript: a link per colour that reloads the page,
 * or the CSS radio-and-sibling-selector trick. The reload is worse UX than
 * the thing it is saving; the CSS trick needs every image in the DOM anyway
 * and produces markup nobody can read six months later.
 *
 * So: one small client component, and the cost is contained deliberately.
 * Every colourway image is rendered — they are `loading="lazy"` except the
 * first, so a piece with three colours does not fetch three photographs
 * before the customer has asked for one — and the SERVER still renders the
 * whole page around it. Nothing else on the route becomes client.
 *
 * ── The swatches are NOT here any more ──────────────────────────────────
 * They were, for a few hours, laid over the photograph. That gave the page
 * two controls for one decision — swatches that moved the picture and a
 * Colour radio group beside the size that decided what went in the bag —
 * which could disagree: camel on screen, burgundy in the bag.
 *
 * The client asked for the selector to sit "near the sizing like an ecommerce
 * store", which is the same fix from the other side. AddToBag owns the
 * control; this component is its output. The state is shared through
 * ColourChoice.tsx.
 */
/* ── Zoom and the full-screen viewer (2026-09-24, Brad) ─────────────────
 * Colour is what people want to look at before buying, and texture is the
 * next thing: is the knit chunky, is the check woven or printed. So:
 *
 * - With a mouse, the photograph magnifies ~1.9x under the cursor and
 *   follows it. The base frame scales at once; a native-resolution file
 *   (scripts/build-product-zoom.mjs) fades in over it when it arrives, so the
 *   zoom is instant and then sharp. Nothing is fetched until the first hover.
 * - Anywhere, the photograph is a button that opens it full screen in a
 *   native <dialog> (focus moves in, Escape closes, focus returns). There a
 *   tap zooms to the point tapped and a finger pans; tap again to fit.
 *
 * The pointer position is written straight to CSS variables, never to
 * state, so moving the mouse re-renders nothing. */
const zoomSet = (photo: string, ext: string) => `/img/product/${photo}-z.${ext}`;

function ZoomPicture({ photo, className, onLoad }: { photo: string; className: string; onLoad?: () => void }) {
  return (
    <picture>
      <source type="image/avif" srcSet={zoomSet(photo, "avif")} />
      <source type="image/webp" srcSet={zoomSet(photo, "webp")} />
      <img src={`/img/product/${photo}-1280.jpg`} alt="" decoding="async" draggable={false} className={className} onLoad={onLoad} />
    </picture>
  );
}

export function ProductGallery({ product }: { product: Product }) {
  /* Shared with the buy panel. The swatch row that used to live over this
     photograph is gone: the Colour control beside the size is the one
     control, and this is its output. See ColourChoice.tsx. */
  const { index: active } = useColour();
  const square = product.category === "Homeware";
  const current = product.colourways[active];

  const media = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const pane = useRef<HTMLDivElement>(null);
  /* Which colourways have had their zoom file requested. Mounted on the
     first hover, kept after, so going back to a colour is instant. */
  const [warm, setWarm] = useState<Record<number, boolean>>({});
  const [sharp, setSharp] = useState<Record<number, boolean>>({});
  const [viewerZoomed, setViewerZoomed] = useState(false);

  const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const onEnter = useCallback(() => {
    if (!finePointer()) return;
    setWarm((w) => (w[active] ? w : { ...w, [active]: true }));
    media.current?.setAttribute("data-zoom", "");
  }, [active]);

  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = media.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--zx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(2)}%`);
    el.style.setProperty("--zy", `${(((e.clientY - r.top) / r.height) * 100).toFixed(2)}%`);
  }, []);

  const onLeave = useCallback(() => media.current?.removeAttribute("data-zoom"), []);

  function openViewer() {
    setWarm((w) => (w[active] ? w : { ...w, [active]: true }));
    setViewerZoomed(false);
    window.__lenis?.stop();
    dialog.current?.showModal();
  }

  function onViewerTap(e: React.MouseEvent<HTMLDivElement>) {
    const box = pane.current;
    if (!box) return;
    if (viewerZoomed) {
      setViewerZoomed(false);
      return;
    }
    /* Zoom to the point tapped: measure where it sits as a fraction of the
       fitted image, then scroll the enlarged one so that point stays under
       the finger. */
    const img = box.querySelector("img");
    const r = (img ?? box).getBoundingClientRect();
    const fx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const fy = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    setViewerZoomed(true);
    requestAnimationFrame(() => {
      box.scrollLeft = fx * box.scrollWidth - box.clientWidth / 2;
      box.scrollTop = fy * box.scrollHeight - box.clientHeight / 2;
    });
  }

  return (
    /* The incoming half of the grid → product morph. Same name as the card's
       `.prod-media` in ProductGrid; React pairs them across the navigation.
       See that file for why `default="none"`. */
    <ViewTransition name={`product-${product.slug}`} share="morph" default="none">
    <div
      ref={media}
      className="pdp-media"
      data-square={square ? "" : undefined}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {/* All colourways stay mounted and are switched with a wipe rather
          than swapped in the DOM. Remounting an <img> on every click refetches
          nothing on a warm cache but DOES re-decode, which shows as a flash of
          empty frame on a slower machine — the one moment the customer is
          concentrating on the picture. */}
      {product.colourways.map((c, i) => (
        <div
          key={c.sku}
          className="pdp-frame"
          data-active={i === active ? "" : undefined}
          aria-hidden={i === active ? undefined : "true"}
        >
          <ProductPhoto
            photo={c.image}
            square={square}
            /* Names the piece and the colour, and stops. The colour is the
               supplier's own name off the supplier's own reference code, so
               it is a fact rather than a reading of the picture. Nothing about
               the cut, the length or the fit — those would be claims sourced
               from a generated image. */
            alt={`${product.name} in ${c.colour}`}
            sizes="(min-width: 1024px) 52vw, 100vw"
            priority={i === 0}
            className="absolute inset-0 h-full w-full"
          />
          {warm[i] ? (
            <span className="pdp-zoom" data-ready={sharp[i] ? "" : undefined} aria-hidden="true">
              <ZoomPicture photo={c.image} className="pdp-zoom-img" onLoad={() => setSharp((s) => ({ ...s, [i]: true }))} />
            </span>
          ) : null}
        </div>
      ))}

      <button type="button" className="pdp-open" onClick={openViewer}>
        <span className="sr-only">View {product.name} in {current.colour} full screen</span>
        <span className="pdp-open-badge" aria-hidden="true">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="M12.5 12.5 17 17M8.5 6v5M6 8.5h5" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {/* The colour of the frame on screen, in words, for everyone. On a
          single-colourway piece this is the only place the colour is stated
          at all, which is why it renders either way. */}
      <p className="pdp-colour-now" aria-live="polite">
        {current.colour}
      </p>

      <dialog
        ref={dialog}
        className="pdp-viewer"
        aria-label={`${product.name} in ${current.colour}`}
        onClose={() => window.__lenis?.start()}
      >
        <div
          ref={pane}
          className="pdp-viewer-pane"
          data-zoomed={viewerZoomed ? "" : undefined}
          data-square={square ? "" : undefined}
          data-lenis-prevent=""
          onClick={onViewerTap}
        >
          {warm[active] ? (
            <ZoomPicture key={current.sku} photo={current.image} className="pdp-viewer-img" />
          ) : null}
        </div>
        <p className="pdp-viewer-hint" aria-hidden="true">
          <span className="pvh-touch">Tap</span><span className="pvh-mouse">Click</span> to {viewerZoomed ? "fit" : "zoom"}
        </p>
        <form method="dialog">
          <button type="submit" className="pdp-viewer-close" autoFocus>
            <span className="sr-only">Close</span>
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M4 4l12 12M16 4 4 16" strokeLinecap="round" />
            </svg>
          </button>
        </form>
      </dialog>
    </div>
    </ViewTransition>
  );
}
