import "server-only";

import { formatPrice } from "./catalogue";
import { shop } from "./shop";
import type { Order } from "./orders";

/* Sending email.
 *
 * ── Why this is not the Resend SDK ───────────────────────────────────────
 * /api/contact has posted to Resend's HTTP API over `fetch` since it was
 * built, for one dependency fewer. This lifts that out so the order emails
 * use the same path rather than growing a second one, and so there is one
 * place that knows the shop cannot send mail yet.
 *
 * ── It never pretends ────────────────────────────────────────────────────
 * `sendMail` returns false when the shop has no mail configured or the
 * provider refuses. It never throws into a caller that is in the middle of
 * confirming a payment: a customer whose money has gone through must not see
 * an error page because an email bounced. The caller logs it and carries on,
 * and the order is on her Orders screen either way — the email is the nudge,
 * the database is the record.
 */

export function mailIsConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_FROM);
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;
  if (!apiKey || !from) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [opts.to],
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
        subject: opts.subject,
        /* Plain text only, as everywhere else on this site. No template to
           maintain, and nothing anybody typed can become markup in an
           inbox. */
        text: opts.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      console.error("mail: provider rejected", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("mail: threw", err);
    return false;
  }
}

/** The order as a plain list, used in both emails so the shop and the
 *  customer are reading the same thing. */
function lineList(order: Order): string {
  return order.lines
    .map((l) => {
      const flag = l.reserved ? "" : "   ** not counted — check the rail **";
      return `  ${l.qty} x ${l.describe} — ${formatPrice(l.priceP * l.qty)}${flag}`;
    })
    .join("\n");
}

/** Tell the shop. This is the thing that answers "how would she know?" —
 *  without it an order sits in a database nobody has opened. */
export async function notifyShopOfOrder(order: Order): Promise<boolean> {
  const to = process.env.CONTACT_TO;
  if (!to) return false;

  return sendMail({
    to,
    /* The reference is in the subject so she can search her inbox for it when
       a customer rings up quoting it. */
    subject: `New online order ${order.reference} — ${formatPrice(order.totalP)}`,
    /* Reply goes straight to the customer. When somebody needs telling their
       piece has sold, the shop should be one tap from saying so. */
    replyTo: order.email,
    text: [
      `A new order has been paid for on the website.`,
      ``,
      `WHAT TO PACK`,
      lineList(order),
      ``,
      `POST IT TO`,
      `  ${order.name}`,
      ...order.address.split("\n").map((l) => `  ${l}`),
      `  ${order.postcode}`,
      ``,
      `Subtotal   ${formatPrice(order.subtotalP)}`,
      `Delivery   ${formatPrice(order.deliveryP)}`,
      `Total      ${formatPrice(order.totalP)}`,
      ``,
      `Reference  ${order.reference}`,
      `Email      ${order.email}`,
      ``,
      `The stock count has already come down for every line above that was`,
      `counted. Any line marked "not counted" has NOT moved, because nobody`,
      `has counted that size yet — check the rail before you post it.`,
      ``,
      `Mark it posted on the shop's own page when it goes in the post.`,
    ].join("\n"),
  });
}

/** Tell the customer. Their receipt, and the only written record they get of
 *  what they bought and what it cost. */
export async function confirmOrderToCustomer(order: Order): Promise<boolean> {
  return sendMail({
    to: order.email,
    subject: `Your B Boutique order ${order.reference}`,
    /* So a reply reaches the shop rather than a no-reply void. */
    replyTo: process.env.CONTACT_TO || shop.email,
    text: [
      `Thank you — your order has been paid for.`,
      ``,
      lineList(order).replace(/ {3}\*\* not counted.*$/gm, ""),
      ``,
      `Subtotal   ${formatPrice(order.subtotalP)}`,
      `Delivery   ${formatPrice(order.deliveryP)}`,
      `Total      ${formatPrice(order.totalP)}`,
      ``,
      `Going to`,
      `  ${order.name}`,
      ...order.address.split("\n").map((l) => `  ${l}`),
      `  ${order.postcode}`,
      ``,
      `Your reference is ${order.reference}. Please quote it if you get in touch.`,
      ``,
      `Everything in the shop is picked one piece at a time, so your order is`,
      `packed by hand. It goes by Royal Mail.`,
      ``,
      /* The 14-day cancellation right has to be given in a durable medium —
         an email the customer keeps — not only on a web page they visited
         once. Consumer Contracts Regulations 2013. Saying it here is not a
         courtesy; leaving it out extends the cancellation window. */
      `You have 14 days from receiving your order to change your mind and`,
      `send it back. Full details are on the website under Returns.`,
      ``,
      `B Boutique`,
      `${shop.street}, ${shop.town}, ${shop.postcode}`,
      shop.email,
    ].join("\n"),
  });
}
