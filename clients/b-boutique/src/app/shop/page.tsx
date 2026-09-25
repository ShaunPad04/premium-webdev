import type { Metadata } from "next";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SocialStrip } from "@/components/SocialStrip";
import { MotionLayer } from "@/components/MotionLayer";
import { PageMasthead } from "@/components/PageMasthead";
import { ShopSearch } from "@/components/ShopSearch";
import { Visit } from "@/components/Visit";
import { pendingPriceNotice, products } from "@/lib/catalogue";
import { RevealText } from "@/components/RevealText";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Buy from B Boutique online, or come to 18 Sea View Street, Cleethorpes. Womenswear and homeware, chosen a piece at a time.",
  alternates: { canonical: "/shop" },
};

/* /shop — the catalogue.
 *
 * Every price on this page is invented. See the rule at the top of
 * lib/catalogue.ts: a displayed price is not merely a claim, it is what a
 * customer is entitled to pay, so the notice below renders for as long as any
 * product is still flagged demo and nothing can actually be charged until a
 * payment provider is configured. */
export default function ShopPage() {
  return (
    <>
      <MotionLayer />
      <Nav />
      <main id="main" className="flex-1">
        <PageMasthead
          eyebrow="Shop"
          title="Everything in."
          lede="What is on the rails now, and how to have it sent. New stock comes in regularly, so this is what is here now rather than a standing range."
        texture="shop"
        />

        <section aria-labelledby="shop-all" className="page-section">
          <div className="page-inner">
            <div className="page-head">
              <RevealText id="shop-all" className="page-h2">
                On the rails.
              </RevealText>
              <p className="page-lede">
                Everything is one of one or close to it, so what sells does not
                come back. Search the rails, or scroll them.
              </p>
              {pendingPriceNotice() ? (
                <p className="page-pending">{pendingPriceNotice()}</p>
              ) : null}
            </div>
            <ShopSearch items={products} />
          </div>
        </section>

        <Visit />
      </main>
      <SocialStrip />
      <Footer />
    </>
  );
}
