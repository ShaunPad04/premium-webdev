"use client";

import { useId, useRef, useState } from "react";

import { phoneDisplay, shop } from "@/lib/shop";

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
        body: JSON.stringify(values),
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

  return (
    <form ref={formRef} className="cf" onSubmit={onSubmit} noValidate>
      <div className="cf-row">
        <label className="cf-label" htmlFor={`${uid}-name`}>
          Your name
        </label>
        <input className="cf-input" type="text" autoComplete="name" maxLength={100} {...field("name")} />
        {errors.name ? (
          <p className="cf-error" id={`${uid}-name-error`}>
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="cf-row">
        <label className="cf-label" htmlFor={`${uid}-email`}>
          Email address
        </label>
        <input
          className="cf-input"
          type="email"
          autoComplete="email"
          maxLength={200}
          {...field("email")}
        />
        {errors.email ? (
          <p className="cf-error" id={`${uid}-email-error`}>
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="cf-row">
        <label className="cf-label" htmlFor={`${uid}-message`}>
          Message
        </label>
        <textarea className="cf-input cf-textarea" rows={6} maxLength={4000} {...field("message")} />
        {errors.message ? (
          <p className="cf-error" id={`${uid}-message-error`}>
            {errors.message}
          </p>
        ) : null}
      </div>

      {/* The honeypot. aria-hidden and tabIndex -1 keep it away from assistive
          technology and the keyboard; a bot filling every input trips it.
          autoComplete="off" stops a password manager doing the same by
          accident, which is the classic way honeypots reject real people. */}
      <div className="cf-hp" aria-hidden="true">
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

      <div className="cf-actions">
        <button type="submit" className="cf-submit" disabled={sending}>
          {sending ? "Sending…" : "Send message"}
        </button>
      </div>

      {/* Present from first render so it is announced when it fills. */}
      <div className="cf-status" role="status" aria-live="polite">
        {status.kind === "sent" ? (
          <p className="cf-ok">
            Thank you — your message has been sent. We will reply to the address
            you gave.
          </p>
        ) : null}
        {status.kind === "failed" ? (
          <p className="cf-fail">
            {status.message}
            {status.showPhone && shop.phone ? (
              <>
                {" "}
                Please call the shop on{" "}
                <a href={`tel:${shop.phone.replace(/\s+/g, "")}`} className="cf-fail-link">
                  {phoneDisplay}
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
