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
  address: string;
  postcode: string;
  /** Optional. Empty string when not given. */
  phone: string;
};

export const EMPTY_DETAILS: Details = {
  name: "",
  email: "",
  address: "",
  postcode: "",
  phone: "",
};

/** The same rules the server applies. Duplicated on purpose — the browser's
 *  copy is there to tell somebody before they press the button, and the
 *  server's is the one that counts, because anything a browser checks a
 *  browser can skip. */
export function detailsProblem(d: Details): string | null {
  if (d.name.trim().length < 2) return "Please give the name the parcel goes to.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim()))
    return "Please give an email address we can send the confirmation to.";
  if (d.address.trim().length < 10)
    return "Please give the full address, including the house number and street.";
  if (d.postcode.trim().length < 5) return "Please give the postcode.";
  if (phoneProblem(d.phone)) return phoneProblem(d.phone);
  return null;
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
}: {
  value: Details;
  onChange: (next: Details) => void;
  disabled?: boolean;
}) {
  const uid = useId();
  const set = (k: keyof Details) => (e: { target: { value: string } }) =>
    onChange({ ...value, [k]: e.target.value });

  return (
    <div className="dd">
      <h2 className="dd-heading">Where is it going?</h2>
      {/* Said once, plainly, before the fields rather than after them. UK
          delivery only is the client's own confirmed term and a customer who
          reads it here does not get as far as typing a Dublin address. */}
      <p className="dd-note">
        We post within the UK only, by Royal Mail, next working day.
      </p>

      <div className="cf-field">
        <label className="cf-label" htmlFor={`${uid}-name`}>
          Name
        </label>
        <input
          className="cf-input"
          id={`${uid}-name`}
          type="text"
          autoComplete="name"
          maxLength={100}
          value={value.name}
          onChange={set("name")}
          disabled={disabled}
          required
        />
      </div>

      <div className="cf-field">
        <label className="cf-label" htmlFor={`${uid}-email`}>
          Email
        </label>
        <input
          className="cf-input"
          id={`${uid}-email`}
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={200}
          value={value.email}
          onChange={set("email")}
          disabled={disabled}
          required
          aria-describedby={`${uid}-email-why`}
        />
        <p className="dd-hint" id={`${uid}-email-why`}>
          For your order confirmation. Nothing else is sent to it.
        </p>
      </div>

      <div className="cf-field">
        {/* "(optional)" is in the label itself, not signalled by the absence
            of an asterisk: a screen reader announces the label, and nothing
            else on this form marks required-ness visually either. */}
        <label className="cf-label" htmlFor={`${uid}-phone`}>
          Phone (optional)
        </label>
        <input
          className="cf-input"
          id={`${uid}-phone`}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={20}
          value={value.phone}
          onChange={set("phone")}
          disabled={disabled}
          aria-describedby={`${uid}-phone-why`}
        />
        <p className="dd-hint" id={`${uid}-phone-why`}>
          Only used if there is a problem with your order.
        </p>
      </div>

      <div className="cf-field">
        <label className="cf-label" htmlFor={`${uid}-address`}>
          Address
        </label>
        <textarea
          className="cf-input cf-textarea"
          id={`${uid}-address`}
          rows={4}
          maxLength={500}
          autoComplete="street-address"
          value={value.address}
          onChange={set("address")}
          disabled={disabled}
          required
          aria-describedby={`${uid}-address-hint`}
        />
        <p className="dd-hint" id={`${uid}-address-hint`}>
          House number, street, and town — as you would write it on an envelope.
        </p>
      </div>

      <div className="cf-field dd-postcode">
        <label className="cf-label" htmlFor={`${uid}-postcode`}>
          Postcode
        </label>
        <input
          className="cf-input"
          id={`${uid}-postcode`}
          type="text"
          autoComplete="postal-code"
          maxLength={12}
          value={value.postcode}
          onChange={set("postcode")}
          disabled={disabled}
          required
        />
      </div>
    </div>
  );
}
