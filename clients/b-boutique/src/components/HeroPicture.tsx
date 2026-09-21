/* One <picture>, both crops.
 *
 * Two separate <Image> elements — one hidden per breakpoint — fetched BOTH,
 * because a display:none parent does not stop the request and `priority`
 * preloads it outright. That cost 97 KB and ~2.2s of encode time on mobile
 * for an image never shown.
 *
 * A single <picture> with media-scoped <source> elements makes the browser
 * choose one file before any request goes out. The files are pre-encoded by
 * scripts/build-hero.mjs, so nothing is generated on demand either. */
export function HeroPicture({ className = "" }: { className?: string }) {
  return (
    <picture>
      {/* Desktop crop */}
      <source media="(min-width: 1024px)" type="image/avif" srcSet="/img/hero-desktop.avif" />
      <source media="(min-width: 1024px)" type="image/webp" srcSet="/img/hero-desktop.webp" />
      <source media="(min-width: 1024px)" type="image/jpeg" srcSet="/img/hero-desktop.jpg" />
      {/* Mobile crop */}
      <source type="image/avif" srcSet="/img/hero-mobile.avif" />
      <source type="image/webp" srcSet="/img/hero-mobile.webp" />
      {/* No eslint-disable needed: no-img-element allows a bare <img> inside
          a <picture>, which is the whole reason this component exists. */}
      <img
        src="/img/hero-mobile.jpg"
        /* Describes the picture, and nothing beyond it. It deliberately does
           NOT name a garment as stock — the hero is a campaign image, not a
           product shot, and "white dress" in an alt attribute on a shop's
           homepage edges toward a claim about what is on the rail. Replaced
           2026-09-21 with the hero itself; the old text read "A woman in gold
           jewellery against a deep red ground" and described an image that is
           no longer on the page. */
        alt="A woman in white on a Paris street, a red door behind her"
        fetchPriority="high"
        decoding="async"
        style={{ color: "transparent" }}
        className={`h-full w-full object-cover ${className}`}
      />
    </picture>
  );
}
