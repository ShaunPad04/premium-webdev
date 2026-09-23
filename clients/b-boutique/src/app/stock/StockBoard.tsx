"use client";

import { useMemo, useState } from "react";

/** The list, and the tap that changes it.
 *
 *  ── What it is designed around ───────────────────────────────────────────
 *  One hand, standing at a counter, with a customer waiting. That rules the
 *  whole layout: find the piece, tap SOLD, done. Everything else — counting,
 *  returns, receiving — is behind a second tap, because it happens once a
 *  week and selling happens all day.
 *
 *  ── Why the count changes before the server answers ──────────────────────
 *  It does not. A count that flickers to the right number and then back
 *  because the request failed is worse than a count that takes 300ms, because
 *  she has already walked away believing it. The row shows it is working and
 *  the number only moves when the database says it moved.
 */

export type BoardVariant = {
  id: string;
  size: string;
  colour: string;
  /** null means nobody has ever counted this one. Not the same as zero. */
  qty: number | null;
  restockable: boolean;
};

export type BoardPiece = {
  slug: string;
  name: string;
  category: string;
  variants: BoardVariant[];
};

type Busy = { id: string; action: string } | null;

export function StockBoard({ pieces }: { pieces: BoardPiece[] }) {
  const [state, setState] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(
      pieces.flatMap((p) => p.variants.map((v) => [v.id, v.qty] as const)),
    ),
  );
  const [busy, setBusy] = useState<Busy>(null);
  const [problem, setProblem] = useState<string>("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pieces;
    return pieces.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
    );
  }, [pieces, query]);

  async function send(id: string, action: string, extra?: Record<string, unknown>) {
    setBusy({ id, action });
    setProblem("");
    try {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id, ...extra }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        qty?: number;
        code?: string;
      };

      if (data.ok && typeof data.qty === "number") {
        setState((s) => ({ ...s, [id]: data.qty as number }));
      } else if (data.code === "would_go_negative") {
        setState((s) => ({ ...s, [id]: data.qty ?? 0 }));
        setProblem("There were none of those left to sell. The count is corrected.");
      } else if (data.code === "not_signed_in") {
        setProblem("Signed out. Reload the page and put the passcode in again.");
      } else {
        setProblem("That did not save. Try again — the count has not changed.");
      }
    } catch {
      /* A failed request on a shop floor usually means the signal dropped.
         Say that, rather than "an error occurred", and say plainly that
         nothing changed so she knows to do it again. */
      setProblem("No connection. Nothing was saved — try again in a moment.");
    } finally {
      setBusy(null);
    }
  }

  const uncounted = Object.values(state).filter((q) => q === null).length;
  const [importing, setImporting] = useState(false);

  /* Loads the opening counts from the master list (lib/opening-stock.ts)
     into every line that has never been counted. Never overwrites a count,
     so it is safe to press again; the page reloads to show the result. */
  async function importOpening() {
    if (!window.confirm("Load the opening counts from the master stock list? Only lines that have never been counted are filled in.")) return;
    setImporting(true);
    setProblem("");
    try {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import-opening" }),
      });
      const data = (await res.json()) as { ok: boolean; set?: number; code?: string };
      if (data.ok) {
        window.alert(`${data.set ?? 0} lines counted from the master list. The rest need counting by size on this page.`);
        window.location.reload();
        return;
      }
      setProblem(data.code === "not_signed_in" ? "Signed out. Reload the page and put the passcode in again." : "The opening counts did not load. Nothing was changed.");
    } catch {
      setProblem("No connection. Nothing was saved — try again in a moment.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <main id="main" className="st">
      <header className="st-top">
        <div className="st-top-row">
          <p className="st-title">What&rsquo;s in the shop</p>
          <form action="/api/stock" method="post" onSubmit={(e) => {
            e.preventDefault();
            void fetch("/api/stock", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "sign-out" }),
            }).then(() => window.location.reload());
          }}>
            <button type="submit" className="st-out">Sign out</button>
          </form>
        </div>

        <label className="st-find">
          {/* Labelled by aria-label rather than a visually-hidden span: this
              project has no .sr-only utility, and a single aria-label is one
              fewer element than inventing one for one input. */}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a piece"
            aria-label="Find a piece"
            autoComplete="off"
          />
        </label>

        {uncounted > 0 ? (
          <p className="st-uncounted">
            {uncounted} {uncounted === 1 ? "line has" : "lines have"} never been
            counted. Tap a piece and use <b>Count</b> to set the first number.
            Nothing shows on the website until it has one.
          </p>
        ) : null}
        {uncounted > 0 ? (
          <button type="button" className="st-import" onClick={importOpening} disabled={importing}>
            {importing ? "Loading opening counts…" : "Load opening counts from the master list"}
          </button>
        ) : null}
      </header>

      {problem ? (
        <p className="st-problem" role="alert">
          {problem}
        </p>
      ) : null}

      <ul className="st-list">
        {shown.map((piece) => {
          const isOpen = open === piece.slug;
          const total = piece.variants.reduce(
            (n, v) => n + (state[v.id] ?? 0),
            0,
          );
          const anyCounted = piece.variants.some((v) => state[v.id] !== null);

          return (
            <li key={piece.slug} className="st-piece">
              <button
                type="button"
                className="st-piece-head"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : piece.slug)}
              >
                <span className="st-piece-name">{piece.name}</span>
                <span className="st-piece-cat">{piece.category}</span>
                <span className="st-piece-total">
                  {anyCounted ? total : "—"}
                </span>
              </button>

              {isOpen ? (
                <ul className="st-vars">
                  {piece.variants.map((v) => {
                    const qty = state[v.id];
                    const working = busy?.id === v.id;
                    return (
                      <li key={v.id} className="st-var">
                        <div className="st-var-id">
                          <span className="st-size">{v.size}</span>
                          {v.colour ? (
                            <span className="st-colour">{v.colour}</span>
                          ) : (
                            /* Not a placeholder to fill in later: it is the
                               honest state until the shop says what colour
                               the piece is, and it is visible so it gets
                               chased rather than forgotten. */
                            <span
                              className="st-nocolour"
                              title="Nobody has confirmed what colour this piece is"
                            >
                              colour not set
                            </span>
                          )}
                        </div>

                        <span
                          className={qty === null ? "st-qty st-qty-none" : "st-qty"}
                          aria-label={
                            qty === null
                              ? "never counted"
                              : `${qty} in the shop`
                          }
                        >
                          {qty === null ? "—" : qty}
                        </span>

                        <div className="st-acts">
                          <button
                            type="button"
                            className="st-sold"
                            disabled={working || qty === null || qty === 0}
                            onClick={() => void send(v.id, "sold-in-shop")}
                          >
                            {working && busy?.action === "sold-in-shop"
                              ? "…"
                              : "Sold"}
                          </button>
                          <button
                            type="button"
                            className="st-minor"
                            disabled={working}
                            onClick={() => void send(v.id, "returned")}
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            className="st-minor"
                            disabled={working}
                            onClick={() => {
                              const answer = window.prompt(
                                `How many ${piece.name} in ${v.size}${v.colour ? ` (${v.colour})` : ""} are actually in the shop?`,
                                String(qty ?? 0),
                              );
                              if (answer === null) return;
                              const n = Number.parseInt(answer.trim(), 10);
                              if (!Number.isInteger(n) || n < 0) {
                                setProblem("That needs to be a whole number, 0 or more.");
                                return;
                              }
                              void send(v.id, "counted", { qty: n });
                            }}
                          >
                            Count
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>

      {shown.length === 0 ? (
        <p className="st-empty">Nothing matches &ldquo;{query}&rdquo;.</p>
      ) : null}
    </main>
  );
}
