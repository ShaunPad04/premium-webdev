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

/** Two session lengths, and the choice is the shop's.
 *
 *  Twelve hours was the only option at first, and it was wrong for the actual
 *  job: she is at a counter with customers waiting, and a passcode prompt
 *  between her and marking a coat sold is a prompt she will skip — which puts
 *  the website back to overselling, the one thing this page exists to stop.
 *  A control that is slow at the moment it is needed does not get used.
 *
 *  So "keep me signed in" is a real ninety days on her own phone, and the
 *  short session stays for a borrowed or shared device.
 *
 *  What makes ninety days defensible: this passcode reaches stock counts and
 *  nothing else — no payment, no card, no order, no customer's details. Every
 *  change it can make is written to `stock_log` with what happened and when,
 *  so it is visible and reversible. And changing STOCK_PASSPHRASE invalidates
 *  every outstanding session immediately, because the secret is the HMAC key:
 *  a lost phone is one environment variable away from being locked out. */
const SHORT_S = 60 * 60 * 12;        // a working day
const REMEMBER_S = 60 * 60 * 24 * 90; // her own phone

function secret(): string | null {
  const s = process.env.STOCK_PASSPHRASE;
  return s && s.length >= 8 ? s : null;
}

export function stockAuthIsConfigured(): boolean {
  return secret() !== null;
}

/* The lifetime is signed along with the issue time, so it can be read back
   and trusted. Putting the age in the cookie WITHOUT signing it would let
   anyone holding a twelve-hour token rewrite it into a ninety-day one. */
function sign(issuedAt: number, ttl: number, key: string): string {
  return createHmac("sha256", key).update(`${issuedAt}.${ttl}`).digest("hex");
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

export function makeToken(key: string, ttl: number): string {
  const now = Math.floor(Date.now() / 1000);
  return `${now}.${ttl}.${sign(now, ttl, key)}`;
}

export function tokenIsValid(token: string | undefined, key: string): boolean {
  if (!token) return false;
  const [issuedRaw, ttlRaw, mac] = token.split(".");
  const issued = Number.parseInt(issuedRaw ?? "", 10);
  const ttl = Number.parseInt(ttlRaw ?? "", 10);
  if (!Number.isFinite(issued) || !Number.isFinite(ttl) || !mac) return false;
  /* The signature is checked against the ttl that came with the token, so a
     forged lifetime fails here rather than being honoured. Clamped anyway:
     a signature can only ever have been made by us, but a bug on our side
     should not be able to mint a ten-year session. */
  if (ttl > REMEMBER_S) return false;
  if (Math.floor(Date.now() / 1000) - issued > ttl) return false;
  return same(mac, sign(issued, ttl, key));
}

/** Is whoever is asking allowed to change stock? */
export async function isSignedIn(): Promise<boolean> {
  const key = secret();
  if (!key) return false;
  const jar = await cookies();
  return tokenIsValid(jar.get(COOKIE)?.value, key);
}

export async function signIn(
  passphrase: string,
  remember = false,
): Promise<boolean> {
  const key = secret();
  if (!key) return false;
  if (!same(passphrase, key)) return false;

  const ttl = remember ? REMEMBER_S : SHORT_S;
  const jar = await cookies();
  jar.set(COOKIE, makeToken(key, ttl), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    /* Scoped to /stock: the cookie is never sent with a request for the shop
       itself, so a customer browsing the site never carries it. */
    path: "/stock",
    maxAge: ttl,
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
