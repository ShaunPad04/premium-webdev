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
 * stock list. So this cannot disagree with /delivery, /returns or /faq.
 *
 * Native <details>: keyboard, screen readers and find-in-page work with no
 * script, and the answers are in the HTML whether a row is open or not. */

function block(heading: string): string {
  return policyBySlug("delivery")?.blocks.find((b) => b.heading === heading)?.body[0] ?? "";
}

export function ShortFaq() {
  const returns = faq.find((f) => f.q.startsWith("Can I return"))?.a;
  const items = [
    {
      q: "Where do you ship?",
      a: `${block("Where we send to")} Orders go by ${block("Who carries it").replace(/\.$/, "")}. ${block("What delivery costs")} ${block("When it is sent")}`,
    },
    returns ? { q: "What is your return policy?", a: returns } : null,
    {
      q: "How do I find the right size?",
      a: `${sizeSummary()} Each piece's page has a size guide with its sizes, its fit note and a UK measurement chart. Between sizes? Email ${shop.email} and ask before you order.`,
    },
  ].filter((x): x is { q: string; a: string } => Boolean(x));

  return (
    <section className="sfq" aria-labelledby="sfq-h">
      <p className="sfq-eyebrow">Need help?</p>
      <h2 id="sfq-h" className="sfq-title">Frequently asked questions</h2>
      <div className="sfq-list">
        {items.map((it) => (
          <details key={it.q} className="sfq-item">
            <summary className="sfq-q">
              <span>{it.q}</span>
              <span className="sfq-icon" aria-hidden="true" />
            </summary>
            <p className="sfq-a">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
