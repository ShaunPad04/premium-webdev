"use client";

import { useId, useRef, useState } from "react";

import { shop } from "@/lib/shop";

/* "Reserve to try on in the shop" (2026-09-24, Brad).
 *
 * An email, not a booking system: the form writes a message to the shop's
 * confirmed address in the visitor's own mail app, so nothing is sent from
 * the site and nothing can report success while going nowhere. The line
 * about holds is the shop's own confirmed policy (lib/faq.ts). */
export function Reserve({ name, sizes }: { name: string; sizes: readonly string[] }) {
  const d = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [err, setErr] = useState("");

  return (
    <>
      <button type="button" className="rsv-open" onClick={() => d.current?.showModal()}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 20V9l8-5 8 5v11M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        Reserve to try on in the shop
      </button>
      <dialog
        ref={d}
        className="drawer"
        aria-labelledby={`${id}-h`}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <form
          className="drawer-in rsv"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const who = String(f.get("who") ?? "").trim();
            const size = String(f.get("size") ?? "");
            const when = String(f.get("when") ?? "").trim();
            if (!who) {
              setErr("Please add your name.");
              return;
            }
            setErr("");
            const body = [
              `Hello, I would like to try on the ${name}${size ? ` in ${size}` : ""} in the shop.`,
              when ? `I am hoping to come in: ${when}.` : "",
              "",
              who,
            ].filter(Boolean).join("\n");
            window.location.href = `mailto:${shop.email}?subject=${encodeURIComponent(`Try on: ${name}${size ? ` (${size})` : ""}`)}&body=${encodeURIComponent(body)}`;
          }}
        >
          <div className="drawer-head">
            <h2 id={`${id}-h`} className="drawer-h">Reserve to try on</h2>
            <button type="button" className="drawer-x" onClick={() => d.current?.close()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="sr-only">Close</span>
            </button>
          </div>
          <p className="sg-note">
            Ask us to put the {name} aside and try it on at {shop.street}. This opens an email to the shop; we reply to confirm. Items can be held for four days with a deposit.
          </p>
          <label className="rsv-l" htmlFor={`${id}-who`}>Your name</label>
          <input id={`${id}-who`} name="who" className="rsv-i" autoComplete="name" aria-invalid={err ? true : undefined} aria-describedby={err ? `${id}-err` : undefined} />
          {sizes.length > 1 ? (
            <>
              <label className="rsv-l" htmlFor={`${id}-size`}>Size</label>
              <select id={`${id}-size`} name="size" className="rsv-i">
                <option value="">Not sure yet</option>
                {sizes.map((s) => <option key={s}>{s}</option>)}
              </select>
            </>
          ) : null}
          <label className="rsv-l" htmlFor={`${id}-when`}>When you might come in (optional)</label>
          <input id={`${id}-when`} name="when" className="rsv-i" placeholder="e.g. Saturday morning" />
          {err ? <p className="cf-error" id={`${id}-err`} role="alert">{err}</p> : null}
          <button type="submit" className="btn-solid rsv-go">
            <span className="roll"><span>Write the email</span></span>
          </button>
        </form>
      </dialog>
    </>
  );
}
