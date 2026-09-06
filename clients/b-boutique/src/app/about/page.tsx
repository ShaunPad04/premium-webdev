import type { Metadata } from "next";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionLayer } from "@/components/MotionLayer";
import { PageMasthead } from "@/components/PageMasthead";
import { Visit } from "@/components/Visit";
import { aboutBlocks, aboutTemporary, philosophy } from "@/lib/about";

export const metadata: Metadata = {
  title: "About us",
  description:
    "B Boutique is an independent shop at 18 Sea View Street, Cleethorpes. Womenswear, accessories and homeware, chosen a piece at a time and sold in person.",
  alternates: { canonical: "/about" },
};

/* /about.
 *
 * The most dangerous page on a local business site, and the reason is worth
 * stating at the top of the file: everything an About page wants to say is
 * unverifiable from a repository. Who runs the shop, when it opened, what they
 * did before, how long they have been on the street — every one of those is a
 * checkable claim about real people, and a plausible invention published under
 * a real shop's name is a false biography, not placeholder copy.
 *
 * So this page says only two kinds of thing. What is derived from confirmed
 * data or from the approved philosophy line, and what is demo copy carrying
 * `temporary: true` in lib/about.ts behind a visible notice. There is no
 * founder, no date, no history and no press on this page, because none is
 * known. See the rule at the top of lib/about.ts. */
export default function AboutPage() {
  return (
    <>
      <MotionLayer />
      <Nav />
      <main id="main" className="flex-1">
        <PageMasthead
          eyebrow="About us"
          title="The boutique."
          lede="An independent shop on Sea View Street, Cleethorpes."
        />

        {/* The signed-off statement, set quietly. It carries the home page's
            section 01 as a full-width editorial moment; here it is the
            opening line of an explanation rather than the statement itself,
            which is why it is set smaller and paired with its annotation. */}
        <section aria-labelledby="about-philosophy" className="page-section about-philosophy">
          <div className="page-inner about-phil-inner">
            <h2 id="about-philosophy" className="about-statement">
              {philosophy.statement}
            </h2>
            <p className="about-lines">
              {philosophy.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>
        </section>

        <section aria-labelledby="about-story" className="page-section is-alt">
          <div className="page-inner">
            <div className="page-head">
              <h2 id="about-story" className="page-h2">
                How it works.
              </h2>
              {aboutTemporary ? (
                <p className="page-pending">
                  [Some of what follows is placeholder copy written for this
                  demo — not confirmed by the shop]
                </p>
              ) : null}
            </div>

            <div className="about-blocks">
              {aboutBlocks.map((block) => (
                /* Number, heading and prose are three siblings, not two, so
                   the grid can put them in three columns above 1100 and the
                   prose keeps its 62ch measure without leaving a third of the
                   page empty beside it. Below that they stack. */
                <article key={block.label} className="about-block">
                  <p className="about-block-n">{block.label}</p>
                  <h3 className="about-block-h">{block.heading}</h3>
                  <div className="about-block-body">
                    {block.body.map((para) => (
                      <p key={para.slice(0, 32)} className="page-body">
                        {para}
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <Visit />
      </main>
      <Footer />
    </>
  );
}
