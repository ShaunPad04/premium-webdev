/** Asking SumUp what actually happened to a payment.
 *
 *  SERVER ONLY. Nothing here may be imported into a Client Component: it
 *  reads SUMUP_API_KEY, and anything a client component imports is compiled
 *  into the bundle the browser downloads. The `server-only` package would
 *  make that a build error rather than a convention; it is not a dependency
 *  of this project and one line of prose is not worth adding one for a file
 *  with a single caller. If a second caller ever appears, add it.
 *
 *  ── Why this exists ──────────────────────────────────────────────────────
 *  A customer landing on /checkout/success proves that a browser followed a
 *  URL. It does not prove that money moved — anybody can type that address,
 *  and somebody who abandons the payment page and presses Back can reach it
 *  by accident. A shop that says "thank you for your order" on that evidence
 *  is a shop that confirms orders it never took.
 *
 *  The obvious answer is a webhook, and it was the answer given before the
 *  specs were read. It is wrong here. SumUp's published webhooks
 *  (sumup/sumup-openapi and sumup/sumup-go, checked 2026-09-08) are
 *  readers.created / readers.deleted / members.created / members.updated /
 *  members.deleted — there is no payment or checkout webhook among them. The
 *  checkout's own `return_url` is documented as "Optional backend callback
 *  URL used by SumUp to notify your platform about processing updates", but
 *  no signature scheme is published for it, and an unsigned POST claiming an
 *  order is paid is not evidence.
 *
 *  So instead of being told, this asks: an authenticated GET, from our
 *  server, using our key, filtered by the reference we generated. A customer
 *  cannot forge it and does not touch it.
 *
 *  Returns null whenever the answer is not trustworthy — not configured, a
 *  network failure, a rejection, or no matching checkout. Null means "we do
 *  not know", and every caller must say that rather than guessing.
 */

/** SumUp's own vocabulary, from the Checkout schema. PAID is the only one
 *  that means money moved. */
export type CheckoutStatus = "PENDING" | "FAILED" | "PAID" | "EXPIRED";

const STATUSES: readonly string[] = ["PENDING", "FAILED", "PAID", "EXPIRED"];

/** True when all three variables the shop needs are present. Exported so a
 *  page can tell "not configured" apart from "configured and it said no". */
export function sumupIsConfigured(): boolean {
  return Boolean(
    process.env.SUMUP_API_KEY &&
      process.env.SUMUP_MERCHANT_CODE &&
      process.env.NEXT_PUBLIC_SITE_URL,
  );
}

export async function checkoutStatusByReference(
  reference: string,
): Promise<CheckoutStatus | null> {
  const apiKey = process.env.SUMUP_API_KEY;
  if (!apiKey || !reference) return null;

  /* The reference is ours — BB-<base36> — but it arrives back through a URL
     the customer can edit, so it is encoded rather than concatenated. */
  const url = `https://api.sumup.com/v0.1/checkouts?checkout_reference=${encodeURIComponent(reference)}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      /* Never cached. A payment status is the one thing on this site that
         must be read fresh every time. */
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) {
      /* Logged for whoever runs the shop; never shown to the customer, and
         never with the key in it. */
      console.error("sumup: checkout lookup failed", res.status);
      return null;
    }

    /* The endpoint lists checkouts, so this is an array even when the filter
       matches one. */
    const body: unknown = await res.json();
    const first = Array.isArray(body) ? body[0] : null;
    const status = (first as { status?: unknown } | null)?.status;

    return typeof status === "string" && STATUSES.includes(status)
      ? (status as CheckoutStatus)
      : null;
  } catch (err) {
    console.error("sumup: checkout lookup threw", err);
    return null;
  }
}
