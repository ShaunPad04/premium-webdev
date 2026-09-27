import Link from "next/link";

import { FaqItem } from "@/components/FaqItem";
import { faq } from "@/lib/faq";
import { policyBySlug } from "@/lib/policies";
import { shop } from "@/lib/shop";
import { sizeSummary } from "@/lib/stocklist";

/* A short FAQ above the footer (2026-09-25, Brad, after the Radian theme's:
 * centred "Need help?" and three questions in hairline rows with a plus).
 *
 * Every answer is built from what the shop has confirmed, never written
 * here by hand: delivery from the delivery policy, returns from the FAQ
 * answer that is itself written from the returns policy, sizes from the
 * stock list. So this cannot disagree with /delivery or /returns.
 *
 * Each row is a native <details> (FaqItem), animated open and closed with
 * the Web Animations API; the answers are in the HTML either way. */

function block(heading: string): string {
  return policyBySlug("delivery")?.blocks.find((b) => b.heading === heading)?.body[0] ?? "";
}

/* `all` (the home page): the three shopping questions plus holds and gift
   cards, the two things people ask before coming in. Cut from nine to five
   on 2026-09-27 (Brad: "we don't need that many questions... overloaded,
   especially on mobile"). Where and when are left out because the Visit
   section just above shows the address, map and hours; the rest can go
   through "Ask us anything". Elsewhere: the three that matter while
   shopping. */
export function ShortFaq({ all = false }: { all?: boolean }) {
  const returns = faq.find((f) => f.q.startsWith("Can I return"))?.a;
  const ship = {
    q: "Where do you ship?",
    a: `${block("Where we send to")} Orders go by ${block("Who carries it").replace(/\.$/, "")}. ${block("What delivery costs")} ${block("When it is sent")}`,
  };
  const size = {
    q: "How do I find the right size?",
    a: `${sizeSummary()} Each piece's page has a size guide with its sizes, its fit note and a UK measurement chart. Between sizes? Email ${shop.email} and ask before you order.`,
  };
  const ret = returns ? { q: "What is your return policy?", a: returns } : null;
  const inShop = ["Can you hold an item", "Do you sell gift cards"]
    .map((start) => faq.find((f) => !f.temporary && f.q.startsWith(start)));
  const items = (all ? [ship, ret, size, ...inShop] : [ship, ret, size]).filter(
    (x): x is { q: string; a: string } => Boolean(x),
  );

  return (
    <section id={all ? "faq" : undefined} className="sfq" aria-labelledby="sfq-h">
      <p className="sfq-eyebrow">Need help?</p>
      <h2 id="sfq-h" className="sfq-title">Frequently asked questions</h2>
      <div className="sfq-list">
        {items.map((it) => (
          <FaqItem key={it.q} q={it.q} a={it.a} />
        ))}
      </div>
      {/* Anything else goes to the contact page (2026-09-27, Brad). No
          promised reply time: none has been confirmed by the shop. */}
      <div className="sfq-more">
        <span className="sfq-more-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
        </span>
        <span className="sfq-more-text">
          <span className="sfq-more-title">Still have a question?</span>
          <span className="sfq-more-sub">Send us a message and we&rsquo;ll get back to you.</span>
        </span>
        <Link href="/contact" className="sfq-more-cta">
          Ask us anything
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
      </div>
    </section>
  );
}
