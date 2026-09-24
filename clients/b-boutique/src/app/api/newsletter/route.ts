import type { NextRequest } from "next/server";

/* Newsletter sign-up (2026-09-24, Brad: "first to see new arrivals").
 *
 * Adds the address to a Resend audience. Needs two server-only variables:
 * RESEND_API_KEY (already used by the contact form) and RESEND_AUDIENCE_ID.
 * Without the second it answers 503 and the form says sign-ups are not open,
 * so it can never report a success that went nowhere. Validated here, not
 * only in the browser; a hidden honeypot field and a per-IP limit keep bots
 * from filling the list. */
export const dynamic = "force-dynamic";

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; company?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (typeof body?.company === "string" && body.company) return Response.json({ ok: true });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return Response.json({ ok: false, error: "slow-down" }, { status: 429 });

  const key = process.env.RESEND_API_KEY;
  const audience = process.env.RESEND_AUDIENCE_ID;
  if (!key || !audience) return Response.json({ ok: false, error: "not-open" }, { status: 503 });

  try {
    const res = await fetch(`https://api.resend.com/audiences/${audience}/contacts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email, unsubscribed: false }),
    });
    if (!res.ok) {
      console.error("newsletter: provider refused", res.status);
      return Response.json({ ok: false, error: "failed" }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("newsletter: request failed", err);
    return Response.json({ ok: false, error: "failed" }, { status: 502 });
  }
}
