@AGENTS.md

# Design context — read before any design work

Two files in this directory hold the design brief, and every `/impeccable`
command reads them before doing anything:

| File | Holds | Answers |
|---|---|---|
| `PRODUCT.md` | Register, users, purpose, brand personality, anti-references, design principles, accessibility commitments | who, what, why |
| `DESIGN.md` | Colour, typography, elevation, components, motion, the do's and don'ts | how it looks |

**Register: `brand`.** Design IS the product on the storefront. `/stock` is the
one product-register surface — a staff tool tapped a hundred times a day — and
it is deliberately excluded from design passes, where motion is a cost rather
than a feature.

The five principles, in short: never assert what the client has not confirmed ·
one source of truth, or none · the shop may ask for a visit or a sale and must
be able to honour either · restraint is the luxury signal · decisions are
recorded with their reasoning.

**These files go stale, and stale here is not harmless.** Both were written
2026-09-03 and by 2026-09-20 they described a different product: a single
scroll-driven page that "sells in person only", with "no account, no basket",
open "Tuesday to Sunday… closed Monday". That last one is the same false fact
found hardcoded in `CornerMenu.tsx` the same day, telling customers a real shop
is shut on a day it is open. It survived two sweeps for hardcoded hours,
because nobody greps a context document.

So: **when the product changes, refresh them in the same pass.** Run
`/impeccable teach` for `PRODUCT.md`, `/impeccable document` for `DESIGN.md`.
A design brief that disagrees with the code is worse than none, because it
passes the gate and gets believed.

# Typography — SUPERSEDED 2026-09-23

**The display face is now Playfair Display 400** (Bodoni Moda → Gloock →
Playfair, all on 2026-09-23, at Brad's request; see the end of this file).
The history below is kept so the reasoning is not lost; where it says Bodoni,
read "the display face".

# Typography — as approved, reopened once by the client

Signed off by the client 2026-09-01; the wordmark MOVED 2026-09-02.

**Reopened 2026-09-21, by her, and only partly.** She asked for new
typography and a new theme for a womenswear boutique. Bodoni Moda was KEPT —
it is a Didone, which is already the fashion-magazine letterform and the most
feminine thing on the site, and keeping it preserved her own sign-off. What
changed is that **the italic axis is switched on** (`layout.tsx`), which is
the day the comment in that file had been waiting for. Use it sparingly: the
hero statement and pull quotes, never body copy, never a whole heading. If a
sweep ever finds no element computing `font-style: italic`, take the axis
back out — it is 25 KB on the critical path.

Inter is unchanged and stays the quiet half.

The large `B Boutique` wordmark is no longer in the hero. The giant
wordmark lives once, at the very end of the page, in the footer.

*The hero DOES carry type again as of 2026-09-21 (locked decision 5), but it
is a statement, not a wordmark. The two are different things and the rule
below is about the wordmark: there is exactly one giant `B Boutique` on this
site and it is the footer sign-off.* That
footer wordmark is the source of truth for this treatment. Do not reintroduce a
giant wordmark to the hero; it was removed deliberately.

Preserve: high-contrast luxury fashion serif character · tall elegant
proportions · the current thin/thick stroke contrast · editorial presence ·
the paper-on-red treatment where it sits over the hero photograph.

Do not make it heavier, more generic, more traditional, more condensed or more
decorative. Do not offer alternative wordmark typography again — that decision
is closed.

## The hierarchy — one face per role, never the serif everywhere

| Role | Face | Where it is set |
|---|---|---|
| B Boutique branding | Bodoni Moda, via `.display` | The giant wordmark in `Footer.tsx`, and the small one in the `Nav.tsx` header — deliberately the *same* face at two sizes, so the identity reads as one thing |
| Large editorial statements | Bodoni Moda, via `.display` | `PointOfView.tsx`, section headings |
| Corner navigation | Archivo → Inter `font-extrabold uppercase` → **now Bodoni Moda, 600, sentence case** | `CornerMenu.tsx` menu labels. Changed twice on 2026-09-21: the heavy grotesque caps read as streetwear on a womenswear boutique, and the first correction (Bodoni 400) was too quiet to carry the primary navigation. 600 is a REAL weight off the variable axis, not a synthetic bold — verified by advance width changing per weight — so the Didone stress gets stronger, not smeared. |
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
| 5 | ~~**The hero is the photograph alone.**~~ **SUPERSEDED AGAIN 2026-09-21: the hero carries type once more, at the client's request.** She asked for a different hero as part of the Rouge re-theme, which reopens this row. It is now an editorial hero: a Bodoni statement with one word in the newly-unlocked italic, the confirmed descriptor and address beneath it, and one control. The photograph is a single swappable slot, because her real images are still being produced. **The copy carries no size range** — the only size statement on this site is `temporary: true` demo copy in `lib/faq.ts`, and printing an unconfirmed number as the loudest line on the page is the one trap in this brief. The 2026-09-06 history is kept below so nobody re-litigates it. ~~**SUPERSEDED 2026-09-06: the hero category labels are removed entirely.**~~ | The client asked for WOMENSWEAR, ACCESSORIES and HOMEWARE to be taken off the left of the hero, and for SCROLL to be taken off the bottom. The hero is now the photograph alone. **The header was explicitly to be left alone and nothing was taken out of it** — it keeps NEW IN / CLOTHING / ACCESSORIES / BRANDS / ABOUT, and gained CONTACT on 2026-09-06 when the contact page was built. The corner menu still routes to Homeware. `HERO_CATEGORIES` remains exported from `lib/nav.ts` in case the labels are ever wanted back. The placement decision is kept above only so nobody re-litigates it if they return. |
| 6 | **The focus ring is `currentColor`.** | A fixed token cannot work: the ring runs over a black header, a photograph, a cool-white FAQ and a black footer. `var(--gold)` went black-on-black over the hero the moment gold was retired. Focusable text already contrasts with its own background, so borrowing its colour inherits that. Do not introduce a special focus colour. |
| 7 | **Hero parallax: ~32px desktop, ~11px mobile.** | Same travel eats far more of a taller crop seen through a shorter window, hence the two figures. |
| 9 | **The address is confirmed: 18 Sea View Street, Cleethorpes, DN35 8EZ.** | Client-confirmed 2026-09-02. The original brief said DN35 8HY; that is wrong and must never return. Neither may "6 Market Street", which belongs to a different project. Every address on the site derives from `shop.ts` — change it there or nowhere. The **parking claim** ("on-street parking at the top, Market Place car park a two-minute walk") was a separate, still-UNVERIFIED claim and has now been removed from both Visit and the FAQ. Do not reinstate it, or invent parking availability, prices, walking times, street rules or car park names, until the client confirms it in their own words. |
| 8 | **No hero scale, no hero pinning.** | The 140vh sticky track is gone: it moved nothing for 40vh and put a blank spacer before the band under the hero. The hero is exactly 100svh and the band begins at its bottom edge. (That band carried brand logos when this was written; it is the statement rail now, and the decision is unaffected.) |
| 10 | ~~**The phone number is confirmed: 07305534342.**~~ **SUPERSEDED 2026-09-21: phone numbers are REMOVED from the website at the client's instruction.** `shop.phone` is now `""`, which is the single switch — every phone on the site derived from it, so nothing else needed editing to remove them and one line restores them. The number itself is preserved in the comment in `shop.ts` rather than deleted, because taking it off the site is a display decision while re-confirming a number is a conversation. **Email is now the only route to the shop from the website**, so `bboutiquecleethorpes@gmail.com` carries more weight than before, not less: it is the FAQ's primary action, the contact masthead, the empty-search fallback, the out-of-stock fallback and the contact-form failure. | Given by the client in chat, 2026-09-06. It lives in `shop.ts` and nowhere else; `phoneDisplay` groups it as `07305 534342` for reading while `tel:` links use the raw digits. **Email confirmed 2026-09-20: bboutiquecleethorpes@gmail.com**, and she asked for it to be SHOWN on the site rather than kept behind the form. Setting it does not wire up the contact form — that still needs `CONTACT_TO`, `CONTACT_FROM` and `RESEND_API_KEY`. |
| 11 | **The contact form must never report success without a send.** | `/api/contact` answers 503 `not_configured` until `CONTACT_TO`, `CONTACT_FROM` and `RESEND_API_KEY` all exist, and the form shows a plainly worded failure plus a way to reach the shop. **That was "plus the phone number" until 2026-09-21**, when phone numbers came off the site (row 10); it is the email address now. The rule this row protects is unchanged and is NOT about which channel is printed: the form must never report success without a send, and must never leave somebody with no way through. Do not "fix" this by faking a thank-you, by removing the form, or by pointing it at a guessed address. Setting those three variables is a launch BLOCKER; see `.env.example`. |
| 12 | **Money is integers in pence, everywhere.** | `0.1 + 0.2` is not `0.3` in binary floating point, and a basket totalling £74.99999999 is a rounding bug waiting to be charged to somebody. Prices are `priceP` integers from the catalogue to the provider; the single division is `formatPrice` for display, and one more at the very edge where SumUp's API wants a decimal. Never store, add or compare money as pounds. |
| 13 | **The server prices the bag, never the browser.** | `/api/checkout` takes slugs, sizes and quantities and ignores anything else the client sends. A total posted from a browser is a total somebody sets to 1p. Verified: a request carrying a forged `priceP` is accepted and the field is simply not read. |
| 14 | **The shop must never confirm an order it did not take.** | `/api/checkout` answers 503 `not_configured` until `SUMUP_API_KEY`, `SUMUP_MERCHANT_CODE` and `NEXT_PUBLIC_SITE_URL` all exist, and the bag says plainly that nothing has been charged. Landing on `/checkout/success` means a browser followed a URL, not that money moved, so **the page asks SumUp rather than reading the URL**: `GET /v0.1/checkouts?checkout_reference=…`, authenticated, server-side (`lib/sumup.ts`). PAID, FAILED/EXPIRED and "we could not find out" are three different pages, and the bag is emptied on PAID alone. **Correction, 2026-09-08:** this row previously said a webhook was the proof. SumUp publishes no payment webhook — see the SumUp section below — so the query is the mechanism, not a placeholder for one. |
| 15 | ~~**Every price in `lib/catalogue.ts` is invented.**~~ **SUPERSEDED 2026-09-22: the catalogue is her real stock, and all 66 colourway prices are hers.** | `lib/stocklist.ts` replaced the invented catalogue on 2026-09-21 (32 pieces, 54 colourways, from her own dashboard) and `catalogue.ts` is now built from it. The rule this row protected is unchanged and still locked: **a displayed price is what a customer is entitled to pay, so an unconfirmed price is never displayed and never charged.** `priceConfirmed: false` makes the whole piece `demo` — "Price to confirm", no Add to bag, refused by `/api/checkout`, no `offers` in its JSON-LD. None is unconfirmed as of 2026-09-22; see the stocklist header. Remember that `priceConfirmed: true` means transcribed from her, not read back by her — the Balloon Sleeve Coat was "confirmed" at £49 and is £59. |

## The Rouge re-theme — 2026-09-21

The client asked for the site to read as a womenswear boutique rather than a
cool gallery: for **women of all different sizes**, **somewhat girly but not
childlike**, still premium. The old direction was a deliberate cool
fashion-gallery system, and warmth was precisely what it excluded.

**Rouge, light-dominant.** Warm paper `#FAF5F3` — leaning pink, never yellow,
because yellow is cream and cream is banned — against a warm ink `#1A1416`.
The signature colour is `#8A070B`, **the red already sampled from her own hero
photograph**, promoted from "only inside the artwork" to a real UI colour. It
is the one choice in this palette that is a fact about her shop rather than a
decision somebody made in a browser.

**The cliché this was built against.** "Girly premium boutique" has one reflex
answer, and running the project's own design-data lookup for this brief
returned it in full: Playfair + Montserrat, Cormorant + Montserrat, `#A16207`
gold, `#FDF2F8`/`#EC4899` blush-on-blush, Great Vibes script, and slate. Every
one of those is already banned here. The lookup confirmed the cliché rather
than escaping it, which is why the escape route had to be argued rather than
searched for.

**Two rouges, not one.** `--bb-rouge` measures 9.33:1 on paper and **1.83:1 on
ink — invisible**. Dark sections use `--bb-rouge-lift` (5.32:1 on ink), which
goes rose because a red lightened enough to clear a dark ground always does.
Same one-colour-one-ground discipline as the greys.

**Grounds.** Light is the default. Dark is punctuation: the header, the
statement band, the manifesto, the category grid, the footer. Testimonials,
Visit and the About philosophy flipped to paper.

**What a token swap could not reach, and how it was caught.** Nine hardcoded
`rgba(255,255,255,…)` values sat inside the flipped sections and went
invisible — the tokens could not touch them. A live contrast sweep over every
visible text node found them; axe did not. Axe DID catch one the sweep's
filters had skipped (`.about-lines`, serious, three widths), so both were
needed. Twenty-eight hardcoded cool blacks were warmed to the new ink, with
every alpha re-measured first to confirm it still cleared AA.

---

## What the client confirmed — 2026-09-20

Collected in the shop and returned through the shop-visit form. Everything
below is in her words; anything she did not answer is still a gap, not a
default.

| | Confirmed |
|---|---|
| Legal identity | **Sole trader**, trading as **B Boutique Cleethorpes**. No company number — not a limited company. |
| VAT | **Not registered.** The page says the price is the price. |
| Email | **bboutiquecleethorpes@gmail.com**, and to be SHOWN on the site. |
| Opening hours | **Seven days, 10–4.** Monday was previously in `shop.ts` as CLOSED and was never confirmed by anybody — corrected. A shop shown shut on a day it is open turns customers away at the door. |
| Delivery | **£4.35, free at £120+**, UK only, next working day, Royal Mail. |
| Returns | Customer pays return postage on a change of mind · back to the shop · **no exclusions** · **no exchanges** online · in-shop goodwill is exchange or credit note. |
| Governing law | England and Wales. |
| Till | **She types the amount — she does not tap the product.** |
| SumUp | Online checkout confirmed enabled. |

### What this decided

**The SumUp transaction poll is dead.** She types amounts, so counter sales
carry no product line and there is nothing for the website to read. `/stock`
is not a fallback — it is the mechanism, and the only one. Do not revisit the
poll unless she changes how she works the till.

**Delivery is now real.** `DELIVERY_P = 435`, `FREE_DELIVERY_OVER_P = 12000`,
`DELIVERY_IS_DEMO = false`. One function, `deliveryFor(subtotalP)`, is used by
both the bag and `/api/checkout`, so the price quoted and the price charged
cannot drift. **The threshold is compared against the subtotal, not the
total** — comparing against a total that includes delivery creates a loop
where £115.65 + £4.35 qualifies for free delivery and then no longer does.

**All fifteen policy slots are filled** — the last three on 2026-09-22, from
the form she filled in on her phone:

- **When the order becomes a contract** — "Once the order is paid for that is
  the contract of sale." She was offered offer-at-order / contract-at-dispatch
  with the reason it protects her, and chose payment. **Her decision; do not
  re-open it.** It means a piece that sells over the counter after being paid
  for online is a contract she cannot perform, and the refund is the remedy.
- **If a piece has already gone** — "Refund them straight away, then ring to
  apologise." Checkout gained an **optional** phone field the same day for
  exactly this, so the page says she will ring — or email, if no number was
  left. It must stay conditional while the field is optional: an
  unconditional "we will ring you" is a promise with no number behind it.
- **How long the shop keeps things** — enquiries six months, orders six years
  (HMRC). Nothing deletes on a timer; these are her commitments.

### Product data — arrived 2026-09-21, priced 2026-09-22

This section used to read "No product data at all". Her stock dashboard
arrived on 2026-09-21 and is `lib/stocklist.ts`: 32 pieces, 54 colourways, a
photograph of each, sizes, fit notes and supplier compositions where
published. Prices came in batches — the dashboard, a WhatsApp message, her
filled-in form — and where two disagreed nothing was picked until Brad chose:
the Red jumper is £40 (her form said £48) and the Ribbed Cardigan £65 (the
master list says £45). **All 66 colourways on the site are now confirmed.**

**The master stock list, 2026-09-22.** Brad supplied a newer list (40
pieces) and made it the master. It fixed colour names and two product names,
and it corrected two products the site was selling WRONGLY as "One size": the
Zebra jeans (XS–XL) and the denim set (XXS, XS, M, L). Its **eight new pieces
are live** (40 pieces, 66 colourways), with the photographs that came in the
same artifact, each checked by eye against its description and colour first.
A future piece without a photograph goes in `awaitingPhotos` in
`lib/stocklist.ts`, outside `stocklist`, so nothing can show it until its
photograph arrives — never with a stand-in. `pnpm launch-check` lists that
list's contents and says when the files are present.

Also answered 2026-09-22: **no alterations** (the demo FAQ offered a service she
does not run), **holds are four days with a deposit** (amount not given, so
not stated), **gift cards confirmed as written**, and both About paragraphs
replaced with her own one-liners.

**No wholesalers named** ("no."), and on **2026-09-21** the client confirmed
the shop does not stock big labels at all — "just affordable clothing".

**That settled the brands rail: it is deleted, not parked.** The homepage had
been showing eight real companies' registered trademarks — Mos Mosh, Rino &
Pelle, Part Two, b.young, Ichi, Nümph, Saint Tropez, Selected Femme — under a
heading reading "Brands in store", on a real trading business's website.
`lib/brands.ts` had carried NOT CONFIRMED STOCKISTS since the day it was
written. That is a false statement about the shop and about eight third
parties, so `BrandRail.tsx`, `lib/brands.ts` and all nine files in
`public/img/brands/` are gone, along with both "Brands" entries in the
navigation — a menu offering Brands that lands on a band naming none is a
broken promise. The band under the hero is now `StatementRail`, whose every
phrase derives from `shop.ts` or from the shop describing itself. See
`lib/statements.ts`.

**The launch check for this was INVERTED rather than deleted.** It used to
read `lib/brands.ts` for the string NOT CONFIRMED STOCKISTS; with the file
gone, `read()` returns an empty string and the check would have passed quietly
forever. It now blocks if `lib/brands.ts` or `public/img/brands/` comes back.
Tested in both directions: 8 blockers with either present, 7 with neither.

The supplier-imagery plan still has no source. She answered that image
permission is "already held" — held from whom, if no supplier is named? That
contradiction needs resolving before any supplier photograph goes on the
site.

**ICO: applied 2026-09-22, registration number PENDING.** She was not
registered on 2026-09-20. On 2026-09-22 she applied for the data protection
fee and set up the direct debit; the ICO allocated her a contact security
number and an application number. **Neither is a registration number, and
neither goes on the site** — the security number is a private credential for
contacting the ICO and must not be published or committed anywhere.

The registration number (`ZA`/`ZB` + six digits) arrives once the application
is processed. When it does, add one derived line to /privacy near "Who to
ask, and how": registered with the ICO, registration number ZA…, under the
name exactly as the public register shows it. Publishing it is good practice,
not a legal requirement — what the law requires is the registration and the
annual fee, which is now in hand.

**Merchant code: use `MCA7CUNT`.** Decided 2026-09-20.

The client gave `MCA7CUNT-3769`, read off a SumUp receipt, and was adamant it
was right. She was — the reading is that the receipt prints two fields on one
line and the dash is the separator. `MCA7CUNT` is eight characters beginning
with M, which is exactly the shape of all seven merchant codes in SumUp's
specification (`M1234567`, `M2DDT39A`, `MC0X0ABC`, `MEDKHDTI`, `MH4H92C7`,
`MK01A8C2`, `MK10CL2A`). The trailing `3769` is most likely a receipt,
terminal or transaction number.

**This is an inference, not a confirmation, and it is worth being honest about
which.** SumUp declares NO pattern and NO length constraint on `merchant_code`
anywhere in either specification — those seven examples are all there is to go
on. A twelve-character `MCA7CUNT3769` would contradict every one of them, so
it is ruled out, but "eight characters starting with M" is an observed
pattern rather than a published rule.

Two ways to settle it properly, both better than the inference:

- `SUMUP_API_KEY=… pnpm sumup:code` reads the code from her own account.
- A photograph of that line of the receipt.

**It fails loudly if wrong**, which is why proceeding on the inference is
safe: a bad merchant code is rejected by SumUp when the checkout is created,
on the first test card, long before a real customer sees it. It cannot fail
quietly and it cannot take somebody's money into the wrong account.

Setting it alone achieves nothing: `/api/checkout` answers 503 until
`SUMUP_API_KEY`, `SUMUP_MERCHANT_CODE` and `NEXT_PUBLIC_SITE_URL` are ALL
present, and the last of those is waiting on the domain.

## The domain — bboutiqueclee.com, registered 2026-09-20

Bought through Vercel, auto-renewing 20 Sept 2027. Attached to the
`b-boutique` project as the apex, with `www.bboutiqueclee.com` added as a
308 redirect to it. Both verified immediately — a Vercel-registered domain
needs no DNS work.

**`metadataBase` was wrong and is now right.** It had been hardcoded to
`https://bboutique.co.uk`, a domain nobody ever bought, which put a canonical
tag naming somebody else's address on every page and gave every social
preview an image URL that does not resolve. It now reads
`NEXT_PUBLIC_SITE_URL` and falls back to `https://bboutiqueclee.com`.
Verified in the built HTML: `/shop/camel-blazer` emits
`<link rel="canonical" href="https://bboutiqueclee.com/shop/camel-blazer">`.

**`NEXT_PUBLIC_SITE_URL` IS DELIBERATELY NOT SET IN VERCEL.** This is the
important part. `SUMUP_API_KEY` and `SUMUP_MERCHANT_CODE` are both already
set on Production and Preview — confirmed against the project's environment
variables. `/api/checkout` answers 503 only because the third variable is
missing. **Setting it turns the shop on.** As of 2026-09-22 the prices it
would charge are hers, and the one open price cannot be bought.

The order is unchanged: stock counts in, then `NEXT_PUBLIC_SITE_URL`, then a
test card, and `ALLOW_INDEXING` last of all. Setting it is a deliberate
decision, never a side effect of other work.

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

The empty result is not a dead end: it carries the confirmed EMAIL ADDRESS (it
was the phone number until 2026-09-21, when numbers came off the site) and
chips for categories checked against the catalogue at render, so a suggestion
can never point at an empty shelf.

## The routes

Fifteen pages as of 2026-09-22: `/`, `/shop`, `/shop/[slug]`, `/bag`,
`/checkout/success`, `/clothing`, `/clothing/[category]`, `/homeware`, `/about`, `/contact`, `/delivery`, `/returns`, `/terms`, `/privacy`, and the
unlisted `/stock` — plus `/api/contact`, `/api/checkout`, `/api/stock`,
`/api/orders` and `/api/availability`. The temporary `/questions` form was
deleted once she had answered it.

**The header is transparent over the home hero and solid everywhere a route
opens on light.** Every route except the home page, `/shop/[slug]` and `/bag`
opens on a dark `PageMasthead`; those two pass `<Nav solid />` instead. On the
product page a masthead would push the garment below the fold; on the bag it
spent a whole phone screen saying "Your bag." before the first item, and the
client asked for it to go. The bag keeps one small `h1`, "Bag", for the
document outline.

**Accessories is gone, 2026-09-22, at Brad's instruction: the shop does not
stock them.** Out of the header, corner menu and footer; out of every
"womenswear, accessories and homeware" descriptor (hero, footer, meta,
statement rail, About); `/accessories` deleted and 307-redirected to `/shop`
in `next.config.ts` (temporary, so the page can come back if she starts
stocking them). Do not reintroduce the word without her confirming stock.

**Later on 2026-09-22 (Brad's requests):**
- **`/about` rebuilt** around her own shop photographs (`assets/about`,
  `scripts/build-about.mjs`) plus one Higgsfield texture (cream boucle) that
  contains no shop, product or person, so it cannot misstate the business.
  The marble statement band under the hero was removed on 2026-09-23 at
  Brad's request ("terrible"); do not bring it back.
- **/about hero is a generated vintage still life** (2026-09-23): a brass
  rail with four garments against dark marble (`assets/about/
  texture-vintage-rail.jpg`, Higgsfield + 2k upscale). Brad: "it doesn't need
  to be an interior of her shop". It shows no shop, no stocked product and no
  person, and carries alt="" so it is never presented as her room. **Shop photos replaced 2026-09-23** with Brad's new set (shopfront, rails
  by the window, towards the fitting rooms, the counter), upscaled 2x in
  Higgsfield. The shopfront IS now used, at his request, edited in
  Higgsfield: the fascia's SumUp web address now reads bboutiqueclee.com
  and the outside paintwork is tidied; the window contents are untouched.
  Its right-hand panel still says "Accessories & Homeware" and **must stay**
  (Brad, repeated 2026-09-23: "Do not remove accessories and homeware sign
  from the front of the store"). It is her real fascia. Never edit it out,
  retouch it, or crop the About frame so it falls off the right edge
  (checked 2026-09-23: fully visible at 390, 768 and 1440).
- **Home hero is the Lumina list since 2026-09-23** (Brad's 21st.dev pick,
  `components/ui/lumina-interactive-list.tsx` via `HeroStrips.tsx`). Its CDN
  GSAP + three.js are gone: the glass transition is one shader on bare
  WebGL, created after load+idle, drawing only during a change. First
  photo and title are server HTML. Slide list = real buttons; keyboard focus
  holds autoplay, a mouse click does not. Reduced motion: no autoplay, no
  WebGL. The wash was MEASURED over all five photos, 390-1920: title >=3.6,
  small text >=5.5, header >=4.8. Lighthouse mobile vs 96cf4a1, n=5
  interleaved: score 79/79, LCP 5.56/5.41s, within noise. `gsap` removed.
  The history below describes the strip slider it replaced.
- **Home hero WAS the strip slider** (`components/ui/parallax-strip-slider.tsx`,
  deleted 2026-09-23), which replaced `HeroSlideshow`. The first slide's
  title is "For every woman who walks in."; the h1 is sr-only. Changed on the
  way in: no Google Font (it would falsify /privacy), art-directed hero
  sources, layout from `pointer-coarse:` CSS not JS, keyboard buttons, a
  `paused` prop. The pause button stays because the slides auto-advance
  (WCAG 2.2.2). Do not remove it. LCP has NOT been re-measured since.
  **No SplitText, ever, on anything React renders.** It rewrites the DOM, and
  it crashed the live home page twice ("This page couldn't load") before it
  was removed; the titles now rise as one piece on a transform. The hero, the
  statement pieces and the pink band sit inside `SafeBoundary`, so a failure
  in any of them swaps in a still version instead of taking the page down.
  Verified by forcing a crash: the page stayed up.
- **`components/ui/pinky-news-letter.tsx`**: light shader band before Visit.
  The supplied email field was NOT kept: it sent nowhere. A newsletter needs
  her agreement, a destination (e.g. a Resend audience) and a /privacy line
  first — CLIENT INPUT REQUIRED.
- **`components/ui/text-along-path.tsx`** on /contact via `PathBand`, all
  words derived from shop.ts, scroll-driven, aria-hidden.
- **`components/ui/cinematic-product-scroll-section.tsx`** on the home page
  after New In: the upsell. Its three pieces are DERIVED, the most expensive
  buyable garments by priceP, never hand-picked, so it follows the stock.
  Since 2026-09-23 it carries the full AddToBag block, whose colour swatches
  are crops of her own product photos (no guessed colour values). The demo's mock products, $ prices and invented
  brand are gone. Uses animejs for the card drop.
- **New In is a 3D coverflow since 2026-09-23** (`components/ui/
  3-d-coverflow-carousel.tsx`, Brad's pick; `NewInRail` deleted). Real
  `newIn` pieces, 4:5 cards sized from the viewport, arrows scoped to the
  carousel's focus. **Since 2026-09-23 (Brad) no arrows, counter, "View
  piece" or Pause, and NO auto-advance** (nothing moving on its own means
  nothing to pause, WCAG 2.2.2); the centre piece carries AddToBag
  `compact` (colour, size, Add to bag; no preselected size, ever). Every card is a real link; a pointer click on a SIDE card
  turns the carousel instead of navigating. Swipe/drag (pointer events, mouse and
  touch) and horizontal trackpad swipes turn it too; a drag never opens a card.

**`/homeware` was built 2026-09-22.** Every Homeware link — corner menu,
header Shop menu, footer, the Accessories page, the home section's own
button — had pointed at `/#homeware`, a home-page section of stock shelf
photography, and the button pointed at `/#visit`. The client clicked it
expecting the Tomato Vase, Banana Jar and Bell Vase. It is not under
`/clothing` on purpose. The home section's copy ("small British makers",
candles, linen) and its stock stills of things she does not sell were
replaced on 2026-09-23 with her own homeware lede and three catalogue photos.

`/clothing/[category]` is what stopped the site reading as disorganised: the
category grid showed nine categories with nothing underneath any of them, which
is a label on an empty shelf. Each one is now a page listing that category's
actual stock, `CategoryGrid`'s cards link there, and the header's Clothing menu
points at them rather than at anchors.

## Premium pass — 2026-09-23

Brad asked for animated buttons, premium mastheads, text and image reveals
and a better footer, using 21st.dev for reference and Higgsfield for page
heros (never the landing hero). 21st.dev is blocked from the session; it was
browsed from a Vercel sandbox, and its component code is login-only, so the
references (Vertical Cut Reveal, flow/roll buttons, Cinematic/Sticky footer,
Contact Card) were rebuilt in-house, not vendored.

- **Buttons.** Every primary CTA is a pill. `.roll` rolls the label on hover
  via a text-shadow copy (a screen reader hears it once); light and outline
  pills fill with ink from the left, ink pills get the Add-to-bag sheen.
- **Headings.** `RevealText` splits words in React (no SplitText on React DOM),
  aria-label carries the name, arms only below the fold, never under reduced
  motion. Photographs settle via `scale` on a view timeline.
- **Mastheads.** New Higgsfield frames in `assets/texture` (shop rail, folded
  knits, ceramics, notecard, parcel; atmosphere, not stock, no text). Phones
  get a square `-m` crop. The wash was re-tuned and MEASURED with the text
  hidden: every masthead ≥ 4.5:1 at 390-1920 (lowest 4.9). Re-measure if a
  texture changes.
- **Footer.** CTA band, letter-by-letter wordmark (the q's tail was clipped,
  reading "Boutiaue"; fixed), drawn link underlines, Back to top (native
  scroll when Lenis is out of step).
- **Measured.** /shop LCP regressed 3.1s → 3.8s with the heavier masthead
  until the phone crop; after it, within noise (median 3.33s vs 3.25s, n=3).
  Home unchanged within noise (median score 80 vs 78; LCP ~5s both — a
  pre-existing gap, not caused here).

## Second pass — 2026-09-23 evening

- **Home LCP.** PageSpeed showed 6.5s. That is Lighthouse's SIMULATED
  estimate; measured under Slow-4G + 4x CPU in a real browser the LCP (the
  hero title text, not the photo) paints at ~1.55s, and blocking fonts or
  JS does not move it. The simulation charges every early request to the
  LCP, so bytes still matter: phones now get a 900px hero (`-s`, srcset with
  `sizes="max(100vw, 56svh)"`) instead of the 1536px one, and PremiumMotion
  (GSAP + SplitText, used only by the philosophy statement) is gone.
  Lighthouse mobile, n=3 medians, before/after: score 80/82, LCP 5.1/5.0s
  (within noise), SI 2.2/1.6s, TBT 127/55ms, weight 1839/1182 KB.
  GSAP is now loaded on demand by the hero slider (after the page settles,
  or on first pointer/tap; an early tap is held and replayed; if the import
  fails slides change instantly). Lighthouse mobile, n=10 each (two
  interleaved rounds of 5): LCP median 4.80s -> 4.49s (ranges 4.44-4.98 vs
  4.29-4.68), score 82.5 -> 84, SI ~1.66 -> ~1.54s, TBT ~64 -> ~52ms. A real
  throttled browser (Slow 4G, 4x CPU, n=3) shows LCP ~1.74s both before and
  after: the gain is in the simulated score, not in what visitors see.
- **Philosophy statement** lights word by word on a view timeline (CSS only).
  The dim state is 0.38 opacity because 0.22 failed 3:1 (axe).
- **Homeware** on the home page is one 21:9 band (the masthead's ceramics
  frame) instead of three product photos. Eyebrow is paper: the rouge
  measured 1.2:1 over the photograph on a phone.
- **Statement pieces:** no "View the piece"; index, up to three catalogue
  features, price in the display face directly above Add to bag.
- **Touch:** press = hover for the CTAs (fill + label roll), no tap flash,
  "All three" colours in on scroll on phones.
- **iOS dotted underline** under the address slide was Safari's data
  detector; `formatDetection` is off for address/telephone/email/date.

## Performance — and the trap in measuring it

**Measured 2026-09-08. Desktop 100, mobile 96, CLS 0, TBT 10ms, accessibility
100 on both.** The site is fast. Read the rest of this section before trying
to make it faster.

**PageSpeed Insights returned 83 and then 96 for mobile on IDENTICAL code,
twenty minutes apart** — LCP 4.1s then 2.6s, Speed Index 4.8s then 3.0s.
Verified against the deployment list: no deploy happened in between, both runs
hit commit `119c66c`. The likeliest cause is a cold Vercel edge cache on the
first run. **A single PSI run on this site is not evidence**, and the noise
floor is wide enough (±13 points, ±1.5s LCP) to swallow any safe optimisation
whole. Take three runs, compare medians, or do not act.

The same applies locally, harder: an audit run straight after `pnpm build` and
`pnpm test:a11y` reported 76. Three runs on a settled machine gave a median of
90. Let the machine go quiet first.

**Two optimisations were tried against the 83 and both were reverted:**

- `content-visibility: auto` on the five below-fold sections. Genuinely cut
  main-thread work 2.67s → 1.78s and TBT 118ms → 44ms, but **did not move LCP
  at all**, cost ~0.18s of Speed Index, and introduced a *serious* axe
  colour-contrast violation on `.ft-meta > p` — the footer's scroll-scrubbed
  reveal cannot progress inside a skipped subtree, so the text is sampled
  mid-animation. Same class of bug as the earlier `/bag` footer failure.
  Do not reapply it to `.ft` without solving that.
- **Scroll timelines: audited, nothing to fix.** All 21 `animation-timeline`
  rules animate only `transform` and/or `opacity` — both compositor-only,
  neither forces layout or paint. 61 elements out of 1,119 DOM nodes carry a
  timeline, and exactly one is above the fold (`.hero-media`). The motion is
  not a performance problem and narrowing it would buy nothing.

**The LCP element is the header wordmark** (`header > div > a.display`), not
the hero photograph — confirmed from the trace, and the breakdown is 15ms TTFB
plus ~2.2s element render delay. This project has been caught by this before:
when the philosophy line was on the hero, that paragraph was LCP. Read the LCP
element out of the trace every time; do not assume it is the picture.

**Do not "fix" the hero image on Lighthouse's advice.** It reports ~93 KB
wasted because it compares against CSS pixels and under-credits device pixel
ratio. The mobile hero is 836x1672 into a 463x823 slot — slightly *under* what
a DPR-2 phone wants, not over.

**The one real outstanding performance action** is vendoring the 23 CDN
photographs with `pnpm images`. That moves them same-origin and through
`next/image` (AVIF, per-breakpoint srcset). Until it is done, every number
above describes a site that is not the finished one.

## `pnpm launch-check`

The list below, as a command. It reads the source and exits non-zero while
anything invented, unconfirmed or self-contradicting remains — **0 blockers
as of the evening of 2026-09-22**, the first clean run. It was 10 on
2026-09-08, 7 on 2026-09-21, 4 that morning and 1 that afternoon.

**Deliberately NOT part of `pnpm verify`.** Verify runs several times a day and
must stay green; a gate that fails on every run for a known, correct reason
trains people to ignore it, which is the failure this project keeps guarding
against. This one is run before launch and then actually read.

The one check worth knowing about: it re-tests the **privacy page's own
claims**. `/privacy` states as fact that the site runs no analytics and sets no
cookies, and that is one `npm install` away from being a false statement to
every visitor — so the script scans `src/` for real tracker tokens with
comments stripped, and blocks the launch if any appear. Verified in both
directions: planting `googletagmanager.com` in `layout.tsx` fired the blocker
and named the file; removing it went clean again.

Two bugs found in the check by testing it rather than trusting it, both worth
remembering because both are the classic shape:

- `demo: true as const` did not match a line-anchored `true`, so the script
  reported **the most dangerous file in the project as clean**. A gate that
  passes wrongly is worse than no gate.
- The tracker list originally contained the bare word `plausible`, which this
  project's own comments use ("a plausible invention"). It flagged three source
  files as analytics. A false alarm in a launch gate is not harmless — it is
  how a gate stops being read.

It **cannot** tell you whether a price is correct, whether the legal wording is
sound, whether a photograph is of the right garment, whether the SumUp round
trip works, or whether the shop is registered with the ICO. It says so on every
run, because a checklist that implies it is exhaustive is worse than none.

## What is still missing before the shop can take real money

Rewritten 2026-09-22. Prices, the order record, reservation at checkout, all
fifteen policy answers, her legal identity and order email are DONE. What is
left:

- **Stock counts.** Checkout reserves a variant atomically (`lib/orders.ts`,
  `adjust()` against a `CHECK (qty >= 0)`), but a variant nobody has counted
  (`qty: null`) is sold unreserved, so the protection only exists once counts
  are in. The 69 unambiguous counts from the master list
  (`src/data/opening-stock.json`) write themselves: `seedOpening()` in
  `lib/stock.ts` runs once per server instance, INSERT-only with
  `ON CONFLICT DO NOTHING`, so it never touches a line that has a count or a
  recorded sale (2026-09-23; replaced the "Load opening counts" button,
  because DATABASE_URL is a sensitive Vercel secret and cannot be read into
  a session). The other 32 lines (10 colourways the list totals across
  sizes) are CLIENT INPUT: counted on `/stock`, where the list's colour
  total is shown beside them. Never split those totals by guesswork.
- **A test card through SumUp**, after `NEXT_PUBLIC_SITE_URL` is set.
- **A qualified read of the statutory text.** See Selling terms.
- **The ICO registration number.** Applied and paying by direct debit as of
  2026-09-22; the number itself has not arrived. See "ICO" above.

## Selling terms — `/delivery`, `/returns`, `/terms`, `/privacy`

Built 2026-09-08. `lib/policies.ts` holds all four pages, and its rule is
stricter than anywhere else in this project, for a reason worth stating
plainly: **every other placeholder here is a claim a customer might believe;
these two pages are a claim a customer can enforce.** A postage price or a
returns window published on a real shop's site is a term of the contract of
sale — the customer read it, relied on it, and can hold B Boutique to it
whatever anybody meant.

So every block is exactly one of three kinds, and the type makes a fourth
impossible to add by accident:

| Kind | What it is | Safe to publish |
|---|---|---|
| `statutory` | UK consumer law — true of every distance seller regardless of what this shop decides. Prints the Act it comes from, so a customer can check and the client can see it was not invented here. | Yes |
| `derived` | From client-confirmed data in `shop.ts` — the address, the phone. | Yes |
| `technical` | A statement about what this codebase actually **does**, read out of the file it names. This is what makes an honest privacy notice possible before the client has said anything: what a website collects is not her opinion, it is a fact about the code. Renders a "How we know" footnote citing the source file. | Yes — see the warning below |
| `required` | A commercial decision only the client can make. Renders as a visible CLIENT INPUT REQUIRED slot carrying the question, never as plausible prose. | **No** |

**Zero `required` slots remain as of 2026-09-22.** `outstandingPolicySlots`
counts them and `pnpm launch-check` asserts zero. Each page renders one notice
while any of its own remain, so a new `required` block reappears on the page
the day it is added.

**The `technical` blocks expire.** `/privacy` states, as fact, that the site
sets no cookies, runs no analytics, self-hosts its fonts so nothing is
requested from Google on page load, loads the Google map lazily as the Visit section nears the screen
(a click until 2026-09-23, when Brad asked for the map to show), keeps the bag in `localStorage`, and uses the visitor's IP for nothing
but a ten-minute in-memory rate limit that is never written down or emailed.
Every one of those was verified against the source on 2026-09-08 and every one
stops being true the moment somebody adds a script. **Re-run the checks before
launch and after any dependency change**; the `basis` line on each block names
exactly what to re-check. Adding analytics to this site without editing that
page turns it into a false statement to every visitor.

**The statutory text was written by a developer, not a solicitor.** It is
stated conservatively — where the law gives the customer a right it is
described in full; where it gives the trader an option or an exemption that
is left to the client rather than assumed in their favour. Before launch it
wants ten minutes from somebody qualified, or a read against the Trading
Standards Business Companion guidance. **That check is a launch task, not an
optional polish**, and it is not done.

All four are linked from the footer's "Buying online" column, and delivery and
returns additionally from the bag — those two have to be available to the
customer *before* they are bound by the order, not discovered afterwards.

`/terms` carries one block worth pointing at: **when the order becomes a
contract.** The standard wording — the order is an offer, the contract forms
at dispatch — was offered to her twice with the reason it protects her. On
2026-09-22 she chose **payment** instead, in her own words. That is her term
and it is settled; what keeps it safe in practice is the reservation taken at
checkout, which is why the stock counts matter.

## Stock — the website is the source of truth, not the till

Built 2026-09-20, after establishing twice over that SumUp cannot supply this.

**The decision:** the website keeps its own stock and that list is the one
that counts. The shop's till is at most an *input* to it, never the authority.
That is not a preference, it is forced: SumUp has no catalogue or inventory
endpoint in either direction (see the SumUp section below), so there is
nothing to read stock levels from and nothing to write products to.

### The variant model — `lib/variants.ts`

A product used to carry a list of size LABELS and no count against any of
them, which renders a dropdown and sells nothing. A **variant** is one row per
buyable thing: slug + size + colour. The camel coat in a 12 is a different
object from the camel coat in a 14 and from the black one in a 12.

`variantId` builds the key from those three values rather than assigning one,
so a reordered catalogue cannot silently re-point a stock count at a different
garment. The separator is `·` because hyphens already appear inside slugs.

**Colours are confirmed as of 2026-09-21** — every colourway in
`lib/stocklist.ts` is named on her own dashboard. `lib/search.ts` still has no
colour matching; its comment predates that and a colour search could now be
honest. Not built. **Never read a colour off a photograph** — this project
once shipped a "satin skirt" that was a matte brown pencil skirt.

### The store — `lib/stock.ts`

Neon Postgres, via Neon's own HTTP driver rather than a TCP client: a function
that runs for 200ms and dies must not leave a connection behind it. Two
tables, created on demand with `IF NOT EXISTS` — one table and one log does
not justify a migration framework.

**Provisioned 2026-09-20**: `b-boutique-db`, Neon free tier, region `lhr1`
(London — next to the functions and next to the customers), Neon Auth
deliberately OFF. Auth is a user-accounts product and this site has no app
users; switching it on would have added an identity store that nothing reads
and a data-processing surface `/privacy` would then be wrong about.

Sixteen variables were injected on Production and Preview, confirmed present.
`DATABASE_URL` is Neon's POOLED string and is what `connectionString()` picks
up first. **No custom variable prefix was set** — one would have renamed
everything to `STORAGE_URL` and left `/stock` reporting "no database" beside a
working one. No per-deployment database branches either: the production branch
on this project *is* `client/b-boutique`, so previews are rare and one
database means one answer to what is in the shop.

`stock_log` is not an afterthought. When a count is wrong, and it will be
because a human is tapping a phone in a shop, the only useful question is
"what happened to this piece?". **Every change goes through `adjust` or
`setCount` and every change is logged.** There is deliberately no unlogged
write path: an unexplainable count is an untrusted one, an untrusted stock
system gets ignored, and an ignored one oversells.

`qty: null` means **never counted**, and it is not zero. Conflating them is
how a shop hides its own stock from itself.

### Her page — `/stock`

Phone-first, one-handed, at a counter with a customer waiting: find the piece,
tap **Sold**, done. Count / Back / Received sit behind a second tap because
they happen weekly and selling happens all day. Every control clears 44px — a
mis-tap marks the wrong garment sold.

**The count never moves optimistically.** A number that flicks to the right
value and then back because the request failed is worse than one that takes
300ms, because she has already walked away believing it.

No header, no footer, nothing on the site links to it, and it is `noindex`
regardless of `ALLOW_INDEXING`. The gate is a single passphrase
(`STOCK_PASSPHRASE`) with an HMAC-signed HttpOnly cookie, `SameSite=lax`,
`Secure`, `Path=/stock`, 12 hours. Accounts would be security theatre for a
handful of people who already share a till; the threat is a stranger finding
the URL. **Authorisation is checked on every request in `/api/stock`, never
inferred from the page having rendered a button.**

Verified 2026-09-20: unconfigured → 503/401 and nobody let in; wrong passcode
→ 401 with no detail about why; correct passcode → cookie with all four flags;
axe clean at 390px; no horizontal overflow.

### The rule that governs what gets displayed

**No stock number reaches a visitor until a person has counted it.** "Only 1
left" when nobody counted is a scarcity claim about a real business — the same
regulations as a price, and arguably worse because it pressures the purchase
rather than describing it. `pnpm launch-check` blocks on unconfirmed colours;
the counts themselves are a question for `/stock` and for a person.

### Orders — built 2026-09-21/22

`lib/orders.ts`. `createPendingOrder` reserves each counted variant BEFORE the
SumUp redirect; `markPaid` is idempotent (`WHERE status = 'pending'`); every
failure path releases. `lib/order-sweep.ts` releases pendings older than 30
minutes on `/stock` load, and "we could not find out" deliberately releases
nothing. Paid orders email the shop and the customer and appear on `/stock`
with a Posted button. Resend is live — a contact-form message was confirmed
delivered in Resend's own log on 2026-09-22 — but **no order email has been
sent end to end yet**, because checkout cannot run until
`NEXT_PUBLIC_SITE_URL` is set. The first test card is also the first test of
those two emails. The SumUp
transaction poll stays dead — she types amounts at the till.

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

**2026-09-23: palette decisions.** Brad looked at a Mulberry (#3A2036) and
Mint re-theme and a Cherry/Menthol one. Cherry/Menthol was rejected up
front (neon, from a vape brand, fails contrast). Mulberry was mocked up
site-wide and then REJECTED: "I don't like this new theme purple colour".
The ink stays #1A1416. Do not reintroduce purple/plum grounds.

**2026-09-23: buy block, swatches, display face.**
- Display face is **Playfair Display 400** (real italic). Bodoni Moda, then
  Gloock (rejected as "too thick and bold"). Self-hosted via next/font.
- Colour is a row of **swatch buttons filled with a crop of that colourway's
  own product photo** (AddToBag, position set per category). Brad asked for
  the colour to fill the button; cropping her photo shows the real garment
  and asserts no invented hex. Do not replace with guessed colour values.
- Add to bag / Buy now are pills in theme colours (ink with a sheen; Buy now
  -> ink outline filling with ink). Gold was dropped: the theme has none. The
  statement pieces on the home page carry the same AddToBag block.

## PREVIEW BRANCH `preview/red-ivory` — 2026-09-23 (not live)

Brad asked to see red and ivory cream. Token swap only: `--bb-black` ->
deep red #6E0A10 (text, buttons, bands), paper -> ivory #F8F2E7, greys
warmed, `--bb-rouge-lift` -> #F2B8BF (#DE6376 was ~2.5:1 on the red).
Reopens the ink rule AND the old "no cream" rule; merges only if Brad
approves. Sister preview: `preview/oxblood-rose`.
