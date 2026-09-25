"use client";

import { useId, useRef } from "react";

import type { Product } from "@/lib/catalogue";
import { shop } from "@/lib/shop";

/* Size guide (2026-09-25, preview).
 *
 * Nothing here is a measurement of one of her garments: nobody has taken
 * those, and a made-up bust width is a promise the parcel breaks. What it
 * does carry is true: the sizes this piece actually comes in, its own fit
 * note from the stock list ("fits up to 14"), a general UK body chart so a
 * customer can place herself, how to measure, and the one thing that
 * settles it — ask the shop, who can put a tape on the real piece.
 *
 * A native <dialog>: Escape closes it, focus moves in and comes back to the
 * button, and the page behind is inert, without any code for any of that. */

const CHART: [number, number, number, number][] = [
  // UK size, bust, waist, hips (cm) — general guide
  [6, 76, 58, 83],
  [8, 81, 63, 88],
  [10, 86, 68, 93],
  [12, 91, 73, 98],
  [14, 96, 78, 103],
  [16, 101, 83, 108],
  [18, 106, 88, 113],
];

export function SizeGuide({ product }: { product: Product }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const upTo = Number(/fits up to (\d+)/.exec(product.sizeNote ?? "")?.[1] ?? NaN);
  const oneSize = product.sizes.length === 1;
  const mail = shop.email
    ? `mailto:${shop.email}?subject=${encodeURIComponent(`Measurements: ${product.name}`)}`
    : null;

  return (
    <>
      <button type="button" className="sg-open" onClick={() => ref.current?.showModal()} aria-haspopup="dialog">
        Size guide
      </button>
      <dialog
        ref={ref}
        className="sg"
        aria-labelledby={`${id}-h`}
        onClick={(e) => {
          if (e.target === e.currentTarget) ref.current?.close();
        }}
      >
        <div className="sg-inner">
          <header className="sg-head">
            <p className="sg-eyebrow">Size guide</p>
            <h2 id={`${id}-h`} className="sg-title">{product.name}</h2>
            <button type="button" className="sg-close" onClick={() => ref.current?.close()}>
              <span className="sr-only">Close size guide</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <section className="sg-piece" aria-label="This piece">
            <p className="sg-label">This piece</p>
            <p className="sg-fit">
              {oneSize ? "One size" : `Comes in ${product.sizes.join(", ")}`}
              {Number.isFinite(upTo) ? <>, fits up to a UK {upTo}.</> : product.sizeNote ? <>. {product.sizeNote}.</> : "."}
            </p>
          </section>

          <section aria-label="UK body measurements">
            <p className="sg-label">UK body measurements <span>cm, a general guide</span></p>
            <div className="sg-table-wrap">
              <table className="sg-table">
                <thead>
                  <tr>
                    <th scope="col">UK</th>
                    <th scope="col">Bust</th>
                    <th scope="col">Waist</th>
                    <th scope="col">Hips</th>
                  </tr>
                </thead>
                <tbody>
                  {CHART.map(([uk, b, w, h]) => {
                    const fits = oneSize && Number.isFinite(upTo) && uk <= upTo;
                    return (
                      <tr key={uk} data-fits={fits || undefined}>
                        <th scope="row">
                          {uk}
                          {fits ? <span className="sr-only"> (this piece fits)</span> : null}
                        </th>
                        <td>{b}</td>
                        <td>{w}</td>
                        <td>{h}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {oneSize && Number.isFinite(upTo) ? <p className="sg-key"><i aria-hidden="true" /> Sizes this piece fits</p> : null}
          </section>

          <section aria-label="How to measure">
            <p className="sg-label">How to measure</p>
            <dl className="sg-how">
              <div><dt>Bust</dt><dd>Around the fullest part, tape level under the arms.</dd></div>
              <div><dt>Waist</dt><dd>Around the narrowest part, usually just above the belly button.</dd></div>
              <div><dt>Hips</dt><dd>Around the fullest part, feet together.</dd></div>
            </dl>
          </section>

          <p className="sg-foot">
            Every piece fits a little differently.{" "}
            {mail ? (
              <>
                <a href={mail}>Email us</a> and we will measure this one for you,
              </>
            ) : (
              "Ask us and we will measure this one for you,"
            )}{" "}
            or come and try it on at {shop.street}.
          </p>
        </div>
      </dialog>
    </>
  );
}
