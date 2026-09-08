import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { MotionLayer } from "./MotionLayer";
import { PageMasthead } from "./PageMasthead";
import { Visit } from "./Visit";
import type { Policy } from "@/lib/policies";
import { policyIsIncomplete } from "@/lib/policies";
import { phoneDisplay, shop } from "@/lib/shop";

/* Delivery, Returns, Terms of sale and Privacy all share this page.
 *
 * One component rather than four nearly identical files, because they are the
 * same document with different contents — and because a rule about how an
 * unconfirmed policy is displayed has to hold on all four or it holds on
 * none.
 *
 * ── The three kinds of block, and why they look different ─────────────────
 * A customer cannot be expected to know which sentence on a returns page is
 * the law and which is the shop's own decision, and on most shops' sites the
 * two are written in one indistinguishable voice. Here they are not:
 *
 *   statutory  gets its legal basis printed underneath in small type. It is
 *              not decoration — it is the difference between "the shop says"
 *              and "you are entitled to", and it lets a customer check.
 *   derived    plain. It comes from confirmed shop data.
 *   technical  plain to a customer, but carries a "How we know" footnote
 *              naming the file the claim was read out of. A privacy notice is
 *              the one document on a website that can be checked against the
 *              website, and saying which file makes that possible instead of
 *              asking to be believed.
 *   required   renders as a visibly empty slot carrying the question the
 *              client still has to answer, rather than as prose. Nothing
 *              plausible is written in the gap.
 *
 * The empty slots are deliberately loud. This page is not finished, the site
 * is noindex until it is, and a quiet gap is one somebody ships. */
export function PolicyPage({ policy }: { policy: Policy }) {
  const incomplete = policyIsIncomplete(policy);

  return (
    <>
      <MotionLayer />
      <Nav />
      <main id="main" className="flex-1">
        <PageMasthead
          eyebrow={policy.eyebrow}
          title={policy.title}
          lede={policy.lede}
        />

        <section className="page-section" aria-labelledby="pol-h">
          <div className="page-inner">
            <div className="page-head">
              <h2 id="pol-h" className="page-h2">
                In plain English.
              </h2>
              <p className="page-lede">{policy.intro}</p>

              {incomplete ? (
                /* The same device catalogue.ts, faq.ts and about.ts use: one
                   notice for as long as any part of the page is unconfirmed.
                   Worded for whoever is reviewing the build, because that is
                   who should be reading it — nothing here should reach a
                   customer in this state. */
                <p className="page-pending">
                  [Not finished &mdash; the marked sections below are decisions
                  only the shop can make, and are blank on purpose. This page
                  must not go live until they are filled in.]
                </p>
              ) : null}
            </div>

            <div className="pol">
              {policy.blocks.map((block) => (
                <section key={block.heading} className="pol-block">
                  <h3 className="pol-h">{block.heading}</h3>

                  {block.kind === "required" ? (
                    <div className="pol-slot">
                      <p className="pol-slot-tag">Client input required</p>
                      <p className="pol-slot-ask">{block.ask}</p>
                    </div>
                  ) : (
                    <>
                      {block.body.map((para) => (
                        <p key={para} className="pol-body">
                          {para}
                        </p>
                      ))}
                      {block.basis ? (
                        <p className="pol-basis">
                          <span className="pol-basis-tag">
                            {block.basisLabel ?? "Your legal right"}
                          </span>
                          {block.basis}
                        </p>
                      ) : null}
                    </>
                  )}
                </section>
              ))}
            </div>

            <p className="pol-close">
              Anything here you are not sure about, ring the shop on{" "}
              <a href={`tel:${shop.phone}`} className="cf-fail-link">
                {phoneDisplay}
              </a>
              . It is one room and one telephone; you will speak to somebody
              who can actually answer.
            </p>
          </div>
        </section>

        <Visit />
      </main>
      <Footer />
    </>
  );
}
