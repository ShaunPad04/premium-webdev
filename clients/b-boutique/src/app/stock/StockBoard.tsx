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
  /** The master list's colour total, where it does not split by size. */
  listTotals: Record<string, string>;
  /** In pence: what the website shows now, and what was last set here. */
  price: { live: number; saved: number };
  variants: BoardVariant[];
};

type Busy = { id: string; action: string } | null;
type Filter = "all" | "count" | "in" | "out";

const img = (name: string) => `/img/product/${name}-640.jpg`;

const pounds = (p: number) => `£${(p / 100).toFixed(p % 100 ? 2 : 0)}`;

/** "45", "£45", "44.99" -> pence. Parsed as text, never through a float
 *  (locked decision 12: money is integers in pence). */
function toPence(v: string): number | null {
  const m = /^\s*£?\s*(\d{1,3})(?:\.(\d{1,2}))?\s*$/.exec(v);
  if (!m) return null;
  return Number(m[1]) * 100 + Number((m[2] ?? "0").padEnd(2, "0"));
}

export function StockBoard({ pieces, autoUpdate }: { pieces: BoardPiece[]; autoUpdate: boolean }) {
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
  /* Prices (2026-10-02): what she last saved, per piece, and the price
     being changed: typing it, then confirming it in words. */
  const [prices, setPrices] = useState<Record<string, number>>(() =>
    Object.fromEntries(pieces.map((p) => [p.slug, p.price.saved])),
  );
  const [pricing, setPricing] = useState<{ value: string; confirm: number | null } | null>(null);

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
    setPricing(null);
    setOpen(slug);
  }
  function closePiece() {
    setOpen(null);
    setEditing(null);
    setPricing(null);
    opener.current?.focus();
  }

  async function send(id: string, action: string, extra?: Record<string, unknown>) {
    setBusy({ id, action });
    setProblem("");
    try {
      const res = await fetch("/stock/api", {
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

  function checkPrice(value: string) {
    const p = toPence(value);
    if (p === null || p < 100 || p > 99900) {
      setProblem("That needs to be a price between £1 and £999, like 45 or 44.99.");
      return;
    }
    setProblem("");
    setPricing({ value, confirm: p });
  }

  async function savePrice(slug: string, priceP: number) {
    setBusy({ id: slug, action: "price" });
    setProblem("");
    try {
      const res = await fetch("/stock/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "price", id: slug, qty: priceP }),
      });
      const data = (await res.json()) as { ok: boolean; code?: string };
      if (data.ok) {
        setPrices((s) => ({ ...s, [slug]: priceP }));
        setPricing(null);
      } else if (data.code === "not_signed_in") {
        setProblem("Signed out. Reload the page and put the passcode in again.");
      } else {
        setProblem("That did not save. Try again — the price has not changed.");
      }
    } catch {
      setProblem("No connection. Nothing was saved — try again in a moment.");
    } finally {
      setBusy(null);
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
          <form action="/stock/api" method="post" onSubmit={(e) => {
            e.preventDefault();
            void fetch("/stock/api", {
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
        <p className="st-todo">
          <b>{uncountedLines} {uncountedLines === 1 ? "size needs" : "sizes need"} counting.</b>{" "}
          The master list gives these as one total for the colour, not per
          size, so they cannot be filled in for you. Until they are counted
          the website still sells them, but cannot stop it selling more than
          you have. Tap <b>Needs counting</b> to see them.
        </p>
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

            <PriceRow
              name={piece.name}
              live={piece.price.live}
              saved={prices[piece.slug] ?? piece.price.saved}
              autoUpdate={autoUpdate}
              pricing={pricing}
              working={busy?.id === piece.slug}
              onStart={() => setPricing({ value: String((prices[piece.slug] ?? piece.price.saved) / 100), confirm: null })}
              onType={(value) => setPricing({ value, confirm: null })}
              onCheck={checkPrice}
              onSave={(p) => void savePrice(piece.slug, p)}
              onCancel={() => { setPricing(null); setProblem(""); }}
            />

            {groups.map((g) => (
              <section key={g.colour || "none"} className="st-colour-group" aria-label={g.colour || "Colour not set"}>
                <div className="st-colour-head">
                  <img src={img(g.photo)} alt="" loading="lazy" width={44} height={55} />
                  <span className="st-colour-text">
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
                    {piece.listTotals[g.colour] ? (
                      <span className="st-listtotal">{piece.listTotals[g.colour]}</span>
                    ) : null}
                  </span>
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

/** The piece's price, and changing it. One price for every colour. */
function PriceRow(props: {
  name: string;
  live: number;
  saved: number;
  autoUpdate: boolean;
  pricing: { value: string; confirm: number | null } | null;
  working: boolean;
  onStart: () => void;
  onType: (value: string) => void;
  onCheck: (value: string) => void;
  onSave: (priceP: number) => void;
  onCancel: () => void;
}) {
  const { name, live, saved, autoUpdate, pricing, working } = props;
  return (
    <section className="st-price" aria-label="Price">
      {!pricing ? (
        <div className="st-price-row">
          <span className="st-price-now">
            Price <b>{pounds(saved)}</b> <span className="st-price-all">every colour</span>
          </span>
          <button type="button" className="st-minor" onClick={props.onStart}>
            Change price
          </button>
        </div>
      ) : pricing.confirm === null ? (
        <form className="st-count" onSubmit={(e) => { e.preventDefault(); props.onCheck(pricing.value); }}>
          <label className="st-price-input">
            <span aria-hidden="true">£</span>
            <input
              type="text"
              inputMode="decimal"
              value={pricing.value}
              onChange={(e) => props.onType(e.target.value)}
              aria-label={`New price for ${name}, in pounds`}
              autoFocus
            />
          </label>
          <button type="submit" className="st-save">Next</button>
          <button type="button" className="st-minor" onClick={props.onCancel}>Cancel</button>
        </form>
      ) : (
        <div className="st-price-confirm" role="group" aria-label="Confirm the new price">
          <p>
            Change <b>{name}</b> from <b>{pounds(saved)}</b> to <b>{pounds(pricing.confirm)}</b>, on
            every colour? Customers will pay {pounds(pricing.confirm)}.
          </p>
          {/* A dropped or extra digit (£4 for £40) is still a valid price. */}
          {pricing.confirm < saved / 2 || pricing.confirm > saved * 2 ? (
            <p className="st-price-warn">
              That is a big change from {pounds(saved)}. Check the price before you save.
            </p>
          ) : null}
          <div className="st-acts">
            <button type="button" className="st-sold" disabled={working} onClick={() => props.onSave(pricing.confirm as number)}>
              {working ? "Saving…" : "Yes, change the price"}
            </button>
            <button type="button" className="st-minor" disabled={working} onClick={props.onCancel}>Back</button>
          </div>
        </div>
      )}
      {saved !== live && !pricing ? (
        <p className="st-price-note" role="status">
          {autoUpdate
            ? `Saved. The website is updating and shows ${pounds(saved)} in a few minutes.`
            : `Saved. The website still shows ${pounds(live)} until its next update.`}
        </p>
      ) : null}
    </section>
  );
}
