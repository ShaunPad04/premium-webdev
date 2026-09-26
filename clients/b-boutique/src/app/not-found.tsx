import type { Metadata } from "next";
import Link from "next/link";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PageMasthead } from "@/components/PageMasthead";

/* The 404. Until 2026-09-23 this was Next's default: a white screen reading
   "404 | This page could not be found" with no header, no footer and no way
   back — the one page on the site that looked unfinished. Now it is the
   site's own masthead and three ways forward. Next still sends the 404
   status for it. */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main" className="flex-1">
        <PageMasthead
          eyebrow="404"
          title="Not on the rails."
          lede="That page is not here. It may have sold, moved, or never existed. Everything that is in is one click away."
        />
        <section className="page-section" aria-label="Where to go next">
          <div className="page-inner nf-links">
            <Link href="/clothing" className="nf-link">
              Shop everything <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link href="/#new-in" className="nf-link">
              Just in <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link href="/contact" className="nf-link">
              Contact the shop <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
