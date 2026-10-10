import type { NextRequest } from "next/server";

import {
  addEntry, answerEntry, askQuestion, bookIsConfigured, editEntry, listBook, markDone, removeEntry, validateInput,
} from "@/lib/stock-book";
import { isSignedIn, stockAuthIsConfigured } from "@/lib/stock-auth";

/** The stock book's endpoint (2026-10-10). Under /stock so the passcode
 *  cookie reaches it, like /stock/api and /stock/api/orders.
 *
 *  Authorisation is checked on every request, never inferred from the page.
 *  One passcode, two callers: Hayley's page (add, edit, remove, answer) and
 *  scripts/stock-book.mjs on our side (list, question, done). The same PIN
 *  opens both because they are the same two people who already share it. */

export const dynamic = "force-dynamic";

const json = (body: unknown, status: number) => Response.json(body, { status });
const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

async function gate(): Promise<Response | null> {
  if (!bookIsConfigured() || !stockAuthIsConfigured()) return json({ ok: false, code: "not_configured" }, 503);
  if (!(await isSignedIn())) return json({ ok: false, code: "not_signed_in" }, 401);
  return null;
}

export async function GET() {
  const refused = await gate();
  if (refused) return refused;
  const entries = await listBook();
  return json({ ok: true, entries: entries ?? [] }, 200);
}

export async function POST(request: NextRequest) {
  const refused = await gate();
  if (refused) return refused;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, code: "bad_request" }, 400);
  }
  const action = str(body.action, 20);
  const id = str(body.id, 40);

  switch (action) {
    case "add": {
      const v = validateInput(body.entry);
      if (!v.ok) return json({ ok: false, code: "invalid", problem: v.problem }, 400);
      const entry = await addEntry(v.input);
      return entry ? json({ ok: true, entry }, 200) : json({ ok: false, code: "not_configured" }, 503);
    }
    case "edit": {
      if (!id) return json({ ok: false, code: "bad_request" }, 400);
      const v = validateInput(body.entry);
      if (!v.ok) return json({ ok: false, code: "invalid", problem: v.problem }, 400);
      const entry = await editEntry(id, v.input);
      return entry ? json({ ok: true, entry }, 200) : json({ ok: false, code: "not_found" }, 404);
    }
    case "remove": {
      if (!id) return json({ ok: false, code: "bad_request" }, 400);
      const ok = await removeEntry(id);
      return ok ? json({ ok: true }, 200) : json({ ok: false, code: "not_found" }, 404);
    }
    case "answer": {
      const answer = str(body.answer, 1000);
      if (!id || !answer) return json({ ok: false, code: "bad_request" }, 400);
      const entry = await answerEntry(id, answer);
      return entry ? json({ ok: true, entry }, 200) : json({ ok: false, code: "not_found" }, 404);
    }
    /* Ours. */
    case "question": {
      const reply = str(body.reply, 1000);
      if (!id || !reply) return json({ ok: false, code: "bad_request" }, 400);
      const entry = await askQuestion(id, reply);
      return entry ? json({ ok: true, entry }, 200) : json({ ok: false, code: "not_found" }, 404);
    }
    case "done": {
      const productUrl = str(body.productUrl, 500);
      if (!id || !/^https:\/\/\S+/.test(productUrl)) return json({ ok: false, code: "bad_request" }, 400);
      const entry = await markDone(id, productUrl);
      return entry ? json({ ok: true, entry }, 200) : json({ ok: false, code: "not_found" }, 404);
    }
    default:
      return json({ ok: false, code: "bad_request" }, 400);
  }
}
