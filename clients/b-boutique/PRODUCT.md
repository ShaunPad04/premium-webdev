# Product

## Register

brand

## Users

Women in and around Cleethorpes and North East Lincolnshire who buy clothes in
person, and visitors to the seafront who walk Sea View Street. They arrive on a
phone, usually before deciding whether the trip is worth making, and they are
answering three practical questions: what kind of shop is this, is it open, and
where exactly is it.

Since September there is a second reader, and usually it is the same person in
the same session: someone who has decided they want the piece and would rather
buy it than travel for it. They now can. That does not displace the first
reader — the page is still built for somebody deciding whether to come in — but
it does mean the site has to be able to take money without ever overstating
what it can honour.

There is still no account, no login and no returning-user state. Every visitor
is effectively a first-time visitor. The bag lives in `localStorage` and
nowhere else; the shop knows nothing about anyone until they pay.

The job to be done is **deciding to trust this shop** — and then either walking
through the door or buying the piece. Both endings are legitimate. Neither is
served by a claim the shop cannot stand behind.

## Product Purpose

B Boutique is an independent womenswear, accessories and homeware boutique at
18 Sea View Street, Cleethorpes, DN35 8EZ, run as a sole trader. It is open
**every day, 10am to 4pm** — confirmed by the client on 2026-09-20, when
Monday was corrected from closed. The hours live in `shop.ts` and every surface
derives them; no document, including this one, may state them independently.

The site is fifteen routes, not the single scroll-driven page it began as: the
home page, `/shop` and `/shop/[slug]`, `/clothing` and `/clothing/[category]`,
`/accessories`, `/bag`, `/checkout/success`, `/about`, `/contact`, the four
selling-terms pages (`/delivery`, `/returns`, `/terms`, `/privacy`), and
`/stock`. Four API routes sit behind them: contact, checkout, availability and
stock.

It sells **both ways**. In the shop, where she rings the amount through a SumUp
card reader, and online, where `/api/checkout` creates a SumUp hosted checkout
and the customer pays on SumUp's page. Card details never touch this site.

`/stock` is the one surface that is not for customers. It is a phone-first tool
the owner uses at the counter to mark a piece sold, and it is the website's own
source of truth for what is left, because SumUp publishes no inventory endpoint
in either direction. It is `noindex`, passphrase-gated, linked from nowhere,
and it is deliberately **excluded from design passes**: it is tapped a hundred
times a day, where motion is a cost rather than a feature.

Success is still a visit or a sale that the shop can actually fulfil. The
commercial consequence of getting this wrong has grown, and is worth restating
plainly: this is a **real business at a real address, now able to charge a real
card**. A confident-sounding invention about opening hours, delivery, stock or
price no longer merely sends someone to the wrong door — it can take their
money on terms nobody agreed to. That asymmetry drives the first design
principle below, and it is the reason the shop is still not switched on.

## Brand Personality

Assured, warm and unfussy. A good room rather than a jewellery box.

*Updated 2026-09-21. This read "assured, cool and unfussy — a fashion gallery"
and the client asked for the opposite of the cool half: a womenswear boutique
for women of all sizes, "somewhat girly but not childlike", still premium.
"Cool" was the word doing the most work in the old visual direction and it is
the word that had to go. Everything else here was right and is kept.*

The voice is plain-spoken and specific. It says "Wide, tailored, and cut to
actually fit" and "For a street that faces the sea" — concrete, faintly dry,
never breathless. **It does not use adjectives to manufacture a position**, and
it never oversells. That rule is what keeps warmth from becoming gush, and it
is why the hero says "For every woman who walks in" rather than naming a size
range nobody has confirmed. Where a fact is not known, the site says so or
says nothing.

Three words: **assured, warm, exact.**

Emotionally the page should feel like a well-lit room with good things in it,
somebody pleased to see you, and nobody hovering. Welcome without pressure.

## Anti-references

These are recorded because the implementation argued each one out explicitly,
not because they are generic good taste.

- **The default boutique website.** Playfair Display plus Montserrat, cream and
  champagne, a gold-foil monogram. This is the first thing anyone produces for
  "luxury boutique" and it is precisely what this site rejects.
- **Warm luxury signifiers.** *Restated 2026-09-21 rather than deleted. The
  site went warm and light-dominant that day at the client's request, which
  retires the "cool gallery" half of this rule and makes the other half more
  load-bearing, not less.*

  Still banned, without exception: **brown, tan, beige, cream, champagne and
  gold.** These are the signifiers a warm boutique palette drifts into, and
  the drift is now downhill rather than uphill. The paper is `#FAF5F3`, which
  leans PINK — measured, a green-to-blue gap of 2. Cream has a large
  green-to-blue gap and that is exactly what makes it read yellow and bridal.
  A warm white is not permission for a warm beige.

  The warmth is carried by one colour, `#8A070B`, and it is not a choice
  anybody made: it was sampled from the shop's own hero photograph. The rule
  underneath has not moved at all — **the site's warm colour has to be real
  before it can be used.**
- **Commerce the shop cannot honour.** *This anti-reference used to read "faked
  commerce: no cart state, no checkout, no search backend", and it was rewritten
  rather than deleted when all three became real. The rule underneath it never
  changed, and it is currently the most load-bearing sentence in this file.*

  Every price in `lib/catalogue.ts` is **invented**. Under the Consumer
  Protection from Unfair Trading Regulations a displayed price is what the
  customer is entitled to pay, so these are live offers the moment anyone can
  reach them. Exactly three things stand in the way, and none may be removed
  casually or as a side effect of other work:

  1. `demo: true` on every product, which renders a visible notice.
  2. The site is `noindex` until `ALLOW_INDEXING` is set.
  3. `NEXT_PUBLIC_SITE_URL` is unset, so `/api/checkout` answers 503.

  The SumUp key and merchant code are already set in Vercel. That third guard
  is therefore one environment variable away from gone. Order of operations:
  her real prices, then the site URL, then a test card, then indexing.

  The same rule governs everything downstream. Never confirm an order the shop
  did not take: `/checkout/success` asks SumUp whether the payment happened
  rather than trusting the URL a browser arrived on. Never show a stock count
  nobody has counted — "only 1 left" is a scarcity claim about a real business
  and falls under the same regulations as a price. Never report a contact form
  as sent when nothing was sent.
- **Invented local fact.** No parking claims, walking times, car park names,
  street rules, delivery terms, returns policy or stockist relationships until
  the client confirms them in their own words. Placeholder content must
  announce itself as placeholder. Three of the fifteen selling-terms slots are
  still open and each renders as a visible CLIENT INPUT REQUIRED block rather
  than as plausible prose.
- **Motion for its own sake.** No scroll hijacking, no animation on every
  heading, no pinning that delays the page. One heroic effect per screen.

## Design Principles

**1. Never assert what the client has not confirmed.**
The strongest rule on the project. Unverified claims are removed, not softened;
placeholders are labelled in-source and on-screen; indexing is default-deny so
an unapproved answer cannot reach Google attached to a real business. Silence
beats a plausible guess.

**2. One source of truth, or none.**
The address, hours and coordinates live in `shop.ts` and every consumer derives
from it — Visit, the FAQ, the footer, the menu, the JSON-LD, the map, the
directions link. There is no second copy to keep in step. When two sources
would have to agree, there is only one source.

*This principle has been broken twice, both times by a hardcoded string that a
sweep missed: a meta description reading "Open Tuesday to Sunday", and the
corner menu reading "Tue – Sun / 10:00 – 16:00" in the main navigation of every
page. This document was the third instance. A fact typed a second time is a
fact that will eventually disagree with itself.*

**3. The shop may ask for a visit or a sale, and must be able to honour either.**
The page still ends at an address, because for most of these readers the answer
is a postcode. But the basket is real now, so the second ask carries a duty the
first one did not: the server prices the bag, never the browser; the checkout
verifies stock in the last moment before payment; and the whole path stays
switched off until the prices are the client's own. Anything that implies an
order the shop cannot fulfil is a false promise, whichever ask it sits under.

**4. Restraint is the luxury signal.**
Expense reads through proportion, contrast and space, not through ornament.
Two typefaces. One easing curve. Three durations. A single warm colour, and it
comes from a photograph. When a decision could go louder or quieter, it goes
quieter — and then commits completely to the few moves it keeps.

**5. Decisions are recorded with their reasoning.**
The codebase argues with itself in comments so that a settled question stays
settled. A decision without its reason gets re-opened by the next person and
re-broken. Locked decisions live in `CLAUDE.md` and are not revisited without
the client asking.

## Accessibility & Inclusion

WCAG 2.1 **AA is the floor, not the goal.** The project ships an automated gate
(`pnpm test:a11y`, Playwright plus axe-core, 90 tests) that runs at mobile,
tablet and desktop and must pass with zero violations, including a
keyboard-navigation check at each width.

Specific commitments already implemented and not to be regressed:

- **Contrast is measured, not assumed.** Each grey is documented as safe on
  exactly one ground: `--bb-grey-mid` is a dark-section colour (6.95:1 on
  black, failing 2.68:1 on white), `--bb-grey-dark` a light-section one
  (5.44:1 on white). They are not interchangeable.
- **Automated contrast checking under-reports, and is not the last word.** axe
  skips disabled controls and samples mid-transition; both gaps have produced
  real failures on this project that only a computed measurement in a live
  render caught. Measure the element, do not trust the green tick.
- **Focus is never removed, and never drawn as a box around a row.** The ring is
  `currentColor`, because the same ring crosses a black header, a photograph, a
  cool-white FAQ and a black footer and no fixed colour survives all four. Note
  that Safari and Firefox match `:focus-visible` on a mouse click where Chromium
  does not, so a focus treatment has to look deliberate for pointer users too.
- **`prefers-reduced-motion` is honoured globally**, not per component:
  reveals resolve to their finished state, smooth scrolling reverts to auto,
  and animation and transition durations collapse.
- **Interaction works without JavaScript where it can.** The rails use native
  CSS scroll-snap, so they stay keyboard and screen-reader navigable with no
  script.

  *The FAQ was a second example of this and is no longer. It was a native
  `<details name="faq">` group; on 2026-09-20 the client supplied a component
  to use and it became a client-side accordion with per-row state. With
  JavaScript off, only the first row — which is open on arrival — can be read.
  Two things were kept rather than inherited from the supplied component: the
  answers are always rendered in the HTML instead of mounted on open, because
  the address and the opening hours are the most valuable crawlable facts on
  the page; and a closed panel carries `inert`, so it stays in the document
  without being announced. The deviation log is in
  `components/ui/faq-section.tsx`. If the no-script behaviour is wanted back,
  the same visual design sits on `<details>` without changing the component's
  API.*
- **Press feedback exists, because most of these readers are on a phone.**
  Pressable elements scale to 0.97 on `:active`. On touch there is no hover to
  fall back on, so press is the only feedback channel there is.
- **Decorative repetition is hidden from assistive technology.** The giant
  footer wordmark, the FAQ index numerals and inert marks are `aria-hidden`
  rather than announced a second and third time.

<!-- Provenance.

     Assembled from the existing implementation and CLAUDE.md, not from an
     interview. Facts (address, hours, register, route list, accessibility
     behaviours, anti-references) are evidenced in source. The three-word
     personality and the emotional goal in Brand Personality remain the one
     inferred reading and are the parts most worth a client sanity check.

     Refreshed 2026-09-20 via `impeccable teach`. The previous version dated
     2026-09-03 described a single scroll-driven page that sold in person only,
     had "no account, no basket", and stated the shop was closed on Mondays.
     All three had stopped being true, and the last of them was the same false
     fact found hardcoded in CornerMenu.tsx the same day. Register was
     re-confirmed as `brand` rather than assumed.

     Sections preserved from that version because they were still exactly
     right: Brand Personality, four of the five anti-references, four of the
     five design principles, and the whole of Accessibility & Inclusion. -->
