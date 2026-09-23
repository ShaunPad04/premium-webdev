"use client";

import { useId, useRef, useState } from "react";

import { shop } from "@/lib/shop";

/* The contact form.
 *
 * ── What it promises ──────────────────────────────────────────────────────
 * Only what actually happened. The success state appears when the server says
 * a message was accepted for delivery, and at no other time. Today the server
 * cannot send — no inbox has been configured — so submitting this form
 * produces a clearly worded failure and the shop's phone number, not a tick.
 * That is the point: a form that says "thank you" into a void is worse than
 * no form, because the customer stops trying.
 *
 * ── Accessibility ─────────────────────────────────────────────────────────
 * Every field has a real <label>, tied by id. Errors are rendered next to the
 * field, referenced with aria-describedby and marked aria-invalid, so a screen
 * reader reads the error with the field rather than leaving the user to hunt
 * for it. Nothing is signalled by colour alone — every error is words.
 *
 * The form-level result is a polite live region that exists in the DOM before
 * submission, which is what makes it announced when it fills; a region added
 * to the page at the same moment as its content is frequently missed.
 *
 * noValidate turns off the browser's own bubbles deliberately. They are not
 * styleable, they vanish on blur, and they are announced inconsistently; the
 * same checks run below and produce persistent, associated messages instead.
 *
 * ── Design (2026-09-23) ───────────────────────────────────────────────────
 * The client called the old version generic, and its colours were off for a
 * real reason: it used the class `.cf`, which the New In coverflow also uses,
 * so the coverflow's padding, fill and vignette landed inside the form. It
 * is `.cx` now. It sits in the right pane of the contact card
 * (contact/page), with labels that sit in the field and lift when it is
 * used, name and email side by side on a wide screen, an optional topic
 * (sent as the message's first line, so the server and the shop's inbox
 * need no change) and the site's ink pill.
 *
 * ── Spam ──────────────────────────────────────────────────────────────────
 * One honeypot field, hidden from sight AND from assistive technology, and
 * never focusable. No CAPTCHA: a brochure site's contact form does not earn
 * the accessibility cost of one, and the server rate-limits as well. */

type Errors = Partial<Record<"name" | "email" | "message", string>>;
type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "failed"; message: string; showPhone: boolean };

const TOPICS = ["Sizes & fit", "Is it still in?", "An order", "Something else"] as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values: { name: string; email: string; message: string }): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Please tell us your name.";
  if (!values.email.trim()) errors.email = "We need an email address to reply to.";
  else if (!EMAIL.test(values.email.trim()))
    errors.email = "That does not look like an email address.";
  if (!values.message.trim()) errors.message = "Please write a message.";
  else if (values.message.trim().length < 10)
    errors.message = "Please write a little more so we can help.";
  return errors;
}

export function ContactForm() {
  const uid = useId();
  const [values, setValues] = useState({ name: "", email: "", message: "", company: "" });
  const [topic, setTopic] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const formRef = useRef<HTMLFormElement>(null);

  const sending = status.kind === "sending";

  const field = (key: "name" | "email" | "message") => ({
    id: `${uid}-${key}`,
    name: key,
    value: values[key],
    "aria-invalid": errors[key] ? (true as const) : undefined,
    "aria-describedby": errors[key] ? `${uid}-${key}-error` : undefined,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
      /* Clear this field's error as soon as it is being corrected, rather
         than leaving a stale message under a field the visitor has fixed. */
      setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
    },
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    /* Double-submit guard. The button is disabled while sending, but Enter in
       a text field can still fire submit in some browsers. */
    if (sending) return;

    const found = validate(values);
    if (Object.keys(found).length) {
      setErrors(found);
      setStatus({ kind: "idle" });
      /* Move focus to the first field with a problem so a keyboard or screen
         reader user is taken to the error rather than told one exists. */
      const first = (["name", "email", "message"] as const).find((k) => found[k]);
      if (first) formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(`${uid}-${first}`)}`)?.focus();
      return;
    }

    setErrors({});
    setStatus({ kind: "sending" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          message: topic ? `About: ${topic}\n\n${values.message}` : values.message,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        code?: string;
        error?: string;
        errors?: Errors;
      };

      if (res.ok && data.ok) {
        setStatus({ kind: "sent" });
        setValues({ name: "", email: "", message: "", company: "" });
        setTopic("");
        return;
      }

      if (data.errors) {
        setErrors(data.errors);
        setStatus({ kind: "idle" });
        return;
      }

      setStatus({
        kind: "failed",
        message:
          data.error ?? "The message could not be sent just now.",
        /* Anything that is not the visitor's fault should hand them a way
           through rather than an apology. */
        showPhone: data.code !== "rate_limited",
      });
    } catch {
      setStatus({
        kind: "failed",
        message:
          "The message could not be sent — there may be a problem with your connection.",
        showPhone: true,
      });
    }
  }

  const input = (key: "name" | "email", label: string, type: string, auto: string, max: number) => (
    <div className="cx-field">
      <div className="cx-box">
        <input className="cx-input" type={type} autoComplete={auto} maxLength={max} placeholder=" " {...field(key)} />
        <label className="cx-label" htmlFor={`${uid}-${key}`}>
          {label}
        </label>
      </div>
      {errors[key] ? (
        <p className="cx-error" id={`${uid}-${key}-error`}>
          {errors[key]}
        </p>
      ) : null}
    </div>
  );

  return (
    <form ref={formRef} className="cx" onSubmit={onSubmit} noValidate>
      <fieldset className="cx-topics">
        <legend className="cx-legend">
          What is it about? <span>Optional</span>
        </legend>
        <div className="cx-chips">
          {TOPICS.map((t) => (
            <label key={t} className="cx-chip">
              <input
                type="radio"
                name="topic"
                value={t}
                checked={topic === t}
                onChange={() => setTopic(t)}
                onClick={() => { if (topic === t) setTopic(""); }}
              />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="cx-pair">
        {input("name", "Your name", "text", "name", 100)}
        {input("email", "Email address", "email", "email", 200)}
      </div>

      <div className="cx-field">
        <div className="cx-box cx-box--area">
          <textarea className="cx-input cx-textarea" rows={6} maxLength={3900} placeholder=" " {...field("message")} />
          <label className="cx-label" htmlFor={`${uid}-message`}>
            Your message
          </label>
        </div>
        {errors.message ? (
          <p className="cx-error" id={`${uid}-message-error`}>
            {errors.message}
          </p>
        ) : null}
      </div>

      {/* The honeypot. aria-hidden and tabIndex -1 keep it away from assistive
          technology and the keyboard; a bot filling every input trips it.
          autoComplete="off" stops a password manager doing the same by
          accident, which is the classic way honeypots reject real people. */}
      <div className="cx-hp" aria-hidden="true">
        <label htmlFor={`${uid}-company`}>Company</label>
        <input
          id={`${uid}-company`}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
        />
      </div>

      <div className="cx-foot">
        <p className="cx-note">We reply by email.</p>
        <button type="submit" className="cx-send" disabled={sending}>
          <span className="roll"><span>{sending ? "Sending…" : "Send message"}</span></span>
          {sending ? null : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Present from first render so it is announced when it fills. */}
      <div className="cx-status" role="status" aria-live="polite">
        {status.kind === "sent" ? (
          <p className="cx-ok">
            Thank you — your message has been sent. We will reply to the address
            you gave.
          </p>
        ) : null}
        {status.kind === "failed" ? (
          <p className="cx-fail">
            {status.message}
            {/* Locked decision 11 said this failure must carry "a plainly
                worded failure plus the phone number". The number came off the
                site on 2026-09-21 at the client's instruction, so the fallback
                is the email address — which matters MORE now, not less: if
                this form is unconfigured and the message did not send, this
                line is the only remaining way for that customer to reach the
                shop. The rule the decision was protecting is untouched: the
                form still never reports success without a send. */}
            {status.showPhone && shop.email ? (
              <>
                {" "}
                Please email the shop at{" "}
                <a href={`mailto:${shop.email}`} className="cx-fail-link">
                  {shop.email}
                </a>
                .
              </>
            ) : null}
          </p>
        ) : null}
      </div>
    </form>
  );
}
