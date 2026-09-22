/* A photograph of something actually in the shop.
 *
 * ── Why this is not next/image ───────────────────────────────────────────
 * Not a rejection of it — the hero does the same thing for the same reason.
 * scripts/build-product.mjs has already encoded every one of these 54 frames
 * at three widths in three formats, chosen against the measured slot widths.
 * Handing those files to the optimiser would decode a finished AVIF and
 * re-encode it at runtime to produce a slightly different AVIF: a cold
 * encode on the first request for every card in a 32-product grid, to arrive
 * at what is already on disk.
 *
 * A plain <picture> serves them straight from the static route. The browser
 * picks the format from the <source> order and the width from `sizes`, which
 * is exactly the job srcset exists to do.
 *
 * ── Two shapes, and neither is cropped here ──────────────────────────────
 * The garment frames are 4:5; the three homeware frames are square. Both are
 * served at their own aspect ratio and the CSS decides how they sit in a
 * slot, because a crop chosen in a component is a crop nobody can see when
 * they are reading the layout. `width`/`height` are therefore per-image and
 * come from the file, so the box is reserved before the bytes arrive and the
 * grid does not shift.
 *
 * ── Alt text ─────────────────────────────────────────────────────────────
 * Defaults to empty, and that is the right default in a grid: the piece's
 * name and category sit in real text directly beneath every card, so alt
 * here is announced twice and adds nothing. On the product page, where the
 * photograph IS the content, the caller passes a real one.
 *
 * It must never describe the garment beyond what the stock list confirms.
 * The pictures are generated imagery of pieces she stocks, not photographs of
 * the pieces themselves, so alt text inventing a detail ("cropped at the
 * hip", "in soft wool") would be a claim about the product sourced from a
 * picture rather than from her. */

/** The widths scripts/build-product.mjs emits. Kept in step with it by hand;
 *  there are two of them and a build step that generated this file would be
 *  more machinery than the problem deserves. */
const WIDTHS = [640, 960, 1280] as const;

const set = (photo: string, ext: string) =>
  WIDTHS.map((w) => `/img/product/${photo}-${w}.${ext} ${w}w`).join(", ");

export function ProductPhoto({
  photo,
  alt = "",
  sizes,
  square = false,
  priority = false,
  className = "",
}: {
  /** Basename in /img/product, no extension — `Product.photo`. */
  photo: string;
  alt?: string;
  /** The real rendered slot width. Measure it; do not guess. */
  sizes: string;
  /** The three homeware frames are 2048 square; everything else is 4:5. */
  square?: boolean;
  /** Only for a photograph above the fold that is a genuine LCP candidate. */
  priority?: boolean;
  className?: string;
}) {
  return (
    <picture>
      <source type="image/avif" srcSet={set(photo, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set(photo, "webp")} sizes={sizes} />
      <img
        src={`/img/product/${photo}-960.jpg`}
        srcSet={set(photo, "jpg")}
        sizes={sizes}
        alt={alt}
        width={square ? 2048 : 1856}
        height={square ? 2048 : 2304}
        loading={priority ? undefined : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={className}
      />
    </picture>
  );
}
