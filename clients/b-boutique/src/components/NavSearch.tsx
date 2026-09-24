"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { products } from "@/lib/catalogue";
import { liveSuggestions, searchProducts } from "@/lib/search";
import { shop } from "@/lib/shop";
import { ProductPhoto } from "./ProductPhoto";
import { ExpandingSearchDock } from "./ui/expanding-search-dock-shadcnui";
import { Price } from "@/components/Price";

/* Search, in the header, without leaving the page.
 *
 * ── What this replaces ────────────────────────────────────────────────────
 * A next/link to `/shop#find`. That was the right call when it was made —
 * locked decision 3 says never fake a search that finds things the shop does
 * not have, and pointing at the real filter on the real grid honoured it — but
 * the client's objection is a usability one and it stands on its own: pressing
 * SEARCH threw away whatever page you were reading. Somebody halfway down
 * /about who wants to know whether there is a camel coat should not lose
 * /about to find out.
 *
 * So the field comes to the reader. The rule it was protecting is untouched,
 * because this panel does not implement a second search: it calls the SAME
 * `searchProducts` over the SAME catalogue that `/shop` filters. There is one
 * definition of what the shop can be found by, and this is a second surface
 * onto it rather than a second copy of it.
 *
 * ── It is not a modal ─────────────────────────────────────────────────────
 * It is a panel under the header, on the page, and the page stays where it
 * was. Nothing behind it is made inert and nothing is trapped, because
 * nothing here needs to be: a customer who scrolls away has dismissed it,
 * which is a reasonable thing to let them do. Escape closes and returns focus
 * to the trigger; a click outside closes; so does following a result.
 *
 * ── What it may and may not say ───────────────────────────────────────────
 * Every price in the catalogue is invented (locked decision 15), so this
 * panel shows a price only through `formatPrice` on the same `priceP` the bag
 * and the checkout use — it cannot become a second, quietly diverging price
 * list, which is the trap `newIn` avoids by carrying no price at all.
 *
 * The empty result is not a dead end and is not an apology. It carries the
 * confirmed EMAIL ADDRESS — the phone number until 2026-09-21, when the
 * client asked for numbers to come off the site, which makes this the only
 * remaining route — and the category chips, exactly as `/shop` does, and
 * the chips are checked against the catalogue at render so a suggestion can
 * never point at an empty shelf. A colour search finding nothing is the
 * honest answer until the client supplies colours; see lib/search.ts. */

/** Enough to answer "do they have one", not a second shop page. The full
 *  grid is one keystroke away and the panel says so. */
const MAX_RESULTS = 6;

export function NavSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const wrap = useRef<HTMLDivElement>(null);
  const panelId = useId();

  /* An empty query is not a search — it returns the whole catalogue, which as
     a dropdown is just the shop rendered badly. Nothing shows until a word
     does. */
  const query = q.trim();
  const results = useMemo(
    () => (query ? searchProducts(products, query) : []),
    [query],
  );

  /* Checked against the catalogue at render rather than trusted from the
     constant, so a chip can never offer a category the shop has emptied. */
  const chips = useMemo(() => liveSuggestions(products), []);

  /* Escape closes and hands focus back to the trigger, which is where the
     keyboard user was and where they want to carry on from. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      /* After the render that un-hides the trigger. */
      requestAnimationFrame(() => trigger.current?.focus());
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  /* A pointer down anywhere outside the trigger or the panel closes it.
     `pointerdown` rather than `click`: a click that lands on a result should
     follow the link, and by the time `click` fires on the document the panel
     would already have gone. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={wrap} className="navsearch">
      {/* The 21st.dev expanding dock replaces the SEARCH word (2026-09-23,
          Brad). It is only the field; the results below are unchanged. */}
      <ExpandingSearchDock
        open={open}
        onOpenChange={setOpen}
        value={q}
        onValueChange={setQ}
        onSearch={(v) => {
          setOpen(false);
          router.push(`/shop?q=${encodeURIComponent(v)}#find`);
        }}
        placeholder="Coats, knitwear, a silk dress…"
        controls={panelId}
        triggerRef={trigger}
      />

      {open ? (
        <div id={panelId} className="navsearch-panel">
          <div className="navsearch-inner">
            {/* Announced politely so a screen reader hears the count change
                without the field being interrupted on every keystroke. */}
            <p aria-live="polite" className="sr-only">
              {query
                ? `${results.length} ${results.length === 1 ? "piece" : "pieces"} found for ${query}`
                : ""}
            </p>

            {query && results.length > 0 ? (
              <>
                <ul className="navsearch-results">
                  {results.slice(0, MAX_RESULTS).map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/shop/${p.slug}`}
                        onClick={close}
                        className="navsearch-hit"
                      >
                        <span className="navsearch-thumb">
                          <ProductPhoto
                            photo={p.photo}
                            square={p.category === "Homeware"}
                            alt=""
                            sizes="64px"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        </span>
                        <span className="navsearch-hit-body">
                          <span className="navsearch-hit-name">{p.name}</span>
                          <span className="navsearch-hit-meta">
                            {p.category} · <Price priceP={p.priceP} />
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/shop?q=${encodeURIComponent(query)}#find`}
                  onClick={close}
                  className="navsearch-all"
                >
                  {results.length > MAX_RESULTS
                    ? `See all ${results.length} in the shop`
                    : "See these in the shop"}
                  <span aria-hidden="true"> &rarr;</span>
                </Link>
              </>
            ) : null}

            {query && results.length === 0 ? (
              <div className="navsearch-empty">
                <p className="navsearch-empty-lead">
                  Nothing here matches “{query}”.
                </p>
                {/* The honest ending. The shop is small and a person can
                    answer in one sentence what a filter cannot answer at
                    all — and the number is the confirmed one, from shop.ts. */}
                <p className="navsearch-empty-help">
                  {/* Email, not a phone. The number came off the site at the
                      client's instruction on 2026-09-21, so this is the only
                      route left — which makes it more important, not less,
                      that it is here rather than behind the contact form. */}
                  It may still be in the shop. Email{" "}
                  <a href={`mailto:${shop.email}`} className="navsearch-tel">
                    {shop.email}
                  </a>{" "}
                  and ask.
                </p>
                <ul className="navsearch-chips">
                  {chips.map((c) => (
                    <li key={c}>
                      <button
                        type="button"
                        onClick={() => setQ(c)}
                        className="navsearch-chip"
                      >
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {!query ? (
              <ul className="navsearch-chips navsearch-chips--rest">
                {chips.map((c) => (
                  <li key={c}>
                    <button
                      type="button"
                      onClick={() => setQ(c)}
                      className="navsearch-chip"
                    >
                      {c}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
