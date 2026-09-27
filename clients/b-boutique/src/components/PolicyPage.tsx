import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { PolicyToc } from "./PolicyToc";
import { Visit } from "./Visit";
import type { Policy } from "@/lib/policies";
import { policyIsIncomplete } from "@/lib/policies";
import { shop } from "@/lib/shop";

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

  const idOf = (h: string) => h.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  /* 2026-09-27, Brad picked A of three, after 21st.dev "Table of Contents"
     (hirael): the title, then the policy as an article with an
     on-this-page list beside it on a desktop. The dark photo masthead and
     "In plain English." heading are gone; the intro line stays under the
     title. */
  return (
    <>
      <Nav solid />
      <main id="main" className="flex-1">
        <div className="pol-page">
          <header>
            <p className="pol-eyebrow">{policy.eyebrow}</p>
            <h1 className="pol-title">{policy.title}</h1>
            <p className="pol-lede">{policy.intro}</p>
            {incomplete ? (
              /* The same device catalogue.ts, faq.ts and about.ts use: one
                 notice for as long as any part of the page is unconfirmed.
                 Worded for whoever is reviewing the build, because that is
                 who should be reading it. */
              <p className="page-pending">
                [Not finished &mdash; the marked sections below are decisions
                only the shop can make, and are blank on purpose. This page
                must not go live until they are filled in.]
              </p>
            ) : null}
          </header>

          <div className="pol-grid">
            <article className="pol-article">
              {policy.blocks.map((block) => (
                <section key={block.heading} id={idOf(block.heading)} className="pol-block">
                  <h2 className="pol-h">{block.heading}</h2>

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
                          <span className="pol-basis-tag">{block.basisLabel ?? "Your legal right"}</span>
                          {block.basis}
                        </p>
                      ) : null}
                    </>
                  )}
                </section>
              ))}

            <p className="pol-close">
              {/* Was "ring the shop on" + an email address, then "one room
                  and one telephone; you will speak to somebody". Both went
                  stale when phone numbers came off the site on 2026-09-21.
                  The reply reaches the shop itself, which is the true half
                  of the old promise, so that half stays. */}
              Anything here you are not sure about, email the shop at{" "}
              <a href={`mailto:${shop.email}`} className="cf-fail-link">
                {shop.email}
              </a>
              . It goes straight to the shop, not to a call centre.
            </p>
            </article>
            <aside className="pol-aside">
              <PolicyToc items={policy.blocks.map((b) => ({ id: idOf(b.heading), text: b.heading }))} />
            </aside>
          </div>
        </div>

        <Visit />
      </main>
      <Footer />
    </>
  );
}
