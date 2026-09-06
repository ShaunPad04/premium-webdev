import type { Metadata } from "next";
import Link from "next/link";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { PageMasthead } from "@/components/PageMasthead";
import { ClearBag } from "@/components/ClearBag";
import { phoneDisplay, shop } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false, follow: false },
};

/* Where SumUp sends the customer back to.
 *
 * ── What this page carefully does NOT say ─────────────────────────────────
 * "Your payment was successful." Landing here means the browser followed a
 * return URL, which anybody can type; it is not proof that money moved. Only
 * SumUp telling the server that, through a webhook, is proof — and that
 * webhook does not exist yet, along with the order store it would write to.
 *
 * So the page says what is actually known: the payment page was completed and
 * a confirmation follows. When the webhook and the order record exist, this
 * page should read the order and say something definite. Until then it must
 * not claim more than it has been told. */
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <>
      <MotionLayer />
      <Nav />
      <ClearBag />
      <main id="main" className="flex-1">
        <PageMasthead
          eyebrow="Checkout"
          title="Thank you."
          lede="Your payment page has been completed. We will email a confirmation once the payment has settled."
          aside={
            ref ? (
              <p className="pm-phone">
                <span className="pm-phone-label">Your reference</span>
                <span className="pm-phone-number">{ref}</span>
              </p>
            ) : null
          }
        />

        <section className="page-section" aria-labelledby="thanks">
          <div className="page-inner">
            <div className="page-head">
              <h2 id="thanks" className="page-h2">
                What happens next.
              </h2>
            </div>
            <p className="page-body">
              Everything is picked by hand in the shop, so orders go out in the
              order they arrive rather than automatically. If anything in your
              bag has gone since you added it, we will ring you before charging
              for it.
            </p>
            <p className="page-body">
              Any questions, ring the shop on{" "}
              <a href={`tel:${shop.phone.replace(/\s+/g, "")}`} className="cf-fail-link">
                {phoneDisplay}
              </a>
              {ref ? <> and quote {ref}.</> : "."}
            </p>
            <p className="page-body">
              <Link href="/shop" className="btn-solid">
                Back to the shop <span aria-hidden="true">&rarr;</span>
              </Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
