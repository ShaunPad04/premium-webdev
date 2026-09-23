"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/** The rail, and the tap that changes it.
 *
 *  ── What it is designed around ───────────────────────────────────────────
 *  One hand, standing at a counter, with a customer waiting. Find the piece
 *  by its photograph, tap it, tap SOLD ONE on the right size. Everything else
 *  (returns, counting) sits on the same sheet but is quieter, because it
 *  happens once a week and selling happens all day.
 *
 *  ── Layout (2026-09-23, "it's quite confusing") ──────────────────────────
 *  It was a text list that expanded in place into rows of three identical
 *  buttons. Now it is a grid of the shop's own photographs, each with one
 *  plain status ("3 in the shop", "Sold out", "Needs counting"), filters for
 *  the three questions she actually asks, and one sheet per piece with its
 *  lines grouped by colour, each colour shown by its own photograph.
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
  /** Product photo basename (public/img/product/<name>-640.jpg). */
  photo: string;
  colourPhotos: Record<string, string>;
  variants: BoardVariant[];
};

type Busy = { id: string; action: string } | null;
type Filter = "all" | "count" | "in" | "out";

const img = (name: string) => `/img/product/${name}-640.jpg`;

export function StockBoard({ pieces }: { pieces: BoardPiece[] }) {
  const [state, setState] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(
      pieces.flatMap((p) => p.variants.map((v) => [v.id, v.qty] as const)),
    ),
  );
  const [busy, setBusy] = useState<Busy>(null);
  const [problem, setProblem] = useState<string>("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [category, setCategory] = useState<string>("");
  const [open, setOpen] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; value: string } | null>(null);
  const [importing, setImporting] = useState(false);

  const sheet = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  /* What each piece amounts to, from the live counts. */
  const status = (p: BoardPiece) => {
    const qtys = p.variants.map((v) => state[v.id]);
    const uncounted = qtys.filter((q) => q === null).length;
    const total = qtys.reduce<number>((n, q) => n + (q ?? 0), 0);
    return { uncounted, total };
  };

  const categories = useMemo(
    () => [...new Set(pieces.map((p) => p.category))],
    [pieces],
  );

  const tally = { all: pieces.length, count: 0, in: 0, out: 0 };
  for (const p of pieces) {
    const s = status(p);
    if (s.uncounted > 0) tally.count++;
    if (s.total > 0) tally.in++;
    if (s.uncounted === 0 && s.total === 0) tally.out++;
  }

  const q = query.trim().toLowerCase();
  const shown = pieces.filter((p) => {
    if (category && p.category !== category) return false;
    if (q && !p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return false;
    const s = status(p);
    if (filter === "count") return s.uncounted > 0;
    if (filter === "in") return s.total > 0;
    if (filter === "out") return s.uncounted === 0 && s.total === 0;
    return true;
  });

  const uncountedLines = Object.values(state).filter((v) => v === null).length;
  const piece = pieces.find((p) => p.slug === open) ?? null;

  /* The sheet is a native modal dialog: it traps focus, makes the rail
     behind it inert and closes on Escape by itself. Focus goes back to the
     card that opened it. */
  useEffect(() => {
    const d = sheet.current;
    if (!d) return;
    if (piece && !d.open) d.showModal();
    if (!piece && d.open) d.close();
  }, [piece]);

  function openPiece(slug: string, from: HTMLElement) {
    opener.current = from;
    setEditing(null);
    setOpen(slug);
  }
  function closePiece() {
    setOpen(null);
    setEditing(null);
    opener.current?.focus();
  }

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
        return true;
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
    return false;
  }

  async function saveCount(id: string, value: string) {
    const n = Number.parseInt(value.trim(), 10);
    if (!Number.isInteger(n) || n < 0 || String(n) !== value.trim()) {
      setProblem("That needs to be a whole number, 0 or more.");
      return;
    }
    if (await send(id, "counted", { qty: n })) setEditing(null);
  }

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

  const problemBar = problem ? (
    <p className="st-problem" role="alert">
      {problem}
    </p>
  ) : null;

  /* The piece's lines, grouped by colour so each colour is shown once, by
     its own photograph, with its sizes under it. */
  const groups = piece
    ? [...new Set(piece.variants.map((v) => v.colour))].map((colour) => ({
        colour,
        photo: piece.colourPhotos[colour] ?? piece.photo,
        lines: piece.variants.filter((v) => v.colour === colour),
      }))
    : [];

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "in", label: "In the shop" },
    { key: "out", label: "Sold out" },
    { key: "count", label: "Needs counting" },
  ];

  return (
    <main id="main" className="st">
      <header className="st-top">
        <div className="st-top-row">
          <h1 className="st-title">Stock</h1>
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a piece by name"
            aria-label="Find a piece by name"
            autoComplete="off"
          />
        </label>
      </header>

      {problem && !piece ? problemBar : null}

      {uncountedLines > 0 ? (
        <section className="st-todo" aria-label="Opening counts">
          <p>
            <b>{uncountedLines} {uncountedLines === 1 ? "size has" : "sizes have"} no count yet.</b>{" "}
            They do not show on the website until they have one. Load the
            opening counts once, then count anything left by hand.
          </p>
          <button type="button" className="st-import" onClick={importOpening} disabled={importing}>
            {importing ? "Loading opening counts…" : "Load opening counts from the master list"}
          </button>
        </section>
      ) : null}

      <nav className="st-filters" aria-label="Show">
        <div className="st-tabs">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              className="st-tab"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label} <span className="st-tab-n">{tally[f.key]}</span>
            </button>
          ))}
        </div>
        <div className="st-chips">
          <button type="button" className="st-chip" aria-pressed={category === ""} onClick={() => setCategory("")}>
            Every category
          </button>
          {categories.map((c) => (
            <button key={c} type="button" className="st-chip" aria-pressed={category === c} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </nav>

      <ul className="st-grid">
        {shown.map((p) => {
          const s = status(p);
          const tone = s.uncounted > 0 ? "count" : s.total === 0 ? "out" : "in";
          const label =
            tone === "count"
              ? "Needs counting"
              : tone === "out"
                ? "Sold out"
                : `${s.total} in the shop`;
          return (
            <li key={p.slug}>
              <button
                type="button"
                className="st-card"
                aria-label={`${p.name}, ${label}`}
                onClick={(e) => openPiece(p.slug, e.currentTarget)}
              >
                <span className="st-card-photo">
                  {/* Decorative: the name under it says what it is. */}
                  <img src={img(p.photo)} alt="" loading="lazy" decoding="async" width={320} height={400} />
                  <span className={`st-badge st-badge--${tone}`}>{label}</span>
                </span>
                <span className="st-card-name">{p.name}</span>
                <span className="st-card-meta">
                  {p.category} · {p.variants.length} {p.variants.length === 1 ? "size" : "sizes"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {shown.length === 0 ? (
        <p className="st-empty">
          Nothing here{q ? <> matches &ldquo;{query}&rdquo;</> : null}.{" "}
          <button
            type="button"
            className="st-reset"
            onClick={() => { setQuery(""); setFilter("all"); setCategory(""); }}
          >
            Show everything
          </button>
        </p>
      ) : null}

      <dialog
        ref={sheet}
        className="st-sheet"
        aria-labelledby="st-sheet-name"
        onClose={() => { if (open) closePiece(); }}
        onClick={(e) => { if (e.target === e.currentTarget) closePiece(); }}
      >
        {piece ? (
          <div className="st-sheet-in">
            <div className="st-sheet-head">
              <img src={img(piece.photo)} alt="" width={64} height={80} />
              <div>
                <h2 id="st-sheet-name" className="st-sheet-name">{piece.name}</h2>
                <p className="st-sheet-cat">
                  {piece.category} · {status(piece).total} in the shop
                </p>
              </div>
              <button type="button" className="st-close" onClick={closePiece} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {problemBar}

            {groups.map((g) => (
              <section key={g.colour || "none"} className="st-colour-group" aria-label={g.colour || "Colour not set"}>
                <div className="st-colour-head">
                  <img src={img(g.photo)} alt="" loading="lazy" width={44} height={55} />
                  {g.colour ? (
                    <span className="st-colour">{g.colour}</span>
                  ) : (
                    /* Not a placeholder to fill in later: it is the honest
                       state until the shop says what colour the piece is,
                       and it is visible so it gets chased. */
                    <span className="st-nocolour" title="Nobody has confirmed what colour this piece is">
                      Colour not set
                    </span>
                  )}
                </div>

                <ul className="st-lines">
                  {g.lines.map((v) => {
                    const qty = state[v.id];
                    const working = busy?.id === v.id;
                    const edit = editing?.id === v.id ? editing : null;
                    const what = `${v.size}${v.colour ? `, ${v.colour}` : ""}`;
                    return (
                      <li key={v.id} className="st-line">
                        <span className="st-size">{v.size}</span>
                        <span className={qty === null ? "st-qty st-qty-none" : qty === 0 ? "st-qty st-qty-zero" : "st-qty"}>
                          {qty === null ? "Not counted" : qty === 0 ? "None left" : `${qty} in`}
                        </span>

                        {edit ? (
                          <form
                            className="st-count"
                            onSubmit={(e) => { e.preventDefault(); void saveCount(v.id, edit.value); }}
                          >
                            <button
                              type="button"
                              className="st-step"
                              aria-label="One fewer"
                              onClick={() => setEditing({ id: v.id, value: String(Math.max(0, (Number.parseInt(edit.value, 10) || 0) - 1)) })}
                            >
                              &minus;
                            </button>
                            <input
                              type="number"
                              inputMode="numeric"
                              min={0}
                              step={1}
                              value={edit.value}
                              onChange={(e) => setEditing({ id: v.id, value: e.target.value })}
                              aria-label={`How many ${what} are in the shop`}
                              autoFocus
                            />
                            <button
                              type="button"
                              className="st-step"
                              aria-label="One more"
                              onClick={() => setEditing({ id: v.id, value: String((Number.parseInt(edit.value, 10) || 0) + 1) })}
                            >
                              +
                            </button>
                            <button type="submit" className="st-save" disabled={working}>
                              {working ? "Saving…" : "Save"}
                            </button>
                            <button type="button" className="st-minor" onClick={() => setEditing(null)}>
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <div className="st-acts">
                            <button
                              type="button"
                              className="st-sold"
                              disabled={working || qty === null || qty === 0}
                              onClick={() => void send(v.id, "sold-in-shop")}
                              aria-label={`Sold one ${what}`}
                            >
                              {working && busy?.action === "sold-in-shop" ? "Saving…" : "Sold one"}
                            </button>
                            <button
                              type="button"
                              className="st-minor"
                              disabled={working}
                              onClick={() => void send(v.id, "returned")}
                              aria-label={`One ${what} came back`}
                            >
                              Returned
                            </button>
                            <button
                              type="button"
                              className="st-minor"
                              disabled={working}
                              onClick={() => setEditing({ id: v.id, value: String(qty ?? 0) })}
                              aria-label={`Set the count for ${what}`}
                            >
                              Set count
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        ) : null}
      </dialog>
    </main>
  );
}
