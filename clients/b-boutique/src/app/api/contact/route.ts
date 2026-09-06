import type { NextRequest } from "next/server";

/* The contact form's destination.
 *
 * ── THE ONE RULE THIS FILE EXISTS TO ENFORCE ──────────────────────────────
 * A form that reports success while sending nowhere is worse than no form at
 * all: the customer believes they have been in touch, and the shop never
 * hears from them. So this endpoint NEVER returns success unless a message
 * was actually accepted for delivery by the mail provider.
 *
 * Right now it cannot be: nobody has supplied an inbox address. shop.email is
 * empty, deliberately, and no address has been guessed. Until CONTACT_TO and
 * RESEND_API_KEY are set in the environment, this route answers 503 with
 * `code: "not_configured"`, and the form tells the visitor plainly that the
 * message did not send and gives them the phone number instead. That is a
 * launch BLOCKER, and it is designed to be loud rather than quiet.
 *
 * ── Validation ────────────────────────────────────────────────────────────
 * Independently of the browser. The client checks the same things for a fast,
 * accessible experience; this checks them again because a client check is a
 * convenience, not a control — anyone can POST here directly.
 *
 * ── Delivery ──────────────────────────────────────────────────────────────
 * Resend's HTTP API over fetch, rather than the SDK. One less dependency for
 * a single POST, and nothing in the SDK is needed here.
 *
 * The visitor's address goes in reply_to, never in `from`: sending as them
 * would fail SPF/DKIM for their domain and land the shop's mail in spam.
 */

const MAX = { name: 100, email: 200, message: 4000 } as const;
const MIN_MESSAGE = 10;

/* Deliberately permissive. Email validation by regex cannot be both strict and
   correct — the grammar allows far more than anyone expects — so this rejects
   only what is obviously not an address and leaves the real check to whether
   the reply bounces. A stricter pattern's failure mode is refusing a real
   customer's real address, which is worse than accepting a typo. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Body = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  /** Honeypot. A real person never sees this field and never fills it in. */
  company?: unknown;
};

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/* A crude per-instance limiter. It is honest about what it is: serverless
   functions scale out, so this bounds one instance rather than the endpoint,
   and it resets on a cold start. That still stops the obvious case — one
   script hammering one warm instance — and costs nothing. Anything stronger
   needs shared state (a KV store), which is not worth adding to a brochure
   site until there is traffic to justify it. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  /* Keep the map from growing without bound on a long-lived instance. */
  if (hits.size > 500) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json(
      { ok: false, code: "bad_request", error: "Could not read that request." },
      { status: 400 },
    );
  }

  const name = str(body.name);
  const email = str(body.email);
  const message = str(body.message);
  const honeypot = str(body.company);

  /* Answer a bot with the same 200 a person gets. Telling it which check it
     failed is free tuning information for whoever wrote it, and nothing was
     sent either way. */
  if (honeypot) return Response.json({ ok: true });

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Please tell us your name.";
  else if (name.length > MAX.name) errors.name = "That name is too long.";

  if (!email) errors.email = "We need an email address to reply to.";
  else if (email.length > MAX.email || !EMAIL.test(email))
    errors.email = "That does not look like an email address.";

  if (!message) errors.message = "Please write a message.";
  else if (message.length < MIN_MESSAGE)
    errors.message = "Please write a little more so we can help.";
  else if (message.length > MAX.message)
    errors.message = "That message is too long to send.";

  if (Object.keys(errors).length) {
    return Response.json({ ok: false, code: "invalid", errors }, { status: 422 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return Response.json(
      {
        ok: false,
        code: "rate_limited",
        error: "That is a lot of messages at once. Please try again shortly.",
      },
      { status: 429 },
    );
  }

  const to = process.env.CONTACT_TO;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;

  if (!to || !apiKey || !from) {
    /* The honest failure. Nothing was sent, so nothing pretends otherwise. */
    return Response.json(
      {
        ok: false,
        code: "not_configured",
        error:
          "This form is not connected to an inbox yet, so the message was not sent.",
      },
      { status: 503 },
    );
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Website enquiry — ${name}`,
        /* Plain text only. There is no HTML template to maintain and no way
           for the visitor's words to become markup in the shop's inbox. */
        text: [
          `From: ${name} <${email}>`,
          `Sent from the B Boutique website contact form.`,
          "",
          message,
        ].join("\n"),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      /* Log the provider's reason for the operator; never show it to the
         visitor, and never include the API key or their message. */
      console.error("contact: provider rejected", res.status, await res.text());
      return Response.json(
        {
          ok: false,
          code: "send_failed",
          error: "The message could not be sent just now.",
        },
        { status: 502 },
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("contact: send threw", err);
    return Response.json(
      {
        ok: false,
        code: "send_failed",
        error: "The message could not be sent just now.",
      },
      { status: 502 },
    );
  }
}
