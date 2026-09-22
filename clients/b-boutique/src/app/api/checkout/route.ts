import type { NextRequest } from "next/server";

import { deliveryFor, productBySlug } from "@/lib/catalogue";
import { countsFor } from "@/lib/stock";
import {
  createPendingOrder,
  releaseOrder,
  toOrderLine,
  type CustomerDetails,
} from "@/lib/orders";
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
 ── THE ORDER, AND THE RESERVATION ───────────────────────────────────────
 * Both were missing until 2026-09-22 and both are here now, in lib/orders.ts.
 *
 * An order is written BEFORE the customer is sent to pay, as `pending`, and
 * writing it takes the pieces off the shelf. That ordering is not arbitrary:
 * SumUp publishes no payment webhook, so the only authoritative confirmation
 * is the success page asking SumUp on the way back — and if the record were
 * only written there, every customer who paid and closed the tab would be a
 * payment with no record and nothing to pack.
 *
 * Holding the stock at this moment is also what closes the race that the
 * stock check below cannot: two people a second apart could both pass the
 * check and both be sent to pay for the same one-off piece. The reservation
 * is a decrement through `adjust`, which is one atomic statement with a CHECK
 * constraint, so the second one is refused by the database rather than by
 * timing.
 *
 * An abandoned basket therefore holds a garment off the shelf until it is
 * released. `stalePendingOrders` and the sweep that reads it are what put it
 * back.
 *
 * WHAT IS STILL MISSING BEFORE THIS CAN TAKE REAL MONEY:
 *   - Real prices for 13 of the 54 colourways. The guard below refuses them.
 *   - The SumUp round trip has never been run against real keys.
 */

type Line = {
  slug?: unknown;
  size?: unknown;
  colour?: unknown;
  qty?: unknown;
};

/** The same four checks the bag makes, applied again where it counts.
 *
 *  Thin on purpose. British addresses are genuinely strange — "Flat 2, above
 *  the bakery" is a real address — and a regex tidy enough to reject that
 *  loses a sale to look neat. The one outcome that must not happen is a
 *  payment taken with no way to reach the customer or post the parcel, and
 *  these four checks are exactly that and nothing more. */
function readCustomer(
  raw: unknown,
): { ok: true; value: CustomerDetails } | { ok: false; error: string } {
  const c = (raw ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  const value: CustomerDetails = {
    name: str(c.name).slice(0, 100),
    email: str(c.email).slice(0, 200),
    address: str(c.address).slice(0, 500),
    postcode: str(c.postcode).slice(0, 12),
    /* Optional. The same rule as DeliveryDetails' phoneProblem, restated
       here because a browser can skip its own check. */
    phone: str(c.phone).slice(0, 20),
  };

  if (value.name.length < 2) return { ok: false, error: "Please give the name the parcel goes to." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email))
    return { ok: false, error: "Please give an email address we can send the confirmation to." };
  if (value.address.length < 10)
    return { ok: false, error: "Please give the full address, including the house number and street." };
  if (value.postcode.length < 5) return { ok: false, error: "Please give the postcode." };
  if (value.phone) {
    const digits = value.phone.replace(/\D/g, "").length;
    if (!/^[0-9+()\-\s]+$/.test(value.phone) || digits < 10 || digits > 15)
      return { ok: false, error: "That phone number does not look complete — check it, or leave it blank." };
  }

  return { ok: true, value };
}

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
  let body: { lines?: unknown; customer?: unknown };
  try {
    body = (await request.json()) as { lines?: unknown; customer?: unknown };
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

  /* Checked BEFORE the bag is priced and long before anything is reserved.
     A payment taken with no name and no address is money the shop cannot
     turn into a parcel, and the bag's own copy of these checks is a
     courtesy — anything a browser validates, a browser can skip. */
  const customer = readCustomer(body.customer);
  if (!customer.ok) {
    return Response.json({ ok: false, error: customer.error }, { status: 400 });
  }

  /* Price it here, from here. */
  let subtotalP = 0;
  const priced: {
    slug: string;
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
      slug,
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

  /* Write it down and hold the stock, BEFORE the customer leaves for SumUp.
     See the note at the top: a record written on the way back is a record
     that never exists for anybody who pays and closes the tab, and a
     reservation taken after payment is not a reservation at all. */
  const order = await createPendingOrder({
    reference,
    customer: customer.value,
    lines: priced.map((l) =>
      toOrderLine({
        slug: l.slug,
        name: l.name,
        size: l.size,
        colour: l.colour,
        qty: l.qty,
        priceP: l.priceP,
        describe: describe(l),
      }),
    ),
    subtotalP,
    deliveryP: deliveryFor(subtotalP),
    totalP,
  });

  if (!order.ok) {
    if (order.code === "sold_out") {
      /* Somebody else got there between the stock check above and this
         moment. That window is exactly what the reservation exists to close,
         and this is it closing. */
      return Response.json(
        {
          ok: false,
          code: "out_of_stock",
          error: `${order.describe} has just sold. Please remove it from your bag.`,
        },
        { status: 409 },
      );
    }
    /* No database. The stock check above already fails closed for the same
       reason, and taking a payment we cannot write down is worse than not
       taking it. */
    console.error("checkout: could not write the order", order.code);
    return Response.json(
      { ok: false, error: "Checkout could not be started just now." },
      { status: 503 },
    );
  }

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
      /* Put the garment straight back. The sweep would get to it in half an
         hour, but a piece held off the shelf because a payment provider said
         no is half an hour of a one-off coat nobody can buy. */
      await releaseOrder(reference, "failed", "payment provider refused the checkout");
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
      await releaseOrder(reference, "failed", "no hosted checkout url returned");
      return Response.json(
        { ok: false, error: "Checkout could not be started just now." },
        { status: 502 },
      );
    }

    return Response.json({ ok: true, url, reference });
  } catch (err) {
    console.error("checkout: threw", err);
    /* Best effort. If this release fails too the sweep still picks the order
       up, which is why the sweep exists rather than being a nicety. */
    await releaseOrder(reference, "failed", "checkout threw").catch(() => {});
    return Response.json(
      { ok: false, error: "Checkout could not be started just now." },
      { status: 502 },
    );
  }
}
