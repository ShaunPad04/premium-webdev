import Link from "next/link";

import { DELIVERY_P, FREE_DELIVERY_OVER_P, formatPriceShort } from "@/lib/catalogue";
import { openingPhrase, shop } from "@/lib/shop";

/* In the shop, or sent to you: a slim strip (rebuilt 2026-09-23).
 *
 * It was a full split section, a half-screen photograph beside three
 * numbered rows, and the client found it "out of place and over the top".
 * The reason was mostly repetition: the hours and address are also in the
 * FAQ, Visit and the footer, and the delivery price in the announcement bar
 * and beside every statement price. What is left is the reassurance a
 * shopper wants at a glance, one line each, and the way to the full page.
 * Every fact is derived: prices from the catalogue, hours and street from
 * shop.ts, so it cannot drift from checkout or from Visit. */

const Icon = ({ d }: { d: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ITEMS = [
  {
    href: "/delivery",
    icon: "M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7M6 18a1.8 1.8 0 1 0 0-.01M17 18a1.8 1.8 0 1 0 0-.01",
    title: `UK delivery ${formatPriceShort(DELIVERY_P)}`,
    line: `Free over ${formatPriceShort(FREE_DELIVERY_OVER_P)} · next business day`,
  },
  {
    href: "/returns",
    icon: "M9 7H4V2M4.3 7A8.5 8.5 0 1 1 3.5 12",
    title: "Returns",
    line: "Send it back, or bring it into the shop",
  },
  {
    href: "/#visit",
    icon: "M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11zM12 12.3a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6z",
    title: "Visit the shop",
    line: `${shop.street}, open ${openingPhrase()}`,
  },
];

export function Service() {
  return (
    <section id="service" aria-labelledby="svc-heading" className="svs">
      <h2 id="svc-heading" className="sr-only">In the shop, or sent to you</h2>
      <ul className="svs-list">
        {ITEMS.map((it) => (
          <li key={it.href}>
            <Link href={it.href} className="svs-item">
              <span className="svs-icon">
                <Icon d={it.icon} />
              </span>
              <span className="svs-text">
                <span className="svs-title">{it.title}</span>
                <span className="svs-line">{it.line}</span>
              </span>
              <span className="svs-arrow" aria-hidden="true">&rarr;</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
