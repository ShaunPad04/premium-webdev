import type { NextRequest } from "next/server";

import { deliveryFor, productBySlug } from "@/lib/catalogue";
import { countsFor } from "@/lib/stock";
import { coloursFor, variantId } from "@/lib/variants";

/* Start a payment.
 *
 * ── THE RULE ──────────────────────────────────────────────────────────────
 * The browser sends slugs, sizes, colours and quantities. It does NOT send
 * prices and it does NOT send a total, and if it did they would be ignored. Anything the
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
 *   - A RESERVATION. Stock is now CHECKED here (see below) but not held: two
 *     people can pass the check a second apart and both be sent to pay for
 *     the same one-off piece. Nothing decrements on payment either — the
 *     count only moves when somebody taps it in /stock. Closing this properly
 *     means reserving the variant before the redirect and releasing it if the
 *     payment is abandoned, which needs the order record below.
 *   - An order record. Nothing is written down, so nothing can be picked,
 *     packed, refunded or audited. That needs somewhere to store it.
 *   - Delivery, returns, terms and a privacy notice — legally required for
 *     distance selling in the UK, including the 14-day cancellation right.
 */

type Line = {
  slug?: unknown;
  size?: unknown;
  colour?: unknown;
  qty?: unknown;
};

/** The piece as a customer would say it back: name, size, colour — and only
 *  the parts that exist. "One size" and a blank colour say nothing. */
function describe(l: { name: string; size: string; colour: string }): string {
  const detail = [l.size === "One size" ? "" : l.size, l.colour]
    .filter(Boolean)
    .join(", ");
  return detail ? `${l.name} (${detail})` : l.name;
}

const MAX_LINES = 25;
/* Six, not ten.
   Ten was a round number picked before anybody knew what this shop holds.
   Her opening counts run 1 to 6 per colourway across all 54 of them, so ten
   let a customer put more of a piece in the bag than the shop has ever owned
   — and on a rail where most lines are one or two, that is not a theoretical
   limit, it is the ordinary case.

   This is a CEILING, not the stock check. The real gate is `countsFor` in
   /api/checkout, which refuses to sell more of a variant than the database
   says exists and fails closed if the database errors. That gate has been
   right since 2026-09-20 and has simply had nothing to check against, because
   the stock table is empty. scripts/import-stock.mjs fills it. */
const MAX_QTY = 6;

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
  const priced: {
    name: string;
    size: string;
    colour: string;
    qty: number;
    priceP: number;
    variant: string;
  }[] = [];

  for (const raw of body.lines as Line[]) {
    const slug = typeof raw?.slug === "string" ? raw.slug : "";
    const size = typeof raw?.size === "string" ? raw.size : "";
    const colour = typeof raw?.colour === "string" ? raw.colour : "";
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
    /* The colour has to be one this piece is actually sold in. A piece with
       no confirmed colour is sold in exactly one "colour" — the blank one —
       so a browser sending "black" for it is rejected rather than quietly
       accepted and printed on a receipt nobody can honour. */
    if (!coloursFor(slug).includes(colour)) {
      return Response.json(
        { ok: false, error: `That colour is not available for ${product.name}.` },
        { status: 409 },
      );
    }
    if (!Number.isFinite(qty) || qty < 1 || qty > MAX_QTY) {
      return Response.json(
        { ok: false, error: "That quantity is not available." },
        { status: 409 },
      );
    }

    /* ── A placeholder price must never reach a payment ──────────────────
     *
     * Eight of the 32 pieces still have at least one colourway the client
     * has not priced. `demo` is true for those, and until now NOTHING on the
     * server looked at it: this route priced the bag straight out of the
     * catalogue and posted `amount: totalP / 100` to SumUp. The invented
     * figure would have been charged.
     *
     * The product page does already refuse — it prints "Price to confirm"
     * and renders no Add to bag button at all, which is verified. That
     * counts for nothing here, and this codebase has already written down
     * why, about /stock: authorisation is checked on every request and never
     * inferred from the UI hiding a control. Two ways past the page exist
     * without anybody being malicious — a bag saved in localStorage while
     * the piece was still priced, and a request typed by hand.
     *
     * Under the Consumer Protection from Unfair Trading Regulations a
     * displayed price is what a customer is entitled to pay, and a price
     * nobody agreed is one the shop would have to honour or refund.
     *
     * The only thing standing between this and a real card today is that
     * NEXT_PUBLIC_SITE_URL is unset, and setting that one variable is the
     * documented step that turns the shop on. It must not be the thing
     * holding this back. */
    if (product.demo) {
      return Response.json(
        {
          ok: false,
          code: "price_unconfirmed",
          error: `${product.name} does not have a confirmed price yet, so it cannot be bought online. Please remove it from your bag — the shop can take it over the counter.`,
        },
        { status: 409 },
      );
    }

    subtotalP += product.priceP * qty;
    priced.push({
      name: product.name,
      size,
      colour,
      qty,
      priceP: product.priceP,
      variant: variantId(slug, size, colour),
    });
  }

  /* ── Stock, checked here and not taken on trust ─────────────────────────
   * The product page already greys out a sold-out size, and that counts for
   * nothing: anything a browser is told, a browser can ignore. This is the
   * check that matters, and it runs in the last moment before a payment is
   * created rather than when the page was built — somebody can have the bag
   * open for an hour while the piece sells over the counter.
   *
   * ── "Never counted" is allowed through, deliberately ────────────────────
   * A variant with no row has never been counted by anybody. Refusing those
   * would close the entire shop today, because not one line has been counted
   * yet — and it would do it by asserting a fact ("there are none") that
   * nobody has established. The honest reading of an uncounted line is that
   * the website does not know, and the existing behaviour for what the
   * website does not know is to take the order and let the shop confirm.
   *
   * That is a real oversell risk and it is named rather than hidden: it
   * closes when the counts are in, which is `/stock` and a person, not code.
   * A count of zero, by contrast, is somebody's explicit statement that the
   * rail is empty, and it stops the sale. */
  try {
    const counts = await countsFor(priced.map((l) => l.variant));
    if (counts) {
      for (const line of priced) {
        const have = counts.get(line.variant);
        if (have === undefined) continue;
        if (have < line.qty) {
          return Response.json(
            {
              ok: false,
              code: "out_of_stock",
              /* Names the piece, never the number. A count is not something
                 a visitor is told on this site even when it is true and even
                 when it would be convenient here — see the rule in
                 /api/availability. "Not that many" is enough to act on. */
              error:
                have === 0
                  ? `${describe(line)} has just sold. Please remove it from your bag.`
                  : `There are not that many of ${describe(line)} left. Please lower the quantity.`,
            },
            { status: 409 },
          );
        }
      }
    }
  } catch (err) {
    /* A stock database that is down must not take money it cannot check
       against. This is the one place that fails CLOSED, because the failure
       on the other side is charging somebody for a garment that is gone. */
    console.error("checkout: stock check failed", err);
    return Response.json(
      {
        ok: false,
        error:
          "We could not check what is left in the shop just now, so nothing has been charged. Please try again in a moment.",
      },
      { status: 503 },
    );
  }

  /* Delivery is worked out here, on the server, from the server-priced
     subtotal — never taken from the browser. Same function the bag uses. */
  const totalP = subtotalP + deliveryFor(subtotalP);

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
          .map((l) => `${l.qty} x ${describe(l)}`)
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
