import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/** Who is allowed to change what is in the shop.
 *
 *  ── Why a shared passphrase and not accounts ─────────────────────────────
 *  The people who need this are the owner and whoever is serving the counter
 *  — a handful, in one room, who already share the till. Building usernames,
 *  password resets and a user table for that would be security theatre: more
 *  code, more to go wrong, and no more actual protection than one passphrase
 *  she can change by asking. The threat here is a stranger finding the URL,
 *  not an insider, and one passphrase answers that.
 *
 *  What it must NOT become is a login that protects money. It does not touch
 *  payments, cannot read a card, and cannot see an order's payment details.
 *  The worst a stolen passphrase does is make her stock counts wrong, which
 *  the log in `stock.ts` makes visible and reversible.
 *
 *  ── The cookie ───────────────────────────────────────────────────────────
 *  Signed with HMAC over the issue time, so it cannot be forged by anyone who
 *  does not have the secret, and expires on its own. HttpOnly so no script
 *  can read it, SameSite=Lax so another site cannot make her browser act as
 *  her, Secure in production.
 *
 *  ── Until it is configured ───────────────────────────────────────────────
 *  STOCK_PASSPHRASE is unset today. The page then refuses everyone, including
 *  her, and says so — rather than letting anybody in. A page that defaults to
 *  open when its configuration is missing is the wrong way round.
 */

const COOKIE = "bb_stock";
const MAX_AGE_S = 60 * 60 * 12; // a working day, then she signs in again

function secret(): string | null {
  const s = process.env.STOCK_PASSPHRASE;
  return s && s.length >= 8 ? s : null;
}

export function stockAuthIsConfigured(): boolean {
  return secret() !== null;
}

function sign(issuedAt: number, key: string): string {
  return createHmac("sha256", key).update(String(issuedAt)).digest("hex");
}

/** Constant-time compare, so the number of matching characters cannot be
 *  learned from how long the comparison took. Overkill for a shop's stock
 *  page; it is two lines and the habit is worth more than the two lines. */
function same(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function makeToken(key: string): string {
  const now = Math.floor(Date.now() / 1000);
  return `${now}.${sign(now, key)}`;
}

export function tokenIsValid(token: string | undefined, key: string): boolean {
  if (!token) return false;
  const [issuedRaw, mac] = token.split(".");
  const issued = Number.parseInt(issuedRaw ?? "", 10);
  if (!Number.isFinite(issued) || !mac) return false;
  if (Math.floor(Date.now() / 1000) - issued > MAX_AGE_S) return false;
  return same(mac, sign(issued, key));
}

/** Is whoever is asking allowed to change stock? */
export async function isSignedIn(): Promise<boolean> {
  const key = secret();
  if (!key) return false;
  const jar = await cookies();
  return tokenIsValid(jar.get(COOKIE)?.value, key);
}

export async function signIn(passphrase: string): Promise<boolean> {
  const key = secret();
  if (!key) return false;
  if (!same(passphrase, key)) return false;

  const jar = await cookies();
  jar.set(COOKIE, makeToken(key), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/stock",
    maxAge: MAX_AGE_S,
  });
  return true;
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  jar.delete({ name: COOKIE, path: "/stock" });
}

/* ── Rate limiting ───────────────────────────────────────────────────────
 * Same honest limitation as the contact form's: serverless functions scale
 * out, so this bounds one instance rather than the endpoint, and it resets on
 * a cold start. It still stops the obvious case — a script guessing the
 * passphrase against one warm instance — and costs nothing. A passphrase long
 * enough to matter is the real defence. */
const attempts = new Map<string, { n: number; first: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_TRIES = 10;

export function tooManyAttempts(ip: string): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(ip, { n: 1, first: now });
    return false;
  }
  rec.n += 1;
  return rec.n > MAX_TRIES;
}
