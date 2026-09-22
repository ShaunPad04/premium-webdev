import type { NextRequest } from "next/server";

import { markPosted, ordersAreConfigured } from "@/lib/orders";
import { isSignedIn, stockAuthIsConfigured } from "@/lib/stock-auth";

/** Changes to an order, from the shop's own page.
 *
 *  ── Same rule as /api/stock ──────────────────────────────────────────────
 *  Authorisation is checked on the request, every time, and never inferred
 *  from the page having rendered a button. This one matters more than the
 *  stock board did: these rows carry customers' names and home addresses, so
 *  an unguarded route here is a personal-data leak rather than a wrong count.
 *
 *  ── Why it only marks things posted ──────────────────────────────────────
 *  There is deliberately no way to edit an order, change a total or delete a
 *  row from here. An order is a record of something that happened and money
 *  that moved; the only thing the shop does to one is put it in the post. A
 *  refund is a conversation and a SumUp action, not a button that quietly
 *  rewrites what a customer was charged.
 */

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!ordersAreConfigured() || !stockAuthIsConfigured()) {
    return Response.json({ ok: false, code: "not_configured" }, { status: 503 });
  }

  /* Before reading the body, so an unauthenticated caller learns nothing
     about what this route accepts. */
  if (!(await isSignedIn())) {
    return Response.json({ ok: false, code: "unauthorised" }, { status: 401 });
  }

  let body: { action?: unknown; reference?: unknown };
  try {
    body = (await request.json()) as { action?: unknown; reference?: unknown };
  } catch {
    return Response.json({ ok: false, code: "bad_request" }, { status: 400 });
  }

  const reference = typeof body.reference === "string" ? body.reference.trim() : "";
  if (body.action !== "posted" || !reference) {
    return Response.json({ ok: false, code: "bad_request" }, { status: 400 });
  }

  const order = await markPosted(reference);
  if (!order) {
    /* Either no such reference, or it is not a paid order. Both answer the
       same way: there is nothing here to post. */
    return Response.json({ ok: false, code: "not_found" }, { status: 404 });
  }

  return Response.json({ ok: true, postedAt: order.postedAt });
}
