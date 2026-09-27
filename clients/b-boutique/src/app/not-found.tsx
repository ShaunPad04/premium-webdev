import type { Metadata } from "next";
import Link from "next/link";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

/* The 404 (2026-09-27): Brad picked C of three, each after a real 21st.dev
   component: "not found 2" (efferd). An oversized 404 fading out at its
   foot, one line under it, and two ways back. (Rejected: A "Not Found 404
   Page" by hirael, B "Not Found 06" by shadcnui-blocks.) Next still sends
   the 404 status for it. */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Nav solid />
      <main id="main" className="flex-1">
        <section className="nf404">
          <h1 className="nf404-h" aria-label="Page not found">
            404
          </h1>
          <p className="nf404-p">The page you are looking for may have sold, moved, or never existed.</p>
          <div className="nf404-btns">
            <Link href="/" className="nf404-btn">
              Go home
            </Link>
            <Link href="/clothing" className="nf404-btn nf404-btn--line">
              Explore
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
