"use client";

import { useState } from "react";

import type { Order } from "@/lib/orders";

/** Orders to pack, at the top of the page she already opens every day.
 *
 *  ── Why here and not a new page ──────────────────────────────────────────
 *  She has one address, one passcode and one habit. A second page for orders
 *  is a second thing to remember to look at, and the one that gets forgotten
 *  is always the one with somebody's money in it. So it sits above the rail,
 *  where she cannot miss it, and disappears entirely when there is nothing to
 *  do.
 *
 *  The email is the nudge; this is the record. If the email never arrives —
 *  a bounce, a full inbox, a typo in CONTACT_TO — the order is still here.
 *
 *  ── Designed for the same hand ───────────────────────────────────────────
 *  Same rules as the stock board: one thumb, standing up, 44px minimum, and
 *  the count never moves until the server says it moved. The address is
 *  selectable text rather than an image or a button, because the next thing
 *  she does with it is copy it onto a label.
 */
export function OrdersPanel({ orders }: { orders: Order[] }) {
  const [rows, setRows] = useState(orders);
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const waiting = rows.filter((o) => o.status === "paid" && !o.postedAt);
  const held = rows.filter((o) => o.status === "pending");

  async function post(reference: string) {
    if (busy) return;
    setBusy(reference);
    setFailed(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "posted", reference }),
      });
      if (!res.ok) throw new Error(String(res.status));
      /* Only now. Marking it posted on the click and rolling back on failure
         is how she walks away believing a parcel is done. */
      setRows((v) =>
        v.map((o) =>
          o.reference === reference ? { ...o, postedAt: new Date().toISOString() } : o,
        ),
      );
    } catch {
      setFailed(reference);
    } finally {
      setBusy(null);
    }
  }

  if (waiting.length === 0 && held.length === 0) return null;

  const money = (p: number) => `£${(p / 100).toFixed(2)}`;

  return (
    <section className="ord" aria-labelledby="ord-h">
      <h2 className="ord-h" id="ord-h">
        {waiting.length === 1 ? "1 order to post" : `${waiting.length} orders to post`}
      </h2>

      <ul className="ord-list">
        {waiting.map((o) => (
          <li key={o.reference} className="ord-card">
            <div className="ord-top">
              <span className="ord-ref">{o.reference}</span>
              <span className="ord-total">{money(o.totalP)}</span>
            </div>

            <ul className="ord-lines">
              {o.lines.map((l, i) => (
                <li key={i} className="ord-line">
                  <span className="ord-qty">{l.qty}&times;</span> {l.describe}
                  {/* The one thing she must not miss. A line nobody had
                      counted did not come off the rail when the order was
                      taken, so the garment may or may not still be there. */}
                  {l.reserved ? null : (
                    <span className="ord-check"> — not counted, check the rail</span>
                  )}
                </li>
              ))}
            </ul>

            <address className="ord-addr">
              {o.name}
              {"\n"}
              {o.address}
              {"\n"}
              {o.postcode}
            </address>

            {/* A tel: link, because this screen is on her phone and the
                reason the number exists is so she can ring from it. Only
                when one was given — an empty "Phone:" row is a question she
                would have to stop and answer. */}
            {o.phone ? (
              <p className="ord-phone">
                <a href={`tel:${o.phone.replace(/[^0-9+]/g, "")}`}>{o.phone}</a>
              </p>
            ) : null}

            <button
              type="button"
              className="ord-posted"
              onClick={() => post(o.reference)}
              disabled={busy === o.reference}
            >
              {busy === o.reference ? "Saving…" : "Posted"}
            </button>

            {failed === o.reference ? (
              <p className="ord-fail" role="status">
                That did not save. It is still to post — try again.
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      {/* Baskets part-way through paying. Shown because their stock is held
          and she may wonder where a garment went, not because she has to do
          anything: they settle themselves within half an hour. */}
      {held.length > 0 ? (
        <p className="ord-held">
          {held.length === 1
            ? "1 basket is part-way through paying, so its piece is held for now."
            : `${held.length} baskets are part-way through paying, so their pieces are held for now.`}{" "}
          They free up on their own if the payment is not finished.
        </p>
      ) : null}
    </section>
  );
}
