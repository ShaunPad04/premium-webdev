import type { NextRequest } from "next/server";

import { DELIVERY_P, productBySlug } from "@/lib/catalogue";

/* Start a payment.
 *
 * ── THE RULE ──────────────────────────────────────────────────────────────
 * The browser sends slugs, sizes and quantities. It does NOT send prices and
 * it does NOT send a total, and if it did they would be ignored. Anything the
 * client can send, the client can change; a total posted from a browser is a
 * total somebody sets to 1p. The bag is priced again here, from this server's
 * own catalogue, and that is the figure the provider is asked to charge.
 *
 * ── AND THE OTHER RULE ────────────────────────────────────────────────────
 * This never returns success unless the payment provider actually accepted a
 * checkout. There is no provider configured today — nobody has supplied SumUp
 * credentials — so it answers 503 and the bag page says so plainly. A shop
 * that says "order placed" without taking a payment is worse than a shop that
 * says it cannot take one.
 *
 * ── SumUp ─────────────────────────────────────────────────────────────────
 * Hosted checkout, created through the API: we POST a checkout, SumUp returns
 * a hosted payment page, the customer pays there and comes back to
 * /checkout/success. Card details never touch this site, which keeps its PCI
 * scope to the smallest it can be (SAQ A).
 *
 * Three fields below are not decoration, and each was wrong before the
 * official spec was read (sumup/sumup-openapi, and the same schemas in
 * sumup/sumup-go):
 *
 *   hosted_checkout: { enabled: true }
 *     `hosted_checkout_url` is described as "Returned when Hosted Checkout is
 *     enabled for the checkout". Without this the response has no URL, there
 *     is nowhere to send the customer, and this route fails every request at
 *     the last step. It was missing.
 *
 *   redirect_url — where the PAYER is sent.
 *     "URL where the payer should be sent after a redirect-based payment or
 *     SCA flow completes."
 *
 *   return_url — a SERVER callback, not a landing page.
 *     "Optional backend callback URL used by SumUp to notify your platform
 *     about processing updates for the checkout." This route used to put the
 *     success page here, which is the wrong field for a human being.
 *
 * It is deliberately NOT set. SumUp's spec publishes no signature scheme for
 * that callback, and an unauthenticated POST that says "this order is paid"
 * is not something to write stock or orders from. The success page instead
 * ASKS SumUp — GET /v0.1/checkouts?checkout_reference=… — which is
 * authenticated, authoritative, and cannot be forged by a customer typing a
 * URL. See lib/sumup.ts.
 *
 * WHAT IS STILL MISSING BEFORE THIS CAN TAKE REAL MONEY, and none of it is
 * something a developer can invent:
 *   - Real prices. Everything in lib/catalogue.ts is made up.
 *   - Stock. Nothing decrements; two people can buy the same one-off piece.
 *     SumUp's API exposes no catalogue, product, item, inventory or stock
 *     endpoint — checked against both official specs — so the shop's own till
 *     cannot be the source of truth for what is left. That needs a store.
 *   - An order record. Nothing is written down, so nothing can be picked,
 *     packed, refunded or audited. That needs somewhere to store it.
 *   - Delivery, returns, terms and a privacy notice — legally required for
 *     distance selling in the UK, including the 14-day cancellation right.
 */

type Line = { slug?: unknown; size?: unknown; qty?: unknown };

const MAX_LINES = 25;
const MAX_QTY = 10;

export async function POST(request: NextRequest) {
  let body: { lines?: unknown };
  try {
    body = (await request.json()) as { lines?: unknown };
  } catch {
    return Response.json(
      { ok: false, error: "Could not read that request." },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.lines) || body.lines.length === 0) {
    return Response.json({ ok: false, error: "Your bag is empty." }, { status: 400 });
  }
  if (body.lines.length > MAX_LINES) {
    return Response.json({ ok: false, error: "That is too many lines." }, { status: 400 });
  }

  /* Price it here, from here. */
  let subtotalP = 0;
  const priced: { name: string; size: string; qty: number; priceP: number }[] = [];

  for (const raw of body.lines as Line[]) {
    const slug = typeof raw?.slug === "string" ? raw.slug : "";
    const size = typeof raw?.size === "string" ? raw.size : "";
    const qty = Math.floor(Number(raw?.qty));

    const product = productBySlug(slug);
    if (!product) {
      return Response.json(
        { ok: false, error: "Something in your bag is no longer available." },
        { status: 409 },
      );
    }
    if (!product.sizes.includes(size)) {
      return Response.json(
        { ok: false, error: `That size is not available for ${product.name}.` },
        { status: 409 },
      );
    }
    if (!Number.isFinite(qty) || qty < 1 || qty > MAX_QTY) {
      return Response.json(
        { ok: false, error: "That quantity is not available." },
        { status: 409 },
      );
    }

    subtotalP += product.priceP * qty;
    priced.push({ name: product.name, size, qty, priceP: product.priceP });
  }

  const totalP = subtotalP + DELIVERY_P;

  const apiKey = process.env.SUMUP_API_KEY;
  const merchantCode = process.env.SUMUP_MERCHANT_CODE;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!apiKey || !merchantCode || !siteUrl) {
    /* The honest failure. Nothing was charged, so nothing pretends otherwise. */
    return Response.json(
      {
        ok: false,
        code: "not_configured",
        error:
          "This shop is not connected to a payment provider yet, so checkout could not be started. Nothing has been charged.",
      },
      { status: 503 },
    );
  }

  /* A reference the shop can quote on the phone. Not an order number — there
     is no order store yet — but enough to find the payment in SumUp. */
  const reference = `BB-${Date.now().toString(36).toUpperCase()}`;

  try {
    const res = await fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkout_reference: reference,
        /* SumUp takes a decimal amount, so this is the one place pence
           become pounds — at the very edge, once, after all the arithmetic
           is done in integers. */
        amount: totalP / 100,
        currency: "GBP",
        merchant_code: merchantCode,
        purpose: "CHECKOUT",
        /* Without this there is no hosted payment page in the response. */
        hosted_checkout: { enabled: true },
        description: priced
          .map((l) => `${l.qty} x ${l.name}${l.size === "One size" ? "" : ` (${l.size})`}`)
          .join(", ")
          .slice(0, 255),
        /* Where the customer lands. `return_url` is SumUp's server callback
           and is deliberately not set — see the note at the top. */
        redirect_url: `${siteUrl}/checkout/success?ref=${reference}`,
      }),
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) {
      /* Log the provider's reason for whoever runs the shop; never show it to
         the customer, and never log the key or the card. */
      console.error("checkout: SumUp rejected", res.status, await res.text());
      return Response.json(
        { ok: false, error: "Checkout could not be started just now." },
        { status: 502 },
      );
    }

    const checkout = (await res.json()) as {
      hosted_checkout_url?: string;
      id?: string;
    };

    const url = checkout.hosted_checkout_url;
    if (!url) {
      console.error("checkout: SumUp returned no hosted_checkout_url", checkout.id);
      return Response.json(
        { ok: false, error: "Checkout could not be started just now." },
        { status: 502 },
      );
    }

    return Response.json({ ok: true, url, reference });
  } catch (err) {
    console.error("checkout: threw", err);
    return Response.json(
      { ok: false, error: "Checkout could not be started just now." },
      { status: 502 },
    );
  }
}
