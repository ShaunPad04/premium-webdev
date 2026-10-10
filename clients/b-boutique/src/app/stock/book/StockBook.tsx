"use client";

import { useState } from "react";

import type { BookColour, BookEntry } from "@/lib/stock-book";

/** The stock book page (2026-10-10). Phone-first like the stock list: she
 *  fills it in at the counter when a delivery comes. One form at the top,
 *  then three lists: waiting for us, needs her answer, on the website.
 *
 *  Nothing moves optimistically. A piece appears in the list only once the
 *  server has it, so she never walks away believing something was sent. */

type Draft = { url: string; name: string; price: string; colours: { colour: string; qty: string; sizes: string }[]; notes: string };
const empty = (): Draft => ({ url: "", name: "", price: "", colours: [{ colour: "", qty: "", sizes: "" }], notes: "" });

function pence(text: string): number | null {
  const t = text.replace(/[£,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
  return Math.round(parseFloat(t) * 100);
}
const pounds = (p: number) => `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: p % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
const when = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };
const fromSlug = (u: string) => {
  try {
    const s = new URL(u).pathname.split("/").filter(Boolean).pop() ?? "";
    return s.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
  } catch { return ""; }
};

async function call(body: Record<string, unknown>): Promise<{ ok: boolean; entry?: BookEntry; problem?: string; status: number }> {
  try {
    const res = await fetch("/stock/api/book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as { entry?: BookEntry; problem?: string };
    return { ok: res.ok, entry: data.entry, problem: data.problem, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

export function StockBook({ entries }: { entries: BookEntry[] }) {
  const [rows, setRows] = useState<BookEntry[]>(entries);
  const [draft, setDraft] = useState<Draft>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const setColour = (i: number, patch: Partial<Draft["colours"][number]>) =>
    setDraft((d) => ({ ...d, colours: d.colours.map((c, j) => (j === i ? { ...c, ...patch } : c)) }));

  function toast(text: string) {
    setNote(text);
    window.setTimeout(() => setNote(""), 2400);
  }

  function validate(): { entry?: Record<string, unknown>; problem?: string } {
    if (!/^https?:\/\/\S+\.\S+/.test(draft.url.trim())) return { problem: "Paste the supplier's page link, starting with http." };
    const priceP = pence(draft.price);
    if (priceP === null || priceP < 100 || priceP > 99900) return { problem: "Enter the price in pounds, like 26 or 44.99." };
    const colours: BookColour[] = [];
    for (const c of draft.colours) {
      if (!c.colour.trim() && !c.qty.trim() && !c.sizes.trim()) continue;
      if (!c.colour.trim()) return { problem: "Every colour row needs a colour name." };
      if (!/^\d+$/.test(c.qty.trim()) || Number(c.qty) < 1) return { problem: `How many ${c.colour.trim()}? A whole number, 1 or more.` };
      colours.push({ colour: c.colour.trim(), qty: Number(c.qty), sizes: c.sizes.trim() });
    }
    if (colours.length === 0) return { problem: "Add at least one colour with how many you have." };
    return { entry: { url: draft.url.trim(), name: draft.name.trim(), priceP, colours, notes: draft.notes.trim() } };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setProblem("");
    const v = validate();
    if (v.problem) { setProblem(v.problem); return; }
    setBusy(true);
    const res = editing ? await call({ action: "edit", id: editing, entry: v.entry }) : await call({ action: "add", entry: v.entry });
    setBusy(false);
    if (!res.ok || !res.entry) {
      setProblem(res.problem ?? (res.status === 401 ? "You have been signed out. Reload the page and sign in again." : "That did not save. Check your signal and try again."));
      return;
    }
    const saved = res.entry;
    setRows((r) => (editing ? r.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...r]));
    toast(editing ? "Saved." : "Added to the book.");
    setEditing(null);
    setDraft(empty());
  }

  function startEdit(x: BookEntry) {
    setEditing(x.id);
    setDraft({
      url: x.url, name: x.name, price: (x.priceP / 100).toString(),
      colours: x.colours.map((c) => ({ colour: c.colour, qty: String(c.qty), sizes: c.sizes })), notes: x.notes,
    });
    setProblem("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id: string) {
    const res = await call({ action: "remove", id });
    setRemoving(null);
    if (!res.ok) { toast("That did not work. Try again."); return; }
    setRows((r) => r.filter((x) => x.id !== id));
    if (editing === id) { setEditing(null); setDraft(empty()); }
    toast("Removed.");
  }

  async function answer(id: string) {
    const text = (answers[id] ?? "").trim();
    if (!text) return;
    const res = await call({ action: "answer", id, answer: text });
    if (!res.ok || !res.entry) { toast("That did not send. Try again."); return; }
    const saved = res.entry;
    setRows((r) => r.map((x) => (x.id === id ? saved : x)));
    toast("Sent.");
  }

  const waiting = rows.filter((x) => x.status === "new");
  const asked = rows.filter((x) => x.status === "question");
  const live = rows.filter((x) => x.status === "done");

  return (
    <main id="main" className="st sb">
      <header className="st-top sb-top">
        <div className="st-top-row">
          <h1 className="st-title">New stock</h1>
          <a href="/stock" className="st-out">Stock list</a>
          <form action="/stock/api" method="post" onSubmit={(e) => {
            e.preventDefault();
            void fetch("/stock/api", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "sign-out" }) })
              .then(() => window.location.reload());
          }}>
            <button type="submit" className="st-out">Sign out</button>
          </form>
        </div>
      </header>

      <div className="sb-wrap">
        <p className="sb-lede">
          Add each new piece as it arrives: the supplier&rsquo;s page, the price, and how many of each colour.
          We pick it up from here, do the photos, and put it on the website. It moves to <b>On the website</b> when it is live.
        </p>

        <form className="sb-form" onSubmit={submit} noValidate>
          <label className="sb-label" htmlFor="sb-url">Supplier page link</label>
          <input id="sb-url" type="url" inputMode="url" autoComplete="off" placeholder="https://www.babezlondon.com/…"
            value={draft.url} onChange={(e) => set({ url: e.target.value })} />
          <p className="sb-hint">The page with the photos and colours. We read the name, fabric and sizes from it.</p>

          <label className="sb-label" htmlFor="sb-name">Name on the rail <span>(optional, if you want it called something different)</span></label>
          <input id="sb-name" type="text" autoComplete="off" placeholder="e.g. Check barrel trousers"
            value={draft.name} onChange={(e) => set({ name: e.target.value })} />

          <label className="sb-label" htmlFor="sb-price">Price, as it will show on the website</label>
          <div className="sb-money"><span aria-hidden="true">£</span>
            <input id="sb-price" type="text" inputMode="decimal" autoComplete="off" placeholder="26"
              value={draft.price} onChange={(e) => set({ price: e.target.value })} />
          </div>

          <fieldset className="sb-colours">
            <legend className="sb-label">Colours and how many</legend>
            <div className="sb-colour-head" aria-hidden="true"><span>Colour</span><span>How many</span><span className="sb-sizes">Sizes</span><span /></div>
            {draft.colours.map((c, i) => (
              <div className="sb-colour-row" key={i}>
                <input type="text" aria-label="Colour" autoComplete="off" placeholder="Brown" value={c.colour} onChange={(e) => setColour(i, { colour: e.target.value })} />
                <input type="text" aria-label="How many" inputMode="numeric" autoComplete="off" placeholder="2" value={c.qty} onChange={(e) => setColour(i, { qty: e.target.value })} />
                <input type="text" aria-label="Sizes" className="sb-sizes" autoComplete="off" placeholder="one size, or 2 S, 2 M, 3 L" value={c.sizes} onChange={(e) => setColour(i, { sizes: e.target.value })} />
                <button type="button" className="sb-x" aria-label="Remove this colour"
                  onClick={() => setDraft((d) => ({ ...d, colours: d.colours.length > 1 ? d.colours.filter((_, j) => j !== i) : [{ colour: "", qty: "", sizes: "" }] }))}>×</button>
              </div>
            ))}
            <button type="button" className="st-reset sb-add" onClick={() => setDraft((d) => ({ ...d, colours: [...d.colours, { colour: "", qty: "", sizes: "" }] }))}>
              + Add another colour
            </button>
            <p className="sb-hint">Sizes: &ldquo;one size&rdquo;, or how many of each, like &ldquo;2 S, 2 M, 3 L&rdquo;. If you only know the total, leave sizes blank and we will ask.</p>
          </fieldset>

          <label className="sb-label" htmlFor="sb-notes">Anything else <span>(optional)</span></label>
          <textarea id="sb-notes" placeholder="e.g. the supplier calls the green one Khaki" value={draft.notes} onChange={(e) => set({ notes: e.target.value })} />

          {problem ? <p className="sb-problem" role="alert">{problem}</p> : null}
          <div className="sb-actions">
            <button type="submit" className="st-gate-go sb-go" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Add to the book"}</button>
            {editing ? <button type="button" className="st-minor sb-cancel" onClick={() => { setEditing(null); setDraft(empty()); setProblem(""); }}>Cancel</button> : null}
          </div>
        </form>

        <Section title="Waiting for us" items={waiting} emptyText="Nothing waiting. Add a piece above and it appears here.">
          {(x) => (
            <div className="sb-acts">
              {removing === x.id ? (
                <>
                  <span>Remove this piece from the book?</span>
                  <button type="button" className="st-reset" onClick={() => remove(x.id)}>Yes, remove</button>
                  <button type="button" className="st-reset" onClick={() => setRemoving(null)}>Keep it</button>
                </>
              ) : (
                <>
                  <button type="button" className="st-reset" onClick={() => startEdit(x)}>Edit</button>
                  <button type="button" className="st-reset" onClick={() => setRemoving(x.id)}>Remove</button>
                </>
              )}
            </div>
          )}
        </Section>

        {asked.length ? (
          <Section title="Needs your answer" items={asked}>
            {(x) => (
              <div className="sb-reply">
                <p>{x.reply || "We have a question about this one."}</p>
                <textarea aria-label="Your answer" placeholder="Your answer" value={answers[x.id] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [x.id]: e.target.value }))} />
                <div className="sb-acts">
                  <button type="button" className="st-minor" onClick={() => answer(x.id)}>Send answer</button>
                  <button type="button" className="st-reset" onClick={() => startEdit(x)}>Edit the piece</button>
                </div>
              </div>
            )}
          </Section>
        ) : null}

        {live.length ? (
          <Section title="On the website" items={live}>
            {(x) => (x.productUrl ? <p className="sb-live"><a href={x.productUrl} target="_blank" rel="noopener">See it on the website ↗</a></p> : null)}
          </Section>
        ) : null}
      </div>

      {note ? <div className="sb-toast" role="status">{note}</div> : null}
    </main>
  );
}

const CHIP: Record<BookEntry["status"], string> = { new: "Waiting for us", question: "Needs your answer", done: "On the website" };

function Section({ title, items, emptyText, children }: {
  title: string; items: BookEntry[]; emptyText?: string; children: (x: BookEntry) => React.ReactNode;
}) {
  return (
    <section className="sb-sec" aria-label={title}>
      <h2 className="sb-h2">{title} <span className="st-tab-n">{items.length}</span></h2>
      {items.length === 0 && emptyText ? <p className="sb-empty">{emptyText}</p> : null}
      {items.map((x) => (
        <article className="sb-card" key={x.id}>
          <div className="sb-card-top">
            <div>
              <p className="sb-name">{x.name || fromSlug(x.url) || host(x.url)}</p>
              <p className="sb-meta"><a href={x.url} target="_blank" rel="noopener">{host(x.url)} ↗</a> · added {when(x.createdAt)}</p>
            </div>
            <div className="sb-card-right">
              <span className="sb-price">{pounds(x.priceP)}</span>
              <span className={`sb-chip sb-chip--${x.status}`}>{CHIP[x.status]}</span>
            </div>
          </div>
          <div className="sb-swatches">
            {x.colours.map((c, i) => <span key={i}>{c.colour} × {c.qty}{c.sizes ? ` · ${c.sizes}` : ""}</span>)}
          </div>
          {x.notes ? <p className="sb-meta">{x.notes}</p> : null}
          {x.answer && x.status !== "question" ? <p className="sb-meta">Your answer: {x.answer}</p> : null}
          {children(x)}
        </article>
      ))}
    </section>
  );
}
