"use client";

import { useState } from "react";

/** The passcode screen.
 *
 *  Says nothing about why a passcode failed. "Wrong passcode" and "no
 *  passcode is set" are the same answer to someone guessing, and a page that
 *  distinguishes them is a page that helps them.
 */
export function StockSignIn() {
  const [value, setValue] = useState("");
  /* Ticked by default. The overwhelmingly common case is her own phone, and
     the alternative — a passcode prompt between a waiting customer and
     marking a coat sold — is the thing that stops the page being used. */
  const [remember, setRemember] = useState(true);
  const [state, setState] = useState<"idle" | "sending" | "wrong" | "blocked" | "failed">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value) return;
    setState("sending");
    try {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sign-in", passphrase: value, remember }),
      });
      if (res.ok) {
        window.location.reload();
        return;
      }
      setState(res.status === 429 ? "blocked" : "wrong");
    } catch {
      setState("failed");
    }
  }

  return (
    <main id="main" className="st-gate">
      <form className="st-gate-box" onSubmit={submit}>
        <p className="st-gate-eyebrow">B Boutique</p>
        <h1 className="st-gate-h">Stock</h1>
        <p className="st-gate-p">
          The passcode for the shop&rsquo;s stock list.
        </p>

        <label className="st-gate-label" htmlFor="pass">
          Passcode
        </label>
        <input
          id="pass"
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="current-password"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          required
        />

        <label className="st-gate-remember">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <span>
            Keep me signed in on this phone
            <em>Leave this off on a shared or borrowed device.</em>
          </span>
        </label>

        <button type="submit" className="st-gate-go" disabled={state === "sending"}>
          {state === "sending" ? "Checking…" : "Open the list"}
        </button>

        {state === "wrong" ? (
          <p className="st-gate-bad" role="alert">
            That is not the passcode.
          </p>
        ) : null}
        {state === "blocked" ? (
          <p className="st-gate-bad" role="alert">
            Too many tries. Wait ten minutes and try again.
          </p>
        ) : null}
        {state === "failed" ? (
          <p className="st-gate-bad" role="alert">
            No connection. Nothing was checked &mdash; try again in a moment.
          </p>
        ) : null}
      </form>
    </main>
  );
}
