---
name: B Boutique
description: A warm, light-dominant boutique system — rouge on paper, with the shop's own red promoted from the photography into the interface.
colors:
  black: "#1A1416"        # warm near-black. NOT true black — see note below
  black-soft: "#241C1F"
  black-raised: "#2E2429"
  white: "#FAF5F3"        # warm paper, leaning PINK not yellow
  white-pure: "#FDFAF9"
  grey-light: "#DCD4D2"
  grey-mid: "#9A8F8D"     # DARK grounds only — 2.95:1 on paper
  grey-dark: "#6B5F5E"    # LIGHT grounds only — 2.96:1 on ink
  red: "#8A070B"          # sampled from the hero photograph, never invented
  rouge: "#8A070B"        # LIGHT grounds only — 9.33:1 on paper, 1.83:1 on ink
  rouge-deep: "#6E0509"   # hover on light — 11.69:1 on paper
  rouge-lift: "#DE6376"   # DARK grounds only — 5.32:1 on ink
typography:
  display:
    fontFamily: "Bodoni Moda, Libre Bodoni, Bodoni 72, Didot, serif"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Bodoni Moda, Libre Bodoni, Bodoni 72, Didot, serif"
    fontSize: "clamp(44px, 4.8vw, 76px)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Bodoni Moda, Libre Bodoni, Bodoni 72, Didot, serif"
    fontSize: "clamp(23px, 1.9vw, 31px)"
    fontWeight: 400
    lineHeight: 1.02
  body:
    fontFamily: "Inter, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    letterSpacing: "0.18em"
rounded:
  none: "0"
  focus: "2px"
  pill: "9999px"
spacing:
  gutter: "32px"
  gutter-editorial: "clamp(32px, 7.5vw, 120px)"
  enter: "15vh"
  settle: "42vh"
  step: "3vh"
components:
  button-arrow-light:
    backgroundColor: "{colors.white-pure}"
    textColor: "{colors.black}"
    rounded: "{rounded.pill}"
    padding: "8px 16px 8px 8px"
  button-arrow-light-hover:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.black}"
  button-arrow-dark:
    backgroundColor: "{colors.black}"
    textColor: "{colors.white-pure}"
    rounded: "{rounded.pill}"
    padding: "8px 16px 8px 8px"
  button-arrow-dark-hover:
    backgroundColor: "{colors.black-raised}"
    textColor: "{colors.white-pure}"
  label-eyebrow:
    textColor: "{colors.grey-mid}"
    typography: "{typography.label}"
  brand-rail:
    backgroundColor: "{colors.black}"
    height: "68px"
---

# Design System: B Boutique

## 1. Overview

**Creative North Star: "The Cool Room"**

A fashion gallery, not a jewellery box. The system is built from a true black
and a cool bone white, held apart by measured greys, with exactly one warm
colour in the entire palette — a deep red sampled from the hero photograph
rather than chosen from a swatch. Everything expensive about this design comes
from proportion, contrast and space. Nothing comes from ornament.

The system explicitly rejects the default boutique website: Playfair Display
and Montserrat, cream and champagne, a gold-foil monogram, a shop-front photo
behind a translucent overlay. It also rejects the warm palette this project
originally started from. The shop's own room — black marble, brass rails, a
bone floor — produced a palette that read brown wherever two surfaces met, and
it was replaced wholesale. There is no brown, tan, beige, cream, champagne or
gold anywhere in the UI. Where warmth appears, it is inside a photograph, where
it is real.

Restraint here is structural, not decorative. Two typefaces. One easing curve.
Three durations. Zero shadows. Two corner radii, one of which is zero. The
discipline is what lets the few committed moves — a red hero, a manifesto set
in Bodoni caps on black, a wordmark the height of the footer — carry the whole
identity without competing with each other.

**Key Characteristics:**
- Cool monochrome ground; a single warm accent that originates in the artwork
- Flat by construction: no shadow vocabulary exists
- Square by default; roundness is reserved for one control
- Editorial type scale with genuine contrast between display and UI
- One motion language, applied site-wide, viewport-relative rather than time-based
- Contrast measured per-ground and documented, never assumed

## 2. Colors

A cool gallery palette: true black, bone white, three calibrated greys, and one
red that is allowed to be the only warm thing on the page.

### Primary
- **Hero Red** (`#8A070B`): The single warm colour in the system, sampled from
  the hero photograph rather than picked. It appears as the hero ground and
  nowhere else of consequence. Bone clears 9.09:1 on it. It earns its place by
  already existing in the artwork.

### Neutral
- **Warm ink** (`#1A1416`): No longer the dominant ground — the site went
  light-dominant on 2026-09-21. Dark is punctuation now: the header, the
  statement band under the hero, the manifesto, the category grid and the
  footer. Testimonials, Visit and the About philosophy all flipped to paper.
  It is a WARM near-black, not
  `#000` — a hair off pure, so large fields do not read as a void.
- **Soft Black** (`#090909`) and **Raised Black** (`#0D0D0D`): The only depth
  mechanism in the system. Raised black is a surface lifted off the ground by
  tone alone, and the hover state for dark controls.
- **Bone** (`#FAFAF8`): The lighter of the two whites and the page's default
  background. Cool, never cream.
- **Bone Deep** (`#F5F5F2`): The slightly darker band, used for sections that
  need to separate from bone without going black.
- **Grey Light** (`#D8D8D4`): Hairlines and dividers on light grounds.
- **Grey Mid** (`#979793`): Muted text **on dark grounds only** — 6.95:1 on
  black, but 2.68:1 on white, which fails.
- **Grey Dark** (`#646460`): Muted text **on light grounds only** — 5.44:1 on
  white, but 3.43:1 on black, which is large-text-only.

### Named Rules

**The One Warm Thing Rule.** Exactly one warm colour exists, and it comes out
of a photograph. No brown, tan, beige, cream, champagne or gold may enter the
UI. A luxury palette that reaches for gold has stopped trusting its own
proportions.

**The Single-Ground Rule.** Each grey is safe on exactly one ground and is
documented with its measured ratio. Grey-mid is a dark-section colour, grey-dark
a light-section one. They are not interchangeable and must never be swapped. For
muted text at an opacity instead, `white/55` is 5.82:1 on black and `black/65`
is 6.42:1 on white; both clear AA.

**The Retired Token Rule.** `--gold` and `--gold-lift` survive only because
components still call them, and both now resolve to maximum contrast against
their intended ground. They are scheduled for deletion, not for reuse. Never
introduce a new reference to either.

## 3. Typography

**Display Font:** Bodoni Moda (with Libre Bodoni, Bodoni 72, Didot, serif)
**Body Font:** Inter (with Helvetica Neue, Helvetica, Arial, sans-serif)
**Label Font:** Inter — the same face, differentiated by size, tracking and case

**Character:** A high-contrast Didone against a neutral grotesque. Bodoni
carries every editorial moment — the wordmark, the manifesto, section headings,
category names, the address, the giant footer sign-off. Inter does the quiet
half: navigation, labels, buttons, FAQ, numbers, microcopy. The pairing works
because the two faces are not competing for the same job; the serif is never
asked to be a UI face, and the sans is never asked to carry personality.

Bodoni is set at weight 400 and only 400. A faked or synthesised bold destroys
the thick/thin stress that is the entire reason for choosing a Didone.

### Hierarchy
- **Display** (400, fluid to 76px+, line-height 1.02, letter-spacing -0.025em):
  The wordmark and the largest editorial statements. `text-wrap: balance`.
- **Headline** (400, `clamp(44px, 4.8vw, 76px)`, 1.02): Section headings and
  the manifesto statement.
- **Title** (400, `clamp(23px, 1.9vw, 31px)`, 1.02): Category names, card
  titles, sub-headings.
- **Body** (400, 15px, ~1.6): Running copy. Capped well inside 65–75ch by
  narrow measure columns rather than by a global container.
- **Label** (500, 11px, letter-spacing 0.18em, uppercase, tabular numerals):
  Eyebrows, index numbers, metadata, micro-type. Smaller variants down to 9px
  exist for section eyebrows and counters.

### Named Rules

**The Two Faces Rule.** Bodoni and Inter, and nothing else. Three UI faces
(Jost, Archivo, JetBrains Mono) were collapsed into Inter because three faces
was one more idea than the page needed and cost three font downloads to say the
same thing. `font-sans`, `font-grotesk` and `font-mono` all alias to Inter so
legacy classNames keep working.

**The Base Layer Rule.** `.display` and `.label` live in `@layer base` and must
stay there. Unlayered CSS beats Tailwind v4 utilities outright, so moving them
out silently overrides every per-element `leading-*` and `tracking-*` on the
site. This was measured: the wordmark asked for leading 0.82 and rendered at
1.02.

**The No Italic Rule.** The Bodoni italic axis is not loaded. It cost 25 KB on
the critical path, competing with the hero image, and nothing on the site was
set in italic. Add the axis back the day something needs it, not before.

## 4. Elevation

**This system has no shadow vocabulary.** There is not a single `box-shadow`
declaration in the stylesheet, and that is a commitment, not an oversight.

Depth is conveyed three ways, all of them flat:

1. **Tonal layering.** A surface lifts off its ground by moving from
   `#050505` to `#0D0D0D`, not by casting a shadow.
2. **Hairlines.** 1px rules at `rgba(255,255,255,0.14)` on dark and
   `rgba(10,10,10,0.14)` on light separate bands. Hairlines are structural
   ledger marks, never decorative accents.
3. **Paper grain.** A 3.5%-opacity fractal-noise overlay (`.grain`) keeps large
   flat fields from reading as flat digital fill. It is the only texture in the
   system.

Corner radius is effectively zero. The only radii are 2px on the focus ring and
a full pill on the arrow button. Everything else is square.

### Named Rules

**The Flat Rule.** No shadows, no glows, no glass. If an element needs to feel
lifted, change its tone or give it space. A shadow in this system is a bug.

**The Hairline Rule.** Rules are 1px and low-contrast. A border heavier than
1px used as a coloured accent stripe is prohibited outright.

## 5. Components

### Buttons
- **Shape:** Full pill (`border-radius: 9999px`) — the one rounded thing in the
  system, which is what makes it read as *the* control.
- **Structure:** A pill with a filled circular arrow badge set into its left
  end. The badge inverts against its own pill: a light pill takes a black
  badge, a dark pill takes a bone badge, because a black badge on a black pill
  would vanish.
- **Light tone:** bone ground, black text; hover to pure white.
- **Dark tone:** black ground, bone text; hover to raised black.
- **Hover / Focus:** The arrow rotates 45° to point along its travel direction,
  300ms, ease-out. That single rotation is the entire micro-interaction — one
  move, no bounce, no scale, no shadow.
- **Icon:** Inline SVG, 14px, 1.6 stroke, `currentColor`, round caps.

### Cards / Containers
- **Corner Style:** Square (0).
- **Shadow Strategy:** None. See Elevation.
- **Border:** Hairline only, where a band edge needs defining.
- **Photography:** 3:4 portrait, full colour at source. The monochrome resting
  state is a CSS filter, never baked into the file, so the same asset can warm
  up on interaction without a second download.
- **Height:** `clamp(420px, 38vw, 600px)` for category panels.

### Navigation
- **Header:** Sits on true black, transitions to a blurred near-black at 64px
  of scroll (14px backdrop blur, 480ms). The only backdrop-filter used
  decoratively anywhere, and it is doing legibility work over a photograph.
- **Corner menu:** Inter extrabold uppercase labels, a `bg-onyx/55` scrim with
  a 2px blur, Escape closes, focus returns to the opener, `main` is marked
  inert while open.
- **Typography:** Small tracked caps via `.label` for header links; Bodoni for
  the wordmark, deliberately the same face at two sizes so the identity reads
  as one thing.

### Rails
- **Mechanism:** Native CSS `scroll-snap-type: x mandatory` with
  `scroll-snap-align: start`. No slider library. Works without JavaScript and
  stays keyboard and screen-reader navigable.
- **Scrollbars:** Hidden on all engines, because the snap points are the
  affordance.
- **Brand marquee:** 60px tall on mobile, 68px from 640px up. Hairline-ruled
  top and bottom, seamless -50% loop, masked at both ends with a narrow
  6%/94% linear-gradient so marks arrive and leave rather than being clipped.
  Narrow fades only — wide fades read as fog.

### Focus Ring (signature)
- `outline: 2px solid currentColor`, 3px offset, 2px radius, applied via
  `:where(a, button, [tabindex]):focus-visible`.
- **`currentColor` is load-bearing.** The ring crosses a black header, a
  photograph, a cool-white FAQ and a black footer. No fixed token survives all
  four; a fixed gold went black-on-black over the hero the moment gold was
  retired. Focusable text already contrasts with its own background, so
  borrowing its colour inherits that guarantee.

### Motion (applied across all components)
- **One curve:** `cubic-bezier(0.22, 1, 0.36, 1)`. Exponential ease-out. No
  bounce, no elastic, no overshoot.
- **Three durations, named by intent:** quick 220ms (hover, focus, small state
  changes), normal 650ms (the default), editorial 1000ms (large reveals).
- **Scroll entrances are viewport-relative, not element-relative.** Reveals
  begin when an element is 15vh above the fold edge and finish by 42vh; one
  stagger step is 3vh. Entry percentages were abandoned because they are
  relative to the animated element's own height, so the same "4%" meant 3px on
  a FAQ row and 31px on a category card. With a scroll timeline attached, a
  time-based `animation-delay` is ignored outright — a stagger must be a
  distance.
- **Reduced motion is global.** Reveals resolve to their finished state,
  `scroll-behavior` reverts to auto, and all animation and transition durations
  collapse to 0.01ms.

## 6. Do's and Don'ts

### Do:
- **Do** keep the palette cool. True black `#050505` against bone `#FAFAF8`,
  with hero red `#8A070B` as the only warm colour.
- **Do** check which ground a grey is going on. Grey-mid on dark, grey-dark on
  light, and never the reverse.
- **Do** set every editorial moment in Bodoni Moda at weight 400, and every
  piece of UI in Inter.
- **Do** convey depth with tone, hairlines and grain.
- **Do** use `currentColor` for focus rings.
- **Do** honour `prefers-reduced-motion` with `gsap.matchMedia()` or the global
  CSS block; never ship a motion path that ignores it.
- **Do** express scroll choreography as viewport distances (`vh`), not
  milliseconds.
- **Do** derive every address, hour and coordinate from `shop.ts`.
- **Do** label placeholder content as placeholder, in source and on screen.

### Don't:
- **Don't** introduce brown, tan, beige, cream, champagne or gold. The warm
  palette was removed deliberately and must not return.
- **Don't** reach for Playfair Display plus Montserrat, a gold-foil monogram,
  or any other default boutique-website signature. That is the anti-reference.
- **Don't** add a `box-shadow`. This system is flat by commitment.
- **Don't** use `border-left` or `border-right` greater than 1px as a coloured
  accent stripe.
- **Don't** use `background-clip: text` for gradient type. The dormant
  `.chrome` rule in `globals.css` is unreferenced dead code and must not be
  revived.
- **Don't** synthesise a bold Bodoni, or add the italic axis without a use.
- **Don't** move `.display` or `.label` out of `@layer base`.
- **Don't** add a second easing curve or an off-band duration.
- **Don't** use bounce or elastic easing. `--ease-spring` is declared,
  unreferenced, and should be treated as retired.
- **Don't** animate layout properties. Transform and opacity only.
- **Don't** confirm commerce the shop cannot honour. Cart state, checkout and
  search are all REAL now, so the old form of this rule ("no cart state, no
  checkout, no search backend") is retired — but the rule underneath it is not.
  Never confirm an order the shop did not take: `/checkout/success` asks SumUp
  whether the payment happened rather than trusting the URL. Never show a stock
  count nobody has counted. Never report a contact form as sent when nothing
  was sent. Every price in `catalogue.ts` is still invented, and the three
  guards keeping it off a real card — the `demo: true` notice, `noindex`, and
  an unset `NEXT_PUBLIC_SITE_URL` — are not to be removed as a side effect of
  other work. See PRODUCT.md, "Commerce the shop cannot honour".
- **Don't** assert an unverified fact about the shop: no parking claims,
  walking times, delivery terms, returns policy or stockist relationships until
  the client confirms them.
- **Don't** reintroduce a giant wordmark to the hero, hero pinning, or hero
  scaling. All three were removed deliberately.
