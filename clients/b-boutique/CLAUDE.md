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
| 3 | ~~**SEARCH and BAG (0) are inert `<span>`s.**~~ **FULLY SUPERSEDED 2026-09-06: both are real.** | The rule said to swap in a real control "the day either becomes real". BAG became real when the shop was built and is an `<a>` to `/bag` with a live count. SEARCH became real later the same day: `/shop` carries a field that filters the catalogue (`lib/search.ts`, `ShopSearch.tsx`), so the header's SEARCH is now a `next/link` to `/shop#find` with no aria-hidden. Neither span remains. The underlying rule is what is locked, not the spans: **never fake cart state, checkout, or a search that finds things the shop does not have.** |
| 4 | **`LocalTime.tsx` stays.** | Unused since the header lost the Cleethorpes clock. Unrelated code is not deleted as a side effect of other work. |
| 5 | ~~**The mobile hero category placement stays.**~~ **SUPERSEDED 2026-09-06: the hero category labels are removed entirely.** | The client asked for WOMENSWEAR, ACCESSORIES and HOMEWARE to be taken off the left of the hero, and for SCROLL to be taken off the bottom. The hero is now the photograph alone. **The header was explicitly to be left alone and nothing was taken out of it** — it keeps NEW IN / CLOTHING / ACCESSORIES / BRANDS / ABOUT, and gained CONTACT on 2026-09-06 when the contact page was built. The corner menu still routes to Homeware. `HERO_CATEGORIES` remains exported from `lib/nav.ts` in case the labels are ever wanted back. The placement decision is kept above only so nobody re-litigates it if they return. |
| 6 | **The focus ring is `currentColor`.** | A fixed token cannot work: the ring runs over a black header, a photograph, a cool-white FAQ and a black footer. `var(--gold)` went black-on-black over the hero the moment gold was retired. Focusable text already contrasts with its own background, so borrowing its colour inherits that. Do not introduce a special focus colour. |
| 7 | **Hero parallax: ~32px desktop, ~11px mobile.** | Same travel eats far more of a taller crop seen through a shorter window, hence the two figures. |
| 9 | **The address is confirmed: 18 Sea View Street, Cleethorpes, DN35 8EZ.** | Client-confirmed 2026-09-02. The original brief said DN35 8HY; that is wrong and must never return. Neither may "6 Market Street", which belongs to a different project. Every address on the site derives from `shop.ts` — change it there or nowhere. The **parking claim** ("on-street parking at the top, Market Place car park a two-minute walk") was a separate, still-UNVERIFIED claim and has now been removed from both Visit and the FAQ. Do not reinstate it, or invent parking availability, prices, walking times, street rules or car park names, until the client confirms it in their own words. |
| 8 | **No hero scale, no hero pinning.** | The 140vh sticky track is gone: it moved nothing for 40vh and put a blank spacer before the brand rail. The hero is exactly 100svh and the rail begins at its bottom edge. |
| 10 | **The phone number is confirmed: 07305534342.** | Given by the client in chat, 2026-09-06. It lives in `shop.ts` and nowhere else; `phoneDisplay` groups it as `07305 534342` for reading while `tel:` links use the raw digits. **There is still no email address** — `shop.email` is empty on purpose, nothing on the site prints one, and none may be guessed. |
| 11 | **The contact form must never report success without a send.** | `/api/contact` answers 503 `not_configured` until `CONTACT_TO`, `CONTACT_FROM` and `RESEND_API_KEY` all exist, and the form shows a plainly worded failure plus the phone number. Do not "fix" this by faking a thank-you, by removing the form, or by pointing it at a guessed address. Setting those three variables is a launch BLOCKER; see `.env.example`. |
| 12 | **Money is integers in pence, everywhere.** | `0.1 + 0.2` is not `0.3` in binary floating point, and a basket totalling £74.99999999 is a rounding bug waiting to be charged to somebody. Prices are `priceP` integers from the catalogue to the provider; the single division is `formatPrice` for display, and one more at the very edge where SumUp's API wants a decimal. Never store, add or compare money as pounds. |
| 13 | **The server prices the bag, never the browser.** | `/api/checkout` takes slugs, sizes and quantities and ignores anything else the client sends. A total posted from a browser is a total somebody sets to 1p. Verified: a request carrying a forged `priceP` is accepted and the field is simply not read. |
| 14 | **The shop must never confirm an order it did not take.** | `/api/checkout` answers 503 `not_configured` until `SUMUP_API_KEY`, `SUMUP_MERCHANT_CODE` and `NEXT_PUBLIC_SITE_URL` all exist, and the bag says plainly that nothing has been charged. Landing on `/checkout/success` means a browser followed a URL, not that money moved, so **the page asks SumUp rather than reading the URL**: `GET /v0.1/checkouts?checkout_reference=…`, authenticated, server-side (`lib/sumup.ts`). PAID, FAILED/EXPIRED and "we could not find out" are three different pages, and the bag is emptied on PAID alone. **Correction, 2026-09-08:** this row previously said a webhook was the proof. SumUp publishes no payment webhook — see the SumUp section below — so the query is the mechanism, not a placeholder for one. |
| 15 | **Every price in `lib/catalogue.ts` is invented.** | Nobody has supplied a price list, a size run or a stock count. Under the Consumer Protection from Unfair Trading Regulations a displayed price is what a customer is entitled to pay, so these are more dangerous than the invented testimonials. `demo: true` on every product drives a visible notice; the site is noindex; and no payment provider is configured. **Replace every price with the client's own before any of those three change.** |

## Search

`lib/search.ts` filters twenty-six products in the browser. No index, no
service, no dependency — at this size a filter *is* the search, and the array
is already on the page.

The rule that governs it: **search may not assert anything the product's own
data does not say.** That is why there are no colour synonyms — `tone` is the
artwork ramp behind the photograph, so "onyx" and "marble" are the design
system's names for dark stone, not a statement that a garment is black.
Returning a coat for "black" would be the site telling a customer the coat is
black, which nobody has confirmed. A colour search therefore finds nothing,
and nothing is the honest answer until the client supplies colours. The
synonyms that do exist ("jumper" → knitwear, "pants" → trouser) are dictionary
facts about English, never claims about stock.

The empty result is not a dead end: it carries the confirmed phone number and
chips for categories checked against the catalogue at render, so a suggestion
can never point at an empty shelf.

## The routes

Ten routes as of 2026-09-06: `/`, `/shop`, `/shop/[slug]`, `/bag`,
`/checkout/success`, `/clothing`, `/clothing/[category]`, `/accessories`,
`/about`, `/contact` — plus `POST /api/contact` and `POST /api/checkout`.

`/clothing/[category]` is what stopped the site reading as disorganised: the
category grid showed nine categories with nothing underneath any of them, which
is a label on an empty shelf. Each one is now a page listing that category's
actual stock, `CategoryGrid`'s cards link there, and the header's Clothing menu
points at them rather than at anchors.

## What is still missing before the shop can take real money

Not a to-do list — every one of these is a thing a developer cannot invent:

- **Real prices, sizes and stock counts.** See locked decision 15.
- **Stock levels.** Nothing decrements. Two people can buy the same one-off piece.
- **An order record.** Nothing is written down, so nothing can be picked, packed,
  refunded or audited.
- **Delivery, returns, terms and a privacy notice.** Legally required for
  distance selling in the UK, including the 14-day cancellation right under the
  Consumer Contracts Regulations.

## SumUp — what the API can and cannot do

Checked 2026-09-08 against both official specs, `sumup/sumup-openapi`
(`openapi.yaml`) and `sumup/sumup-go` (`openapi.json`). Not from memory, and
not from the marketing pages.

**There is no catalogue, product, item, inventory or stock endpoint.** 28
paths in total: checkouts, customers, transactions, refunds, payouts,
receipts, readers, merchants, members, roles. `catalog_access` and
`catalog_edit` appear only as *permission strings* on the custom-roles
endpoint — they gate what staff can do inside SumUp's own apps, and there is
nothing to call. `products` exists only as a read-only array hanging off a
completed transaction ("List of products from the merchant's catalogue for
which the transaction serves as a payment"), which is a receipt line, not a
stock level.

**Consequence: the shop's till cannot be the website's source of truth for
stock.** That was the option worth having and it is not available. Stock needs
its own store, and a sale in the shop has to reach it some other way.

**There is no payment webhook.** The five published webhooks are
`readers.created`, `readers.deleted`, `members.created`, `members.updated`,
`members.deleted`. A checkout's `return_url` is documented as an optional
backend callback, but no signature scheme is published for it, so an unsigned
POST claiming a payment succeeded is not evidence. Confirmation is therefore a
**pull**, not a push: `lib/sumup.ts`.

**Three request fields that were wrong until the spec was read**, all in
`/api/checkout`:

- `hosted_checkout: { enabled: true }` — was **missing**. `hosted_checkout_url`
  is only "returned when Hosted Checkout is enabled", so without it there is no
  payment page in the response and every checkout would have failed at the last
  step the moment real keys were set.
- `redirect_url` — where the *payer* is sent. This is the success page.
- `return_url` — a *server* callback, not a landing page. The success page used
  to be put here. It is now deliberately unset.

## Anchors

Because the header, corner menu and footer appear on all of them, **every
same-page anchor in `lib/nav.ts` is written `/#section`, never `#section`** — a
bare fragment means "a section of whatever page you are on", which is nothing at
all on nine routes out of ten. `/#x` is a plain same-document scroll on the home
page and a navigation everywhere else.



## Authority order when instructions conflict

1. What the client says in chat
2. An approved implementation prompt
3. The approved visual reference
4. Text annotations inside old reference boards
5. The existing legacy implementation

Legacy colours, fonts and placeholder design never override the approved
redesign.
