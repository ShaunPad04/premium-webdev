#!/usr/bin/env node
/* Read and update the stock book on the live site (2026-10-10).
 *
 *   node scripts/stock-book.mjs list                      every entry, JSON
 *   node scripts/stock-book.mjs waiting                   only status "new"
 *   node scripts/stock-book.mjs done <id> <productUrl>    mark live
 *   node scripts/stock-book.mjs ask <id> "<question>"     ask Hayley something
 *
 * Signs in to /stock/api with STOCK_PASSPHRASE (the PIN Brad set; from the
 * environment or .env.local, never committed) and talks to /stock/api/book
 * with the cookie it gets back. BOOK_SITE overrides the site, e.g. a Vercel
 * preview URL. The PIN is sent only to that site, over https. */
import { readFileSync } from "node:fs";

const SITE = (process.env.BOOK_SITE ?? "https://bboutiqueclee.com").replace(/\/$/, "");

function passphrase() {
  if (process.env.STOCK_PASSPHRASE) return process.env.STOCK_PASSPHRASE;
  try {
    const m = readFileSync(".env.local", "utf8").match(/^STOCK_PASSPHRASE=(.*)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  } catch {}
  return "";
}

async function signIn() {
  const pin = passphrase();
  if (!pin) throw new Error("STOCK_PASSPHRASE is not set (environment or .env.local)");
  const res = await fetch(`${SITE}/stock/api`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "sign-in", passphrase: pin }),
  });
  if (!res.ok) throw new Error(`sign-in refused (${res.status})`);
  const cookie = res.headers.get("set-cookie")?.split(";")[0];
  if (!cookie) throw new Error("sign-in gave no cookie");
  return cookie;
}

async function api(cookie, method, body) {
  const res = await fetch(`${SITE}/stock/api/book`, {
    method, headers: { "Content-Type": "application/json", Cookie: cookie },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${data.code ?? res.status}`);
  return data;
}

const [cmd, id, ...rest] = process.argv.slice(2);
const cookie = await signIn();
if (cmd === "list" || cmd === "waiting") {
  const { entries } = await api(cookie, "GET");
  const out = cmd === "waiting" ? entries.filter((e) => e.status === "new") : entries;
  console.log(JSON.stringify(out, null, 2));
} else if (cmd === "done" && id && rest[0]) {
  console.log(JSON.stringify((await api(cookie, "POST", { action: "done", id, productUrl: rest[0] })).entry, null, 2));
} else if (cmd === "ask" && id && rest[0]) {
  console.log(JSON.stringify((await api(cookie, "POST", { action: "question", id, reply: rest.join(" ") })).entry, null, 2));
} else {
  console.error("usage: stock-book.mjs list | waiting | done <id> <productUrl> | ask <id> <question>");
  process.exit(1);
}
