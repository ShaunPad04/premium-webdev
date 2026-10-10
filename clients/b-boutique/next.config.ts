import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Not inlining CSS. experimental.inlineCss was tried against this exact page
     and measured worse: performance 94 -> 89 and LCP 3.0s -> 3.7s. The
     stylesheet is render-blocking but it is also cached and parallel-fetched,
     and folding 13.7 KB into the document delays the document itself, which is
     strictly upstream of the LCP text. Do not re-enable without re-measuring.
     Re-measured 2026-09-29 (LCP now the hero photo, CSS 29 KB), n=3 phone:
     home 85 -> 84, /clothing 93 -> 89, a product 91 -> 88. Still worse. */
  images: {
    // AVIF first: the hero is a 2.8 MB PNG and it is the LCP element, so the
    // encoding choice is the single biggest lever on that metric.
    formats: ["image/avif", "image/webp"],
    /* 90 as well as the default 75. The category and New In photographs are
       re-encoded from source WebPs that are already lossy, so the optimiser's
       default 75 stacks a second generation of loss on top of the first and
       the result reads soft at desktop sizes. Next 16 requires every quality
       used to be declared here. */
    qualities: [75, 90],
  },
  /* /accessories was a page until 2026-09-22, when the client confirmed the
     shop stocks no accessories and it came out of the navigation. Temporary
     (307), not permanent: if she starts stocking them the page comes back,
     and a cached 308 would keep sending browsers away from it. */
  /* Browser caching for the photographs and videos (2026-10-10, Brad:
     "optimise images so they don't lag"). Measured on the live site first:
     every file under /img and /video went out as `max-age=0,
     must-revalidate`, Vercel's default for public/, so a returning visitor's
     browser re-asked the server about every one of the ~80 card photos on
     /clothing on every visit (a 304 each, but a round trip each), while the
     hashed scripts and stylesheets get a year. Nothing here is content-
     hashed, so not `immutable`: a day fresh, then a week of serve-stale-
     while-refetching, so a photo replaced under the same filename reaches a
     returning visitor within a day and a new visitor at once. If a photo
     MUST change instantly for everyone, give it a new filename (`image:` in
     stocklist.ts) rather than overwriting the old one. The pixels and the
     encoded files are untouched: the browser already picked the right width
     for every slot (measured at 390/768/1440) and Lighthouse lists no image
     in the page weight. */
  async headers() {
    const cache = { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" };
    return [
      { source: "/img/:path*", headers: [cache] },
      { source: "/video/:path*", headers: [cache] },
    ];
  },
  async redirects() {
    return [
      { source: "/accessories", destination: "/clothing", permanent: false },
      /* /shop came out on 2026-09-26 (Brad): "View all clothing" in the
         Catalogue menu is the same list. Temporary, like /accessories, so it
         can come back without a cached redirect in the way. Product pages
         under /shop/[slug] are untouched. */
      { source: "/shop", destination: "/clothing", permanent: false },
      /* /faq came out on 2026-09-27 (Brad): every question is on the home
         page now, above the footer. Temporary, for the same reason. */
      { source: "/faq", destination: "/#faq", permanent: false },
      /* The vercel.app address serves the same site as the real domain. The
         canonical tag already names bboutiqueclee.com; this makes it the only
         address a browser or crawler ends up on. Preview deployments have
         their own hostnames and are untouched. */
      {
        source: "/:path*",
        has: [{ type: "host", value: "b-boutique.vercel.app" }],
        destination: "https://bboutiqueclee.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
