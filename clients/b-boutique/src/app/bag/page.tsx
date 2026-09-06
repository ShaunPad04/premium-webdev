import type { Metadata } from "next";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { PageMasthead } from "@/components/PageMasthead";
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
      <Nav />
      <main id="main" className="flex-1">
        <PageMasthead
          eyebrow="Bag"
          title="Your bag."
          lede="Change anything you like here. Nothing is charged until you have been through the payment page."
        />
        <section className="page-section" aria-label="Bag contents">
          <div className="page-inner">
            <Bag />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
