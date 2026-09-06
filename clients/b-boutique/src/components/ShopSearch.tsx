"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Product } from "@/lib/catalogue";
import { SEARCH_SUGGESTIONS, searchProducts } from "@/lib/search";
import { phoneDisplay, shop } from "@/lib/shop";
import { ProductGrid } from "./ProductGrid";

/* The shop's search field and the grid it filters.
 *
 * One client component around both, because the grid is what changes: a
 * separate search box that posted somewhere would be a page load per
 * keystroke for a list of twenty-six things the browser already has.
 *
 * ── Why there is no ?q= in the URL ────────────────────────────────────────
 * A shareable search URL is a real feature and this deliberately does not have
 * one. Reading a search param on a statically rendered route means a Suspense
 * boundary and a second render pass, for a catalogue small enough that the
 * result is a scroll away either way. Worth adding the day the shop is big
 * enough that people link each other to searches. Said once, not built.
 *
 * ── Why the whole thing degrades ──────────────────────────────────────────
 * The form is a real <form role="search"> that does nothing on submit except
 * stop the browser reloading. Before hydration, and with JavaScript off, the
 * page below is the full catalogue rather than an empty grid waiting on a
 * script — the search adds to the shop, it is not a gate in front of it. */
export function ShopSearch({ items }: { items: Product[] }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchProducts(items, query), [items, query]);

  const searching = query.trim().length > 0;
  const count = results.length;

  /* The suggestions offered under an empty result, checked against the
     catalogue rather than trusted. A suggestion for a category that has
     nothing in it sends somebody from one empty result to another, and worse,
     implies the shop stocks something it does not. If a category empties, its
     chip disappears on its own. */
  const suggestions = useMemo(
    () => SEARCH_SUGGESTIONS.filter((s) => items.some((p) => p.category === s)),
    [items],
  );

  /* Land on the field when the header's SEARCH sent you here.
   *
   * Measured, not assumed. Loading /shop#find directly works — the browser
   * does its own fragment scroll and .find's scroll-margin-top parks it 108px
   * down, clear of the 72px header. Arriving by clicking SEARCH in the header
   * does NOT: that is a client-side navigation, the App Router restores the
   * scroll position to the top, and the URL ends in #find with the field
   * still 735px below the fold. Measured both: scrollY 627 on a direct load,
   * scrollY 0 on the click.
   *
   * So this runs once, on mount — which is exactly when a client navigation
   * mounts the component — and only when the fragment actually names this
   * field. It re-does the browser's own instant jump rather than adding a
   * scroll of its own, so there is nothing here to make reduced-motion sick.
   */
  useEffect(() => {
    if (window.location.hash !== "#find") return;
    /* Deferred by a frame on purpose. The router does its own scroll
       restoration after the navigation commits, which is after this effect
       runs — scrolling here directly is undone a moment later, and was
       (measured: scrollY still 0). Running on the next frame puts this last.

       And it has to go through Lenis when Lenis is running. A plain
       scrollIntoView sets the scroll position, and Lenis's own rAF then pulls
       it straight back to where it thinks the page is: measured, that landed
       at scrollY 8 out of 627, which looks like nothing happened. Lenis is
       lazy-loaded and absent under prefers-reduced-motion, so the native call
       is the fallback rather than the exception. */
    /* Re-asserted for a few frames rather than fired once on a guessed
       delay. One rAF loses to the restoration (measured: scrollY 8 of 627);
       a 260ms timeout won, but a number picked to beat a race is a number
       that loses on a slower machine. This simply holds the position until
       the router has finished moving it, and gives up either way after
       400ms.

       No offset here: .find carries scroll-margin-top: 108px and Lenis
       honours it. Passing -108 as well landed the field at 216 rather than
       108, which is the same offset applied twice. */
    const started = performance.now();
    let raf = 0;
    let stopped = false;

    /* Any deliberate scroll of their own ends it immediately. Nothing is
       worse than a page that drags you back while you are trying to leave. */
    const abandon = () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
    const opts = { passive: true, once: true } as const;
    window.addEventListener("wheel", abandon, opts);
    window.addEventListener("touchstart", abandon, opts);
    window.addEventListener("keydown", abandon, opts);

    const tick = () => {
      if (stopped) return;
      const el = document.getElementById("find");
      if (el) {
        const lenis = window.__lenis;
        if (lenis) lenis.scrollTo(el, { immediate: true });
        else el.scrollIntoView();
      }
      if (performance.now() - started < 400) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", abandon);
      window.removeEventListener("touchstart", abandon);
      window.removeEventListener("keydown", abandon);
    };
  }, []);

  /* What a screen reader hears, and the one thing that is deliberately late.
     The visible count updates on every keystroke, which is right for eyes;
     announcing it on every keystroke would read "24 pieces, 9 pieces, 4
     pieces, 2 pieces" over somebody still typing. So the live region lags by
     a beat and announces where the typing landed.

     setState here is inside a timer, not in the effect body — the effect
     schedules, the timer sets. */
  const [announced, setAnnounced] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => {
      setAnnounced(
        !searching
          ? ""
          : count === 0
            ? `No pieces match ${query.trim()}.`
            : `${count} ${count === 1 ? "piece" : "pieces"} match ${query.trim()}.`,
      );
    }, 450);
    return () => window.clearTimeout(id);
  }, [query, count, searching]);

  return (
    <>
      <form
        id="find"
        role="search"
        className="find"
        aria-label="Search the shop"
        onSubmit={(e) => {
          /* Nothing to submit to: the results are already on screen and
             changed as the query was typed. Enter should therefore do
             nothing visible rather than reload the page and lose them.
             Blurring closes the keyboard on a phone, which is what pressing
             the return key there is actually asking for. */
          e.preventDefault();
          inputRef.current?.blur();
        }}
      >
        <label className="find-label" htmlFor="shop-q">
          Search the shop
        </label>

        <div className="find-field">
          <svg
            className="find-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            aria-hidden="true"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M15.4 15.4 21 21" strokeLinecap="round" />
          </svg>

          <input
            ref={inputRef}
            id="shop-q"
            /* type="search" rather than text: it gets the platform's own
               clear affordance and the right virtual keyboard, and the
               `search` return key instead of a newline. */
            type="search"
            className="find-input"
            placeholder="Coat, silk, knitwear…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            /* No autoFocus. The field sits partway down a page somebody
               arrived at to look at photographs; stealing focus on load
               scrolls them past the masthead they came for, and on a phone it
               throws a keyboard over half the shop. */
          />

          {searching ? (
            <button
              type="button"
              className="find-clear"
              /* A word, not a bare glyph: the × alone is a character whose
                 spoken name varies by voice. The label extends the visible
                 word rather than replacing it — WCAG 2.5.3 wants the visible
                 text to be *inside* the accessible name, so somebody using
                 voice control can say "Clear" and be understood. An earlier
                 version stacked an sr-only "Clear search" on top of a visible
                 "Clear" and the button announced itself as "Clear search
                 Clear". */
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
            >
              Clear
            </button>
          ) : null}
        </div>

        <p className="find-count" aria-hidden="true">
          {searching
            ? count === 0
              ? "No pieces match."
              /* "1 of 26 pieces" — the plural belongs to the 26, not the 1.
                 Pluralising on `count` produced "1 of 26 piece". */
              : `${count} of ${items.length} pieces`
            : `${items.length} pieces`}
        </p>

        {/* The same information, announced rather than shown, on a delay.
            aria-hidden on the visible line above stops it being read twice. */}
        <p className="sr-only" role="status" aria-live="polite">
          {announced}
        </p>
      </form>

      {count > 0 ? (
        /* The key restarts the grid's entrance animation when the result set
           changes, so filtered pieces arrive rather than silently swapping
           underneath the reader. Without it React reuses the cards and the
           grid appears to have always held these four. */
        <ProductGrid key={query} items={results} idPrefix="shop" />
      ) : (
        <div className="find-empty">
          <p className="find-empty-lede">
            Nothing on the rails matches <strong>{query.trim()}</strong>.
          </p>
          {/* An empty result is where a shop loses somebody, so it ends
              somewhere real rather than at a dead end. Everything offered
              below exists: the categories are pages, and the number is the
              client's own, confirmed. Nothing here promises that a piece can
              be found, ordered in or held — none of that is known. */}
          <p className="find-empty-body">
            Stock changes weekly and one room only holds so much. Try a
            category, or ring the shop on{" "}
            <a className="find-empty-tel" href={`tel:${shop.phone}`}>
              {phoneDisplay}
            </a>{" "}
            and ask what is in.
          </p>
          <ul className="find-sugg">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  className="find-sugg-btn"
                  onClick={() => {
                    setQuery(s);
                    inputRef.current?.focus();
                  }}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
          <p className="find-empty-alt">
            Or see <Link href="/clothing">everything on the rails</Link>.
          </p>
        </div>
      )}
    </>
  );
}
