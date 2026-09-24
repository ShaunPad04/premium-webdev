import type { Metadata } from "next";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { PageMasthead } from "@/components/PageMasthead";
import { Faq } from "@/components/Faq";
import { addressLines, openingPhrase } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Questions",
  description: `Answers from B Boutique, ${addressLines.join(", ")}: opening hours, sizes, holds, gift cards, returns and buying online. Open ${openingPhrase()}.`,
  alternates: { canonical: "/faq" },
};

/* /faq. The questions came off the home page on 2026-09-24 (Brad, after the
 * homepage critique) and live here, linked from the footer and the menus.
 * Same component, same confirmed answers. */
export default function FaqPage() {
  return (
    <>
      <MotionLayer />
      <Nav />
      <main id="main" className="flex-1">
        <PageMasthead
          eyebrow="Questions"
          title="Questions."
          lede="What people ask in the shop, answered. Anything else, email and we will come back to you."
          texture="shop"
        />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
