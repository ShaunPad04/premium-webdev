import { DELIVERY_P, FREE_DELIVERY_OVER_P, formatPriceShort, isBuyable, products } from "@/lib/catalogue";
import { socials } from "@/lib/nav";
import { clothingCards } from "@/lib/pages";
import { owner, shop, openingSummary } from "@/lib/shop";
import { absolute, siteDescription } from "@/lib/site";
import { sizeSummary } from "@/lib/stocklist";

/* /llms.txt: the plain-text summary AI assistants read to answer questions
 * about a site (llmstxt.org). Built at build time from the same files the
 * pages read (shop.ts, the catalogue, the delivery constants), so it cannot
 * say anything the site does not. No was-prices, no stock levels. */
export const dynamic = "force-static";

export function GET() {
  const line = (p: (typeof products)[number]) =>
    `- [${p.name}](${absolute(`/shop/${p.slug}`)}): ${p.short}${isBuyable(p) ? ` ${formatPriceShort(p.priceP)}.` : ""}`;
  const clothing = clothingCards
    .map((c) => {
      const items = products.filter((p) => p.category === c.name);
      return items.length ? `### ${c.name}\n\n${items.map(line).join("\n")}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
  const homeware = products.filter((p) => p.category === "Homeware").map(line).join("\n");

  const body = `# ${shop.name}

> ${siteDescription}

${shop.name} (trading as B Boutique Cleethorpes) is an independent womenswear and homeware shop at ${shop.street}, ${shop.town}, ${shop.postcode}, England, run by ${owner.firstName} ${owner.lastName}. It sells in the shop and online, with delivery anywhere in the UK.

## Key facts

- Address: ${shop.street}, ${shop.town}, ${shop.county}, ${shop.postcode}
- Opening hours: ${openingSummary()}
- Email: ${shop.email}
- Delivery: UK only, by Royal Mail. ${formatPriceShort(DELIVERY_P)} per order, free on orders of ${formatPriceShort(FREE_DELIVERY_OVER_P)} or more.
- Returns: online orders can be returned for a refund within 14 days; no exclusions.
- Sizes: ${sizeSummary()}
- Payment: card payments online through SumUp.
- Social: ${socials.map((s) => `[${s.name}](${s.href})`).join(", ")}

## Pages

- [Clothing](${absolute("/clothing")}): every clothing piece online
- [Homeware](${absolute("/homeware")}): ceramic vases and jars
- [About](${absolute("/about")}): the shop and its owner
- [Contact](${absolute("/contact")}): email and the contact form
- [Delivery](${absolute("/delivery")}), [Returns](${absolute("/returns")}), [Terms](${absolute("/terms")}), [Privacy](${absolute("/privacy")})

## Clothing

${clothing}

## Homeware

${homeware}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
