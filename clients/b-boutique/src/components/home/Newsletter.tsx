"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { shop } from "@/lib/shop";

/* Newsletter sign-up with a reason to join (2026-09-24, Brad). Posts to
 * /api/newsletter and says exactly what happened: success only when the
 * provider accepted the address, a plain "not open yet" while the list is
 * not set up, and a real error otherwise. */
type State = "idle" | "sending" | "done" | "not-open" | "invalid" | "failed";

export function Newsletter() {
  const id = useId();
  const [state, setState] = useState<State>("idle");

  return (
    <section className="nl" aria-labelledby={`${id}-h`}>
      <div className="nl-in">
        <div className="nl-copy">
          <p className="nl-eyebrow">The list</p>
          <h2 id={`${id}-h`} className="nl-h">
            Be first to see <em>new arrivals.</em>
          </h2>
          <p className="nl-p">
            Most pieces are one of one, so when something new comes in it rarely stays long. Leave your email and we will tell you when it lands.
          </p>
        </div>
        {state === "done" ? (
          <p className="nl-done" role="status">
            You are on the list. Thank you.
          </p>
        ) : (
          <form
            className="nl-form"
            noValidate
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const email = String(f.get("email") ?? "").trim();
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
                setState("invalid");
                return;
              }
              setState("sending");
              try {
                const r = await fetch("/api/newsletter", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, company: f.get("company") ?? "" }),
                });
                const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
                setState(d.ok ? "done" : d.error === "not-open" ? "not-open" : d.error === "invalid" ? "invalid" : "failed");
              } catch {
                setState("failed");
              }
            }}
          >
            <label htmlFor={`${id}-e`} className="nl-l">Email address</label>
            <div className="nl-row">
              <input
                id={`${id}-e`}
                name="email"
                type="email"
                autoComplete="email"
                className="nl-i"
                aria-invalid={state === "invalid" || undefined}
                aria-describedby={`${id}-msg`}
              />
              <input type="text" name="company" tabIndex={-1} autoComplete="off" className="nl-hp" aria-hidden="true" />
              <button type="submit" className="btn-solid nl-go" disabled={state === "sending"}>
                <span className="roll"><span>{state === "sending" ? "Joining…" : "Join"}</span></span>
              </button>
            </div>
            <p id={`${id}-msg`} className="nl-msg" role={state === "idle" ? undefined : "status"}>
              {state === "invalid"
                ? "That email address does not look right."
                : state === "not-open"
                  ? `Sign-ups are not open yet. For now, email ${shop.email} or follow us on Instagram.`
                  : state === "failed"
                    ? "Something went wrong and you are not on the list yet. Please try again."
                    : (
                      <>
                        New arrivals only, and you can unsubscribe at any time. <Link href="/privacy">Privacy</Link>
                      </>
                    )}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
