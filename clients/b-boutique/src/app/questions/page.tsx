import type { Metadata } from "next";

import { QuestionsForm } from "./QuestionsForm";

/** The questions only the client can answer, as a page she can fill in.
 *
 *  ── Why a page and not a document ───────────────────────────────────────
 *  She uses a phone and nothing else. A printed sheet needs a printer and an
 *  emailed HTML attachment opens unreliably in mobile mail apps, often in a
 *  preview that runs no JavaScript. A link in a text message is the one
 *  thing that works on a phone without an app, an account or an install.
 *
 *  ── Not part of the shop ────────────────────────────────────────────────
 *  Unlisted, noindex regardless of ALLOW_INDEXING, no header, no footer, and
 *  nothing anywhere on the site links to it — the same arrangement /stock
 *  uses. It is not a shop page that happens to be hidden; it is a private
 *  page that happens to be on the same deployment.
 *
 *  ── TEMPORARY. Delete it when she has answered ─────────────────────────
 *  The whole thing is this folder. Remove src/app/questions and it is gone
 *  with nothing left behind, which is why the styles live here rather than
 *  in globals.css.
 */
export const metadata: Metadata = {
  title: "Questions",
  robots: { index: false, follow: false, nocache: true },
};

export default function QuestionsPage() {
  return (
    <>
      {/* Scoped by the qf- prefix and shipped with the page, so deleting the
          folder cannot leave orphan rules in the stylesheet. */}
      <style>{`
        .qf {
          --qf-ink: #1A1416;
          --qf-paper: #FAF5F3;
          --qf-rouge: #8A070B;
          --qf-line: #D8CFCB;
          min-height: 100svh;
          margin: 0 auto;
          padding: 28px 18px 72px;
          max-width: 640px;
          background: var(--qf-paper);
          color: var(--qf-ink);
          /* 18px base. She is reading this to answer it, on a phone, and the
             extra points cost nothing on a page with no layout to protect. */
          font: 18px/1.6 var(--font-inter), system-ui, -apple-system, sans-serif;
        }
        .qf p { margin: 0 0 14px; }
        .qf strong { font-weight: 600; }

        .qf-h1 {
          font-family: var(--font-bodoni), Didot, Georgia, serif;
          font-size: clamp(30px, 8vw, 40px);
          font-weight: 400;
          line-height: 1.12;
          margin: 0 0 4px;
        }
        .qf-sub { font-size: 16px; margin-bottom: 26px !important; }

        .qf-h2 {
          font-family: var(--font-bodoni), Didot, Georgia, serif;
          font-size: clamp(22px, 5.5vw, 28px);
          font-weight: 400;
          line-height: 1.2;
          margin: 42px 0 10px;
          padding-top: 20px;
          border-top: 2px solid var(--qf-ink);
        }
        .qf-h3 { font-size: 19px; font-weight: 600; margin: 30px 0 8px; }
        .qf-small { font-size: 16px; margin: 14px 0 8px !important; }

        .qf-note {
          background: #FFF;
          border: 1px solid var(--qf-line);
          padding: 13px 15px;
        }
        .qf-quote {
          margin: 12px 0;
          padding: 12px 15px;
          border-left: 3px solid var(--qf-rouge);
          background: #FFF;
          font-style: italic;
        }
        .qf-ask { font-weight: 600; margin-top: 18px !important; }
        .qf-link { color: var(--qf-rouge); text-underline-offset: 3px; }

        /* ── Prices ──────────────────────────────────────────────────────
           A list, not a table. Thirteen rows of three columns on a 390px
           screen is a table that scrolls sideways, and a form somebody has
           to pan around is a form they abandon. */
        .qf-prices { list-style: none; margin: 16px 0; padding: 0; }
        .qf-prices li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 12px 0;
          border-bottom: 1px solid var(--qf-line);
        }
        .qf-prices label { display: block; }
        .qf-item { display: block; font-size: 16px; line-height: 1.3; }
        .qf-colour {
          display: block;
          margin-top: 2px;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6B6165;
        }
        .qf-money { display: flex; align-items: center; gap: 5px; flex: 0 0 auto; }
        .qf-money span { font-size: 19px; }
        /* The attribute selector is not decoration. A bare .qf-money input
           is (0,1,1) and loses to the .qf input[type="text"] rule below at
           (0,2,1), so the price boxes rendered at width 100% — 258px instead
           of 82px — and pushed the page 7px wider than the phone. Measured,
           not guessed: that does not show as a scrollbar on a phone, it shows
           as a page that slides sideways under your thumb. */
        .qf .qf-money input[type="text"] { width: 82px; text-align: right; }

        /* ── Things she types in ─────────────────────────────────────────
           16px minimum on a phone input, because anything smaller makes iOS
           zoom the whole page in when it is focused, and she then has to
           pinch back out to read the next question. */
        .qf input[type="text"], .qf textarea {
          font: inherit;
          font-size: 16px;
          color: var(--qf-ink);
          background: #FFF;
          border: 1px solid #8A8184;
          border-radius: 0;
          padding: 11px;
          min-height: 48px;
          width: 100%;
        }
        .qf textarea { min-height: 96px; resize: vertical; display: block; }
        .qf input[type="text"]:focus-visible, .qf textarea:focus-visible {
          outline: 3px solid var(--qf-rouge);
          outline-offset: 1px;
        }

        /* ── Yes / No ────────────────────────────────────────────────────
           Whole rows, not small circles: the target is the sentence, which
           is the difference between one tap and three on a phone. */
        .qf-choice { display: flex; flex-wrap: wrap; gap: 10px; margin: 12px 0 6px; }
        .qf-choice label {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1 1 auto;
          min-height: 54px;
          padding: 12px 16px;
          background: #FFF;
          border: 1px solid #8A8184;
          cursor: pointer;
          font-size: 17px;
        }
        .qf-choice input { width: 22px; height: 22px; flex: 0 0 auto; accent-color: var(--qf-rouge); }
        .qf-choice label.is-on {
          border: 2px solid var(--qf-rouge);
          background: #FFF6F5;
          font-weight: 600;
        }
        .qf-stack { flex-direction: column; }
        .qf-stack label { flex: 1 1 auto; }

        /* ── Send ────────────────────────────────────────────────────────
           In the flow at the end, NOT pinned to the bottom.
         *
         * It was fixed, on the reasoning that a long scroll needs a button
         * that is always reachable. Two things against it, and both win: a
         * fixed bottom bar on iOS Safari fights the URL bar that grows and
         * shrinks as you scroll, and it covered the last two lines of every
         * section under it. A submit at the end of a form is also simply
         * where people look for one. */
        .qf-send {
          margin-top: 44px;
          padding: 18px;
          background: #FFF;
          border: 2px solid var(--qf-ink);
        }
        .qf-progress {
          margin: 0 0 8px !important;
          font-size: 15px;
          color: #6B6165;
          text-align: center;
        }
        .qf-btn {
          display: block;
          width: 100%;
          min-height: 56px;
          font: inherit;
          font-size: 19px;
          font-weight: 600;
          color: var(--qf-paper);
          background: var(--qf-ink);
          border: 0;
          padding: 14px;
          cursor: pointer;
        }
        .qf-btn:focus-visible { outline: 3px solid var(--qf-rouge); outline-offset: 2px; }
        .qf-done { margin: 10px 0 0 !important; font-size: 15px; color: var(--qf-rouge); }

      `}</style>
      <QuestionsForm />
    </>
  );
}
