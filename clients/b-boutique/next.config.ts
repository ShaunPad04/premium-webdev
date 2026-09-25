import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Not inlining CSS. experimental.inlineCss was tried against this exact page
     and measured worse: performance 94 -> 89 and LCP 3.0s -> 3.7s. The
     stylesheet is render-blocking but it is also cached and parallel-fetched,
     and folding 13.7 KB into the document delays the document itself, which is
     strictly upstream of the LCP text. Do not re-enable without re-measuring. */
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
  async redirects() {
    return [
      { source: "/accessories", destination: "/shop", permanent: false },
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
