"use client";

import { useId } from "react";

/* Where the parcel goes.
 *
 * ── Why this did not exist until now ─────────────────────────────────────
 * The bag posted nothing but slugs, sizes, colours and quantities. The shop
 * could have taken a payment and had no idea who bought the garment or where
 * to send it — a website that takes money and cannot post the goods.
 *
 * ── Why the address is one box rather than five ──────────────────────────
 * "Address line 1 / Address line 2 / Town / County" is the shape of a form
 * built around a database table, and it makes a customer decide which of
 * five boxes "Flat 2, above the bakery" belongs in. A postal address is
 * something people have written on envelopes their whole lives, and it goes
 * on a parcel as one block of text.
 *
 * The postcode is separate, and only the postcode, because that is the one
 * part the shop looks at on its own — it decides the postage and it is what
 * gets checked when something comes back undelivered.
 *
 * ── Validation is deliberately thin ──────────────────────────────────────
 * Present and long enough to be an address, and an email with an @ in it.
 * Nothing else. A regex that rejects real British addresses — and they are
 * genuinely strange — loses a sale to be tidy. The one thing that must not
 * happen is a payment with no way to reach the customer, and that is what
 * these checks are for.
 *
 * ── The phone number is OPTIONAL, and why it exists at all ──────────────
 * Added 2026-09-22. The client's answer to "what if a piece has already
 * gone?" was "refund them straight away, then ring to apologise" — and
 * checkout collected no number to ring. Optional rather than required
 * because the email already guarantees a way to reach everybody; the phone
 * is how she prefers to do it when she can. Royal Mail does not need it,
 * and a required box costs every customer a step to serve a rare case.
 *
 * If one is given it must hold 10 to 15 digits, with spaces, +, brackets and
 * dashes allowed around them. That accepts 07… and +44 7… and rejects the
 * number with a digit missing, which is the typo that actually happens.
 */

export type Details = {
  name: string;
  email: string;
  /** House number and street. */
  line1: string;
  /** Flat, building or area. Optional. */
  line2: string;
  town: string;
  postcode: string;
  /** Optional. Empty string when not given. */
  phone: string;
};

export const EMPTY_DETAILS: Details = {
  name: "",
  email: "",
  line1: "",
  line2: "",
  town: "",
  postcode: "",
  phone: "",
};

/** The address as one line for the order and the parcel label. The server
 *  still takes a single `address` field, so it is joined here and nothing
 *  downstream changes. */
export function fullAddress(d: Details): string {
  return [d.line1, d.line2, d.town].map((x) => x.trim()).filter(Boolean).join(", ");
}

/** The same rules the server applies. Duplicated on purpose — the browser's
 *  copy is there to tell somebody before they press the button, and the
 *  server's is the one that counts, because anything a browser checks a
 *  browser can skip. */
export type DetailsField = "name" | "email" | "line1" | "town" | "postcode" | "phone";

/** The first field that is wrong, and what to say about it. */
export function firstProblem(d: Details): { field: DetailsField; message: string } | null {
  if (d.name.trim().length < 2) return { field: "name", message: "Please give the name the parcel goes to." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim()))
    return { field: "email", message: "Please give an email address we can send the confirmation to." };
  if (d.line1.trim().length < 3)
    return { field: "line1", message: "Please give the house number and street." };
  if (d.town.trim().length < 2) return { field: "town", message: "Please give the town or city." };
  if (fullAddress(d).length < 10)
    return { field: "line1", message: "Please give the full address, including the house number and street." };
  if (d.postcode.trim().length < 5) return { field: "postcode", message: "Please give the postcode." };
  const phone = phoneProblem(d.phone);
  if (phone) return { field: "phone", message: phone };
  return null;
}

export function detailsProblem(d: Details): string | null {
  return firstProblem(d)?.message ?? null;
}

/** Empty is fine — the field is optional. Anything typed must look like a
 *  phone number. Mirrored in /api/checkout's readCustomer. */
export function phoneProblem(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  const digits = v.replace(/\D/g, "").length;
  if (!/^[0-9+()\-\s]+$/.test(v) || digits < 10 || digits > 15)
    return "That phone number does not look complete — check it, or leave it blank.";
  return null;
}

export function DeliveryDetails({
  value,
  onChange,
  disabled,
  invalid,
}: {
  value: Details;
  onChange: (next: Details) => void;
  disabled?: boolean;
  /** Set after a pay attempt: the field that stopped it, shown on the field
      itself so the customer is not reading an error a screen away. */
  invalid?: { field: DetailsField; message: string } | null;
}) {
  const uid = useId();
  const set = (k: keyof Details) => (e: { target: { value: string } }) =>
    onChange({ ...value, [k]: e.target.value });
  const bad = (k: DetailsField) => invalid?.field === k;
  /* aria-invalid, the error's id first in aria-describedby, and the words
     under the field. */
  const errorFor = (k: DetailsField, hint?: string) => ({
    "aria-invalid": bad(k) ? (true as const) : undefined,
    "aria-describedby": [bad(k) ? `${uid}-${k}-error` : "", hint ?? ""].filter(Boolean).join(" ") || undefined,
  });
  const message = (k: DetailsField) =>
    bad(k) ? (
      <p className="cf-error dd-error" id={`${uid}-${k}-error`}>
        {invalid!.message}
      </p>
    ) : null;

  const row = (
    k: keyof Details,
    label: string,
    attrs: React.InputHTMLAttributes<HTMLInputElement>,
    hint?: string,
    className?: string,
    required = true,
  ) => {
    const hintId = hint ? `${uid}-${k}-hint` : undefined;
    const checked = k !== "line2";
    return (
      <div className={`cf-field${className ? ` ${className}` : ""}`}>
        <label className="cf-label" htmlFor={`${uid}-${k}`}>
          {label}
        </label>
        <input
          className="cf-input"
          id={`${uid}-${k}`}
          type="text"
          {...attrs}
          name={k}
          value={value[k]}
          onChange={set(k)}
          disabled={disabled}
          required={required}
          {...(checked ? errorFor(k as DetailsField, hintId) : { "aria-describedby": hintId })}
        />
        {checked ? message(k as DetailsField) : null}
        {hint ? (
          <p className="dd-hint" id={hintId}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <div className="dd">
      <h2 className="dd-heading">Where is it going?</h2>
      {/* Said once, plainly, before the fields rather than after them. UK
          delivery only is the client's own confirmed term and a customer who
          reads it here does not get as far as typing a Dublin address. */}
      <p className="dd-note">
        We post within the UK only, by Royal Mail, next working day.
      </p>

      {row("name", "Name", { autoComplete: "name", maxLength: 100 })}
      {row("email", "Email", { type: "email", inputMode: "email", autoComplete: "email", maxLength: 200 },
        "For your order confirmation. Nothing else is sent to it.")}
      {row("line1", "Address line 1", { autoComplete: "address-line1", maxLength: 200, placeholder: "House number and street" }, undefined, "dd-wide")}
      {row("line2", "Address line 2 (optional)", { autoComplete: "address-line2", maxLength: 200, placeholder: "Flat, building or area" }, undefined, undefined, false)}
      {row("town", "Town or city", { autoComplete: "address-level2", maxLength: 100 })}
      {row("postcode", "Postcode", { autoComplete: "postal-code", maxLength: 12 })}
      {/* "(optional)" is in the label itself: a screen reader announces the
          label, and nothing else on this form marks required-ness. */}
      {row("phone", "Phone (optional)", { type: "tel", inputMode: "tel", autoComplete: "tel", maxLength: 20 },
        "Only used if there is a problem with your order.", undefined, false)}
    </div>
  );
}
