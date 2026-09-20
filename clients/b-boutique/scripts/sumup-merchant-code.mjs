#!/usr/bin/env node
/* Read the merchant code that belongs to a SumUp API key.
 *
 *   SUMUP_API_KEY=sup_sk_... node scripts/sumup-merchant-code.mjs
 *
 * Why this exists: SUMUP_MERCHANT_CODE is one of the three variables the
 * checkout needs, and asking a shop owner to go and find it in a dashboard is
 * a round trip that can take days. The key already knows it.
 *
 * GET /v0.1/memberships lists the memberships of whoever the key belongs to,
 * and each membership's `resource.id` IS the merchant code (SumUp's own
 * example is M2DDT39A). Verified against sumup/sumup-openapi, not from
 * memory. The endpoint wants the `user.profile` or `user.profile_readonly`
 * scope; a key without it gets a 403 and the answer is to ask her for the
 * code the ordinary way, not to widen the key.
 *
 * ── The key ──────────────────────────────────────────────────────────────
 * Passed in the environment, never as an argument: an argument shows up in
 * `ps` and in your shell history, and this is somebody else's live credential.
 * Nothing here writes it anywhere — not to a file, not to the console, not to
 * an error message. It is read, used once, and the process exits.
 *
 * Run it from a normal machine. This sandbox's egress policy blocks
 * api.sumup.com, so it will fail here with a proxy error rather than a real
 * answer — and a failure to REACH SumUp is reported as exactly that, never as
 * "no merchant found". */

const key = process.env.SUMUP_API_KEY;

if (!key) {
  console.error(
    "\nNo SUMUP_API_KEY in the environment.\n\n" +
      "  SUMUP_API_KEY=sup_sk_... node scripts/sumup-merchant-code.mjs\n\n" +
      "Put it in front of the command like that rather than in a file, so it\n" +
      "is not saved anywhere. On most shells, a leading space keeps the line\n" +
      "out of your history too.\n",
  );
  process.exit(1);
}

let res;
try {
  res = await fetch("https://api.sumup.com/v0.1/memberships?limit=25", {
    headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
} catch (err) {
  /* A network failure is not an answer about her account. Say so plainly. */
  console.error(`\nCould not reach api.sumup.com: ${err.message}`);
  console.error("The key was not checked. Nothing is known either way.\n");
  process.exit(1);
}

/* Something between here and SumUp can answer with an HTTP status of its own.
   This sandbox's egress proxy returns a bare `403 Forbidden` as text/plain,
   which the first version of this script reported as "the key is valid but not
   allowed" — a confident, wrong statement about her account made by a proxy
   she has never heard of. SumUp's own errors are always
   application/problem+json, so anything else did not come from SumUp. */
const ct = res.headers.get("content-type") ?? "";
if (!res.ok && !ct.includes("json")) {
  console.error(
    `\nSomething between this machine and SumUp answered ${res.status} ` +
      `${res.statusText} (${ct || "no content type"}).\n` +
      "That is not SumUp. A proxy, a firewall or a captive network is in the\n" +
      "way. The key was not checked — nothing is known about it either way.\n",
  );
  process.exit(1);
}

if (!res.ok) {
  const hint =
    res.status === 401
      ? "The key was rejected, OR it is missing the user.profile scope — SumUp returns 401 for both. Check it was copied whole and still exists in the dashboard; if it does, ask her for the merchant code directly instead."
      : res.status === 403
        ? "The key is valid but not allowed to read the account profile. Ask her for the merchant code directly instead — it is on her SumUp profile."
        : "";
  console.error(`\nSumUp answered ${res.status} ${res.statusText}. ${hint}\n`);
  process.exit(1);
}

const body = await res.json();
const items = Array.isArray(body?.items) ? body.items : [];

/* Only merchant accounts carry a merchant code; an `organization` membership
   is a different kind of resource and its id is not what the checkout wants. */
const merchants = items.filter((m) => m?.resource?.type === "merchant");

if (merchants.length === 0) {
  console.error(
    "\nThe key works, but it is not a member of any merchant account.\n" +
      "That is unexpected — check it was made on the shop's own SumUp login.\n",
  );
  process.exit(1);
}

console.log("");
for (const m of merchants) {
  const flag = m.status && m.status !== "accepted" ? `  [${m.status}]` : "";
  console.log(`  SUMUP_MERCHANT_CODE=${m.resource.id}`);
  console.log(`  ${m.resource.name ?? "(no name)"}${flag}\n`);
}

if (merchants.length > 1) {
  console.log(
    "  More than one merchant account is on this login. Take the one whose\n" +
      "  name is the shop — do not guess, ask.\n",
  );
}
