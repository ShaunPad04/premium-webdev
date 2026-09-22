import type { Metadata } from "next";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { Bag } from "@/components/Bag";

export const metadata: Metadata = {
  title: "Your bag",
  /* Nothing to index here, and nothing anybody searches for. */
  robots: { index: false, follow: true },
};

export default function BagPage() {
  return (
    <>
      <MotionLayer />
      {/* Solid, because the route no longer opens on a dark masthead.
          See the `solid` note in Nav.tsx. */}
      <Nav solid />
      <main id="main" className="flex-1">
        {/* No PageMasthead. It was a full dark band reading "Your bag." with
            a lede under it — on a 390px phone the first piece in the bag did
            not appear until ~930px down, a whole screen spent telling
            somebody where they already are. The client asked for it to go.

            One small h1 stays: every page keeps one meaningful top-level
            heading for screen readers, and "Bag" is that heading. The lede's
            reassurance was not dropped — it moved under the Checkout button,
            which is where somebody hesitating reads it. */}
        <section className="page-section bag-page" aria-labelledby="bag-h1">
          <div className="page-inner">
            <h1 id="bag-h1" className="label bag-h1">
              Bag
            </h1>
            <Bag />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
