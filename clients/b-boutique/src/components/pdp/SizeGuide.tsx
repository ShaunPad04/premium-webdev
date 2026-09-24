"use client";

import { useRef } from "react";

/* The size guide, as a drawer (2026-09-24, Brad).
 *
 * Two different kinds of fact, kept visibly apart:
 *   - THIS piece: its own size run and the qualifier from her stock sheet
 *     ("fits up to 14"), plus a "Fits like UK …" line only where lib/
 *     stocklist.ts carries one. None do yet; see the report's CLIENT INPUT.
 *   - A GENERAL UK guide to body measurements, labelled as general. It says
 *     nothing about how any one of her pieces is cut.
 * Native <dialog>: focus moves in, Escape closes, focus returns. */

const UK = [
  { uk: "8", bust: 81, waist: 63, hip: 89 },
  { uk: "10", bust: 86, waist: 68, hip: 94 },
  { uk: "12", bust: 91, waist: 73, hip: 99 },
  { uk: "14", bust: 96, waist: 78, hip: 104 },
  { uk: "16", bust: 101, waist: 83, hip: 109 },
  { uk: "18", bust: 108, waist: 90, hip: 116 },
];

export function SizeGuide({
  name,
  sizes,
  sizeNote,
  fitsLike,
}: {
  name: string;
  sizes: readonly string[];
  sizeNote: string;
  fitsLike?: string;
}) {
  const d = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className="sg-open" onClick={() => d.current?.showModal()}>
        Size guide
      </button>
      <dialog
        ref={d}
        className="drawer"
        aria-labelledby="sg-h"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="drawer-in">
          <div className="drawer-head">
            <h2 id="sg-h" className="drawer-h">Size guide</h2>
            <button type="button" className="drawer-x" onClick={() => d.current?.close()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="sr-only">Close size guide</span>
            </button>
          </div>

          <section className="sg-piece">
            <p className="sg-k">This piece</p>
            <p className="sg-name">{name}</p>
            <p className="sg-run">
              {sizes.join(" · ")}
              {sizeNote ? <span> &mdash; {sizeNote}</span> : null}
            </p>
            {fitsLike ? <p className="sg-fits">Fits like UK {fitsLike}</p> : null}
          </section>

          <section>
            <p className="sg-k">General UK guide</p>
            <p className="sg-note">Body measurements in centimetres. Our pieces come from several makers and each fits a little differently, so use this alongside the note above.</p>
            <table className="sg-table">
              <thead>
                <tr><th scope="col">UK</th><th scope="col">Bust</th><th scope="col">Waist</th><th scope="col">Hip</th></tr>
              </thead>
              <tbody>
                {UK.map((r) => (
                  <tr key={r.uk}><th scope="row">{r.uk}</th><td>{r.bust}</td><td>{r.waist}</td><td>{r.hip}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="sg-note">Between sizes, or not sure? Email us and we will measure the piece for you.</p>
          </section>
        </div>
      </dialog>
    </>
  );
}
