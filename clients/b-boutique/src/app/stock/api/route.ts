import type { NextRequest } from "next/server";
import { adjust, setCount, setRestockable, stockIsConfigured } from "@/lib/stock";
import { isSignedIn, signIn, signOut, stockAuthIsConfigured, tooManyAttempts } from "@/lib/stock-auth";

/** Every change to what is in the shop comes through here.
 *
 *  ── The rule ─────────────────────────────────────────────────────────────
 *  Authorisation is checked on the request, every time, and never inferred
 *  from the page having rendered a button. Hiding a control is a courtesy to
 *  the person looking at it, not a control — anyone can POST here directly.
 *
 *  ── Why the actions are named, not free-form ─────────────────────────────
 *  "sold", "returned", "counted" and "received" are four different statements
 *  about the shop and each is written to the log as itself. A single "set qty
 *  to N" endpoint would collapse them into one and throw away the only thing
 *  that makes a wrong count explainable afterwards.
 */

type Body = {
  action?: unknown;
  id?: unknown;
  qty?: unknown;
  value?: unknown;
  passphrase?: unknown;
  remember?: unknown;
  note?: unknown;
};

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function json(body: unknown, status: number) {
  return Response.json(body, { status });
}

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json({ ok: false, code: "bad_request" }, 400);
  }

  const action = str(body.action);

  /* Signing in is the one action available to somebody not yet signed in. */
  if (action === "sign-in") {
    if (!stockAuthIsConfigured()) {
      return json({ ok: false, code: "not_configured" }, 503);
    }
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (tooManyAttempts(ip)) {
      return json({ ok: false, code: "too_many_attempts" }, 429);
    }
    const ok = await signIn(str(body.passphrase), body.remember === true);
    /* No detail about why. "Wrong passphrase" and "no passphrase set" are the
       same answer to someone guessing. */
    return json({ ok }, ok ? 200 : 401);
  }

  if (action === "sign-out") {
    await signOut();
    return json({ ok: true }, 200);
  }

  if (!(await isSignedIn())) {
    return json({ ok: false, code: "not_signed_in" }, 401);
  }

  if (!stockIsConfigured()) {
    return json({ ok: false, code: "not_configured" }, 503);
  }

  const id = str(body.id);
  if (!id) return json({ ok: false, code: "bad_request" }, 400);
  const note = str(body.note) || undefined;

  switch (action) {
    /* The one she will use a hundred times more than any other. */
    case "sold-in-shop":
      return respond(await adjust(id, -1, "sold-in-shop", note));

    case "returned":
      return respond(await adjust(id, +1, "returned", note));

    case "received":
      return respond(await adjust(id, +1, "received", note));

    /* A stocktake, not a sale. Different statement, different log line. */
    case "counted": {
      const qty = typeof body.qty === "number" ? body.qty : Number.NaN;
      if (!Number.isInteger(qty) || qty < 0 || qty > 9999) {
        return json({ ok: false, code: "bad_request" }, 400);
      }
      return respond(await setCount(id, qty, note));
    }

    case "restockable": {
      const value = body.value === true;
      const ok = await setRestockable(id, value);
      return json({ ok }, ok ? 200 : 400);
    }

    default:
      return json({ ok: false, code: "bad_request" }, 400);
  }
}

function respond(result: Awaited<ReturnType<typeof adjust>>) {
  if (result.ok) return json({ ok: true, qty: result.qty }, 200);
  const status =
    result.code === "not_configured" ? 503 : result.code === "would_go_negative" ? 409 : 400;
  return json(result, status);
}
