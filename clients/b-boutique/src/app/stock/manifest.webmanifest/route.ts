/* The stock page's own web app manifest (2026-09-28), so "Add to Home
   Screen" on /stock gives her a "B Stock" icon that opens straight into the
   stock page, full screen, rather than the site's manifest (which starts
   at the shop's home page). Scoped to /stock so it never claims the shop. */
export const dynamic = "force-static";

export function GET() {
  return Response.json(
    {
      name: "B Boutique Stock",
      short_name: "B Stock",
      start_url: "/stock",
      scope: "/stock",
      display: "standalone",
      background_color: "#FFFFFF",
      theme_color: "#0E0B0C",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } },
  );
}
