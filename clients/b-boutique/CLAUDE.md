@AGENTS.md

# Typography — APPROVED, do not change

Signed off by the client 2026-09-01; the wordmark MOVED 2026-09-02.

The large `B Boutique` wordmark is no longer in the hero — the approved hero
was the photograph with small type placed on it, and as of 2026-09-06 it is the
photograph and nothing else (see locked decision 5). The giant
wordmark now lives once, at the very end of the page, in the footer. That
footer wordmark is the source of truth for this treatment. Do not reintroduce a
giant wordmark to the hero; it was removed deliberately.

Preserve: high-contrast luxury fashion serif character · tall elegant
proportions · the current thin/thick stroke contrast · editorial presence ·
the cream/ivory treatment on the red hero.

Do not make it heavier, more generic, more traditional, more condensed or more
decorative. Do not offer alternative wordmark typography again — that decision
is closed.

## The hierarchy — one face per role, never the serif everywhere

| Role | Face | Where it is set |
|---|---|---|
| B Boutique branding | Bodoni Moda, via `.display` | The giant wordmark in `Footer.tsx`, and the small one in the `Nav.tsx` header — deliberately the *same* face at two sizes, so the identity reads as one thing |
| Large editorial statements | Bodoni Moda, via `.display` | `PointOfView.tsx`, section headings |
| Corner navigation | Archivo → **now Inter**, `font-extrabold uppercase` | `CornerMenu.tsx` menu labels |
| Small labels / numbers / metadata | JetBrains Mono → **now Inter**, `.label` for tracked caps | index numbers, section eyebrows, header and hero micro-type |
| Body copy | Jost → **now Inter** | everything else |

**Updated 2026-09-02:** the three UI faces collapsed into one. Jost, Archivo and
JetBrains Mono are gone; Inter does all of it. Bodoni Moda is unchanged and
still carries every editorial moment. `font-sans`, `font-grotesk` and
`font-mono` all alias to Inter so old classNames keep working.

`.display` and `.label` live in `@layer base` in `globals.css` and must stay
there. Unlayered CSS beats Tailwind v4 utilities outright, so moving them out
silently overrides every per-element `leading-*` and `tracking-*` on the site.

---

# Locked decisions — 2026-09-02

Signed off by the client. **Do not revisit any of these unless they explicitly
ask.** Each one is here because it was already argued out once; re-opening it
costs a review cycle and risks undoing a deliberate fix.

| # | Decision | Why it is not a bug |
|---|---|---|
| 1 | **Bodoni Moda + Inter.** | The reference board's Playfair Display + Montserrat annotation is not the source of truth. The prompt and the approved visual are. |
| 2 | ~~**The hero philosophy copy wraps naturally.**~~ **SUPERSEDED 2026-09-05: the hero philosophy line is removed.** | The client asked for it to be taken off the hero. The hero is now the photograph alone — the categories and SCROLL followed on 2026-09-06, see row 5. The words are not lost — they are the manifesto in `PointOfView.tsx`, section 01, verbatim, which is the only place they now appear as a statement. **Do not put them back on the hero**, and do not remove them from PointOfView. The original wrapping decision is kept above only so nobody re-litigates it if the line ever returns somewhere. |
| 3 | **SEARCH and BAG (0) are inert `<span>`s.** | Visually part of the approved header, but there is no search index and no cart. Nothing to click, nothing to tab to, `aria-hidden` so AT does not announce a dead control. Swap in an `<a>`/`<button>` and drop the aria-hidden the day either becomes real. Never fake cart state, checkout or a search backend. |
| 4 | **`LocalTime.tsx` stays.** | Unused since the header lost the Cleethorpes clock. Unrelated code is not deleted as a side effect of other work. |
| 5 | ~~**The mobile hero category placement stays.**~~ **SUPERSEDED 2026-09-06: the hero category labels are removed entirely.** | The client asked for WOMENSWEAR, ACCESSORIES and HOMEWARE to be taken off the left of the hero, and for SCROLL to be taken off the bottom. The hero is now the photograph alone. **The header was explicitly to be left alone and nothing was taken out of it** — it keeps NEW IN / CLOTHING / ACCESSORIES / BRANDS / ABOUT, and gained CONTACT on 2026-09-06 when the contact page was built. The corner menu still routes to Homeware. `HERO_CATEGORIES` remains exported from `lib/nav.ts` in case the labels are ever wanted back. The placement decision is kept above only so nobody re-litigates it if they return. |
| 6 | **The focus ring is `currentColor`.** | A fixed token cannot work: the ring runs over a black header, a photograph, a cool-white FAQ and a black footer. `var(--gold)` went black-on-black over the hero the moment gold was retired. Focusable text already contrasts with its own background, so borrowing its colour inherits that. Do not introduce a special focus colour. |
| 7 | **Hero parallax: ~32px desktop, ~11px mobile.** | Same travel eats far more of a taller crop seen through a shorter window, hence the two figures. |
| 9 | **The address is confirmed: 18 Sea View Street, Cleethorpes, DN35 8EZ.** | Client-confirmed 2026-09-02. The original brief said DN35 8HY; that is wrong and must never return. Neither may "6 Market Street", which belongs to a different project. Every address on the site derives from `shop.ts` — change it there or nowhere. The **parking claim** ("on-street parking at the top, Market Place car park a two-minute walk") was a separate, still-UNVERIFIED claim and has now been removed from both Visit and the FAQ. Do not reinstate it, or invent parking availability, prices, walking times, street rules or car park names, until the client confirms it in their own words. |
| 8 | **No hero scale, no hero pinning.** | The 140vh sticky track is gone: it moved nothing for 40vh and put a blank spacer before the brand rail. The hero is exactly 100svh and the rail begins at its bottom edge. |
| 10 | **The phone number is confirmed: 07305534342.** | Given by the client in chat, 2026-09-06. It lives in `shop.ts` and nowhere else; `phoneDisplay` groups it as `07305 534342` for reading while `tel:` links use the raw digits. **There is still no email address** — `shop.email` is empty on purpose, nothing on the site prints one, and none may be guessed. |
| 11 | **The contact form must never report success without a send.** | `/api/contact` answers 503 `not_configured` until `CONTACT_TO`, `CONTACT_FROM` and `RESEND_API_KEY` all exist, and the form shows a plainly worded failure plus the phone number. Do not "fix" this by faking a thank-you, by removing the form, or by pointing it at a guessed address. Setting those three variables is a launch BLOCKER; see `.env.example`. |

## The routes

Five pages as of 2026-09-06: `/`, `/clothing`, `/accessories`, `/about`, `/contact`,
plus the `POST /api/contact` handler.

Because the header, corner menu and footer appear on all of them, **every
same-page anchor in `lib/nav.ts` is written `/#section`, never `#section`** — a
bare fragment means "a section of whatever page you are on", which is nothing at
all on four routes out of five. `/#x` is a plain same-document scroll on the home
page and a navigation everywhere else.

`/clothing` and `/accessories` carry no links into individual products, and that
is deliberate rather than unfinished: there is no catalogue, no basket and no
per-item page anywhere in this codebase. See the comment at the top of
`CategoryGrid.tsx`.

## Authority order when instructions conflict

1. What the client says in chat
2. An approved implementation prompt
3. The approved visual reference
4. Text annotations inside old reference boards
5. The existing legacy implementation

Legacy colours, fonts and placeholder design never override the approved
redesign.
