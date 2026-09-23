import { stocklist } from "./stocklist";
/** Single source of truth for B Boutique. Everything on the site — the
 *  "open now" badge, the hours table, the schema.org markup — reads from here.
 *  Change it once, it changes everywhere. */

export const shop = {
  name: "B Boutique",
  /* ── PHONE: CONFIRMED BY THE CLIENT 2026-09-06 ────────────────────────
     Given by the client directly, in their own words, in chat. It is the
     number the contact page, the corner menu and the footer all print, and
     the only contact channel the site currently has.

     ── EMAIL: CONFIRMED BY THE CLIENT 2026-09-20 ────────────────────────
     bboutiquecleethorpes@gmail.com, and she asked for it to be SHOWN on the
     site rather than kept behind the form. Both were her answers, given in
     her own words.

     Setting it here does NOT wire up the contact form. That still needs
     CONTACT_TO, CONTACT_FROM and RESEND_API_KEY in the environment, and
     /api/contact answers 503 until all three exist. This value is what the
     site prints and what the privacy page gives people for a data request.

     Worth revisiting once the domain lands: a gmail.com address on a shop's
     own domain reads as temporary, and hello@<domain> is a better face. Her
     call, not ours, and this is a real working inbox in the meantime.

     Never guess either value. A wrong number on a real shop's site sends
     customers to a stranger. */
  /* ── REMOVED AT THE CLIENT'S INSTRUCTION, 2026-09-21 ─────────────────
     He asked for phone numbers to come off the website. The number itself
     is NOT deleted from this comment's history — it was client-confirmed on
     2026-09-06 and is 07305534342 — because removing it from the site is a
     display decision and may be reversed, while re-confirming a number is a
     conversation with the client.

     Emptying it HERE rather than editing fourteen files is the point: every
     phone on the site derived from this field, so one change removes all of
     them, and restoring it is one change too.

     CONSEQUENCE, and it is a real one: email is now the only way to reach
     the shop from the website. bboutiqueclee@gmail.com is client-confirmed
     and shown, so there is still a route — but locked decision 11 said the
     contact form must fail with "a plainly worded failure plus the phone
     number", and that is no longer possible. The form now fails to the
     email address instead. The decision table is updated in the same pass
     rather than left to contradict this file. */
  phone: "" as string,
  email: "bboutiquecleethorpes@gmail.com" as string,
  street: "18 Sea View Street",
  town: "Cleethorpes",

  /* ── ADDRESS: CONFIRMED BY THE CLIENT 2026-09-02 ──────────────────────
     18 Sea View Street, Cleethorpes, DN35 8EZ. Personally confirmed as the
     physical boutique. This is now settled fact, not a best guess.

     History, so nobody re-opens it: the project was originally briefed
     "18 Seaview Street … DN35 8HY". Google resolved the building as
     "18 Sea View St … DN35 8EZ", and the two disagreed on both the street
     spelling and the postcode. That was flagged rather than silently
     resolved, and the client has now confirmed the second. DN35 8HY is
     wrong and must not come back. "Street" is written out rather than
     Google's "St", which is a display abbreviation, not part of the name.

     Coordinates are the shop's own point from the client's Google Maps link
     — the !3d/!4d pair. The @ pair in a Maps URL is the viewport centre and
     sat 170m west of the building.

     Every address on the site derives from here: Visit, the FAQ, the footer,
     the corner menu, the JSON-LD LocalBusiness block, the map embed and the
     directions link. There is no second copy to keep in step. */
  lat: 53.5574101,
  lng: -0.0259913,
  county: "North East Lincolnshire",
  postcode: "DN35 8EZ",
  country: "GB",
} as const;

/** The owner.
 *
 *  ── NAME AND ROLE: CONFIRMED BY THE CLIENT 2026-09-21 ──────────────────
 *  Hayley Brown, Shop Owner. Given directly, in chat.
 *
 *  This is the first named person on the site, and lib/about.ts says in its
 *  header that a founder's name is "deliberately NOT here, in any form" —
 *  because an invented biography of a named business at a real address is a
 *  false statement about a real person. That prohibition was about INVENTING
 *  one. It is answered now, not broken: the name came from the client.
 *
 *  ── BIO: SUPPLIED BY THE CLIENT 2026-09-21 ─────────────────────────────
 *  Her own words. This file previously said "Do NOT write `bio` … her words
 *  or nothing", and that rule was not broken — it was answered. It was then
 *  SHORTENED at the client's instruction, by cutting only; the field's own
 *  comment below records exactly what went and keeps the full original.
 *
 *  Note what the copy does and does not assert, since a future edit could
 *  quietly change it: "stylish, affordable", "new stock" and "a warm
 *  welcome" are the shop describing itself, which is hers to say. There is
 *  no price, no size range, no brand, no founding year and no award in it.
 *  Do not add one.
 *
 *  ── PORTRAIT: SUPPLIED BY THE CLIENT 2026-09-21 ────────────────────────
 *  It is in, so `ownerPending` is now false and the CLIENT INPUT REQUIRED
 *  marker no longer renders. Nothing was ever substituted while waiting,
 *  which was the whole point of holding the frame empty: the card presents
 *  whatever is in it as a photograph of Hayley Brown, so a stock face would
 *  not have been a placeholder — it would have been a picture of somebody
 *  else labelled with her name on her own shop's website.
 *
 *  The one caveat, recorded rather than hidden: the source is 487px wide
 *  against a frame that is up to 420 CSS px, so a DPR-2 display gets 58% of
 *  the pixels it wants. Sharp on a standard screen, soft on a retina one.
 *  A larger original replaces assets/owner/hayley-source.jpg and
 *  `node scripts/build-owner.mjs` regenerates everything. */
export const owner = {
  firstName: "Hayley",
  lastName: "Brown",
  role: "Shop Owner",
  /** Basename under /img/owner. The .avif/.webp/.jpg variants are built by
   *  scripts/build-owner.mjs from assets/owner/hayley-source.jpg.
   *
   *  SUPPLIED BY THE CLIENT 2026-09-21. It is her photograph, cropped to the
   *  card's 3:4 frame at build time and not otherwise altered — no
   *  retouching, no recolouring, no filter.
   *
   *  It is black and white where the rest of the site's photography is warm
   *  colour. That is how she sent it and it is left alone: a portrait reads
   *  as a deliberate editorial choice against the paper ground, and tinting
   *  somebody's photograph to match a palette is not a colour correction, it
   *  is editing a picture of a person. */
  portrait: "hayley" as string,
  /** Her words, shortened at the client's instruction 2026-09-21 — BY CUTTING
   *  ONLY. Three paragraphs became two, and every phrase that remains is one
   *  she wrote. Nothing was reworded, re-ordered into a new sentence, or
   *  smoothed for rhythm: the moment supplied copy is rewritten it stops
   *  being hers and becomes a claim the site is making on her behalf.
   *
   *  What was cut, so it can be checked and restored:
   *    - "At B Boutique, we believe shopping should be personal and
   *       enjoyable."
   *    - "Whether you're looking for a new outfit, the perfect accessory, a
   *       unique gift or something beautiful for your home, …"
   *    - "and friendly service"
   *    - "and exciting" (from "new and exciting stock")
   *
   *  Her full original, kept here so the long version is never lost:
   *
   *    1. "We pride ourselves on bringing our customers something a little
   *        different, with carefully selected pieces that are stylish,
   *        affordable and perfect for treating yourself or finding that
   *        special gift."
   *    2. "At B Boutique, we believe shopping should be personal and
   *        enjoyable. Whether you're looking for a new outfit, the perfect
   *        accessory, a unique gift or something beautiful for your home,
   *        you'll always receive a warm welcome and friendly service."
   *    3. "As a small local business, our customers are at the heart of
   *        everything we do. We regularly introduce new and exciting stock,
   *        so there's always something different to discover."
   */
  bio: [
    "We pride ourselves on bringing our customers something a little different — carefully selected pieces that are stylish, affordable and perfect for treating yourself or finding that special gift.",
    "As a small local business, our customers are at the heart of everything we do. You'll always receive a warm welcome, and we regularly introduce new stock, so there's always something different to discover.",
  ] as readonly string[],
} as const;

/** True while the owner card is still missing something only she can supply.
 *  The bio has landed; the photograph has not. */
export const ownerPending = !owner.portrait || owner.bio.length === 0;

export const addressLines = [shop.street, shop.town, shop.postcode];

/** The phone number as it is printed on the page.
 *
 *  `shop.phone` holds exactly the digits the client gave, unaltered — that is
 *  the source of truth and nothing may edit it. This only groups them for
 *  reading: UK mobile numbers are written 07305 534342, and eleven unbroken
 *  digits are measurably harder to read back to somebody or copy correctly.
 *  It is a display decision, not a change to the data — `tel:` links are
 *  always built from the raw value.
 *
 *  Falls back to printing whatever is there if the number is not an 11-digit
 *  UK mobile, rather than mangling a landline or an international format. */
export const phoneDisplay = /^07\d{9}$/.test(shop.phone)
  ? `${shop.phone.slice(0, 5)} ${shop.phone.slice(5)}`
  : shop.phone;

/** 0 = Sunday, matching Date.getDay(). null = closed. Times are 24h local.
 *
 *  ── CONFIRMED BY THE CLIENT 2026-09-20 ──────────────────────────────────
 *  "everyday 10-4", in her words. MONDAY WAS WRONG: this table had it closed,
 *  which was never confirmed by anybody and is now corrected. A shop shown as
 *  shut on a day it is open turns a customer away at the door, and it is the
 *  kind of error that outlives the page once Google has cached it.
 *
 *  Seven days at the same hours is what she said. If that is seasonal — and
 *  a seaside town usually is — it needs asking again before winter, because
 *  this table is also what the JSON-LD tells search engines. */
export type Hours = { open: number; close: number } | null;

export const hours: readonly { day: string; short: string; hours: Hours }[] = [
  { day: "Monday",    short: "Mon", hours: { open: 10, close: 16 } },
  { day: "Tuesday",   short: "Tue", hours: { open: 10, close: 16 } },
  { day: "Wednesday", short: "Wed", hours: { open: 10, close: 16 } },
  { day: "Thursday",  short: "Thu", hours: { open: 10, close: 16 } },
  { day: "Friday",    short: "Fri", hours: { open: 10, close: 16 } },
  { day: "Saturday",  short: "Sat", hours: { open: 10, close: 16 } },
  { day: "Sunday",    short: "Sun", hours: { open: 10, close: 16 } },
];

/** 24-hour display for the hours table. Visit prints every row.
 *
 *  Changed from 12-hour on 2026-09-21 at the client's instruction: "10:00 -
 *  16:00" rather than "10am — 4pm". It is the register a shop sign and a
 *  Google listing use, it is zero-padded so every row in the Visit table is
 *  the same width, and it removes the am/pm ambiguity that a tired 4pm/4am
 *  typo would otherwise hide.
 *
 *  One definition, here, so the change reaches the hero, the FAQ, the Visit
 *  table, the meta description and the structured data in one edit — which is
 *  the whole reason this function exists. See the note on openingSummary. */
export function formatHour(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

/** The opening times as one sentence, derived from `hours` and never written
 *  out by hand.
 *
 *  It lives here rather than in the FAQ because three different places were
 *  each stating the hours in their own words, and on 2026-09-20 two of them
 *  became false in the same instant: the client confirmed she opens seven
 *  days, `hours` was corrected, and the site's own meta description carried
 *  on telling Google and every shared link "Open Tuesday to Sunday". The
 *  structured data said one thing and the description beside it said
 *  another.
 *
 *  A fact about a real shop, hardcoded in three places, is a fact that will
 *  be wrong in two of them. Anything that states the hours reads this. */
export function openingSummary(): string {
  const open = hours.filter((d) => d.hours);
  const closed = hours.filter((d) => !d.hours);
  if (open.length === 0) return "";

  const first = open[0].hours!;
  const uniform = open.every(
    (d) => d.hours!.open === first.open && d.hours!.close === first.close,
  );
  /* Seven identical days is "every day", not "Monday to Sunday". The client's
     own words were "open every single day", and a range that happens to span
     the whole week reads like a rota rather than a plain fact. */
  const span =
    open.length === hours.length && uniform
      ? "Every day"
      : open.length > 1 && uniform
        ? `${open[0].day} to ${open[open.length - 1].day}`
        : open.map((d) => d.day).join(", ");
  /* A plain hyphen, not the em dash this used to carry. The client wrote the
     format she wanted as "10:00 - 16:00"; an em dash in a time range reads as
     a pause in a sentence rather than as "to". */
  const time = `${formatHour(first.open)} - ${formatHour(first.close)}`;
  const shut =
    closed.length === 0
      ? ""
      : ` Closed ${closed.map((d) => d.day).join(" and ")}.`;

  return uniform ? `${span}, ${time}.${shut}` : shut.trim();
}

/** The same thing lower-cased to sit mid-sentence: "…, open every day, 10am
 *  — 4pm." Trailing full stop removed so the caller owns its punctuation. */
export function openingPhrase(): string {
  const s = openingSummary().replace(/\.$/, "");
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/* openState(), OpenState and hoursForWeekday() lived here and are gone with
   OpenBadge, their only consumer. They derived a live "open now" badge from
   the VISITOR's clock rather than the shop's, so the badge was wrong for
   anyone outside UK time — which is why the badge was removed and the plain
   hours table kept. Reinstate them together, timezone-aware, if the badge
   ever comes back. */

/** The rails. These drive the expanding panels.
 *
 *  ── 2026-09-22: these are her categories now, not ours ───────────────────
 *  This list used to carry eleven: five written at the start of the project
 *  and four more added on 2026-09-06 "so that every category has stock in it
 *  rather than a name and an empty shelf". Both sets were invented alongside
 *  the 26 invented products that filled them.
 *
 *  Her real stock arrived on 2026-09-22 and does not fit that shape, which is
 *  not a surprise — the shape was never taken from her shop. Of the eleven,
 *  Jackets, Shirts, Skirts, Denim and Accessories have NOTHING in them, and
 *  two things she does sell, Coats & Jackets as one rail and Co-ords, had
 *  nowhere to go.
 *
 *  So the taxonomy follows the stock rather than the other way round. Seven
 *  rails, each with pieces actually on it. A named rail with nothing behind
 *  it is worse than no rail: it is the shop telling a customer to come and
 *  look at an empty shelf.
 *
 *  ACCESSORIES IS THE ONE TO BE CAREFUL WITH. She sells them — the site says
 *  so in the hero and the About copy, and that is true of the shop on Sea
 *  View Street. This drop simply has none in it. The category is gone from
 *  the online rails because nothing online is in it; the copy about the shop
 *  is untouched because it is about the shop. /accessories says exactly that
 *  rather than rendering an empty grid. */
export const categories = [
  { slug: "all",            name: "Shop All",         note: "Everything on the rails now, in one place." },
  { slug: "knitwear",       name: "Knitwear",         note: "Fair Isle, boucle, cable and rib — the bulk of this drop." },
  { slug: "coats-jackets",  name: "Coats & Jackets",  note: "Trench, leopard, quilted check and longline." },
  { slug: "trousers",       name: "Trousers",         note: "Barrel, wide, straight and a jean jogger." },
  { slug: "tops",           name: "Tops",             note: "Fine knit, pinstripe and a lace ruffle." },
  { slug: "co-ords",        name: "Co-ords",          note: "Two pieces, bought to be worn together." },
  { slug: "dresses",        name: "Dresses",          note: "Knit, with sheer sleeves." },
  { slug: "homeware",       name: "Homeware",         note: "Glazed ceramic, and things worth wrapping." },
] as const;

export type Category = (typeof categories)[number];

/** New in — the short list the home page rail carries.
 *
 *  ── 2026-09-22: derived, not typed ───────────────────────────────────────
 *  This was a hand-written list of nine, then thirteen, invented pieces:
 *  "Wide-leg wool trouser", "Tailored camel blazer", "Bias-cut silk slip
 *  dress". None of them existed. The rail on the home page — the most looked
 *  at thing on the site after the hero — was showing a customer a shop that
 *  was not there.
 *
 *  It now comes out of the stock list, so the rail can only ever carry pieces
 *  that are really on the rail, with their real names. `moreStock`, which
 *  held the other thirteen inventions, is deleted rather than emptied: there
 *  is one list of stock in this project now and it is lib/stocklist.ts.
 *
 *  Still no price here, and that rule is unchanged and still right: prices
 *  live in lib/catalogue.ts with the shop, thirteen colourways are still
 *  placeholders, and a second price list on the home page is exactly how the
 *  two quietly drift apart.
 *
 *  ── Which pieces, and why not simply the first nine ─────────────────────
 *  One per category first, in the order the rails run, then the rest of
 *  knitwear to fill out — so the rail reads as a cross-section of the shop
 *  rather than nine jumpers, which is what the first nine of the stock list
 *  would have given (knitwear is 13 of the 32). The order is deterministic:
 *  no randomness, because a rail that reshuffles on every build makes visual
 *  regression meaningless. */
const RAIL_CATEGORY_ORDER = [
  "Knitwear",
  "Coats & Jackets",
  "Trousers",
  "Tops",
  "Co-ords",
  "Dresses",
  "Homeware",
] as const;

export const newIn = (() => {
  const seen = new Set<string>();
  const out: {
    slug: string; name: string; category: string; tone: string; photo: string;
    /* In PENCE, and `priced` says whether it may be shown. The rail used to
       carry no price at all, on the reasoning that prices lived in the
       catalogue and a second list would drift. The data no longer drifts —
       both come from lib/stocklist.ts — and the client is right that a
       clothing shop's New In rail without prices is not a shop window.
       `priced` is false while any colourway is a placeholder, and the card
       then says so rather than printing a number nobody has agreed. */
    priceP: number; priced: boolean;
  }[] = [];
  const push = (p: (typeof stocklist)[number]) => {
    if (seen.has(p.slug)) return;
    seen.add(p.slug);
    out.push({
      slug: p.slug,
      name: p.name,
      category: p.category,
      /* The designed fallback underneath the photograph, by category. It is a
         texture rather than a picture of the garment; see lib/catalogue.ts. */
      tone:
        p.category === "Coats & Jackets" || p.category === "Dresses"
          ? "onyx"
          : p.category === "Homeware"
            ? "gold"
            : p.category === "Trousers" || p.category === "Co-ords"
              ? "marble"
              : "bone",
      photo: p.colourways[0].image,
      priceP: p.colourways[0].priceP,
      priced: p.colourways.every((c) => c.priceConfirmed),
    });
  };
  for (const cat of RAIL_CATEGORY_ORDER) {
    const first = stocklist.find((p) => p.category === cat);
    if (first) push(first);
  }
  for (const p of stocklist) {
    if (out.length >= 10) break;
    push(p);
  }
  return out;
})();



/** The five featured category panels.
 *
 *  A subset of `categories` above rather than a second taxonomy — `slug` is
 *  the join, so a rename in one place cannot leave the two disagreeing. Only
 *  what the panels add lives here: the photograph, its alt text and the
 *  displayed number.
 *
 *  ── `href`, and a comment that was wrong for a fortnight ──────────────────
 *  This used to read: *"`href` was "#visit" for all five while no category
 *  route existed. There is one now — /clothing/<slug> — and CategoryGrid
 *  links to it directly, so these hrefs are unused by the rails."*
 *
 *  The last clause was false. `CategoryGrid` does build its own
 *  `/clothing/${slug}` link and ignores this field — but `HorizontalRails`,
 *  the "Shop by category" rail on the home page, renders
 *  `<a href={c.href}>`. So every category card on the home page pointed at
 *  "#visit" and scrolled the reader to the address block instead of opening
 *  the category. The client reported it; a route crawl found it because the
 *  bare fragment stood out against the project's own /#section rule.
 *
 *  The lesson worth keeping: "this field is unused" is a claim about the
 *  whole codebase, and it went stale the moment a second consumer appeared.
 *  These now carry real targets, so a future consumer inherits a correct
 *  value rather than a decorative one.
 *
 *  Accessories points at /accessories, NOT /clothing/accessories, which is a
 *  404: `clothingCards` in lib/pages.ts deliberately excludes it, because a
 *  clothing page that lists handbags is not a clothing page.
 *
 *  The images are the final approved assets: real WebP, 2048x2731, 3:4,
 *  full colour at source. The monochrome resting state is a CSS filter, never
 *  baked into the file.
 *
 *  ── Provenance ────────────────────────────────────────────────────────────
 *  Regenerated 2026-09-02 from 3456x4608 masters, because the first set was
 *  produced at the model's `basic` quality floor and went soft on desktop,
 *  where the card asks for ~900 device pixels of a 3:4 frame. Note what was
 *  NOT the cause: the old files sat at 0.03-0.12 bytes/px, which looks like
 *  brutal compression but is simply what a grey seamless backdrop and flat black
 *  cloth cost to encode. Re-encoding soft pixels harder would have changed
 *  nothing; the source had to be regenerated.
 *
 *    jackets      faf1f70e-5273-4f69-b6a1-c0d4a6e92d6c
 *    trousers     02371941-6555-4380-8303-25f04a6de673
 *    dresses      eb49b432-29b5-4ee0-8c9e-2ec37d0bab6d
 *    knitwear     f9696429-d9f2-43ca-a44a-e843e2a46722
 *    accessories  e8444812-3e46-487f-bfa3-9a2754ed9455
 *
 *  The PNG masters are not in the working tree — at 14-21MB each they are
 *  recoverable from commits b9a5f22, e1b8b2e and 06867fa rather than carried.
 *  Jackets and accessories are cropped in from those masters: the re-run came
 *  back framed wider than the approved composition, and the crop restores it. */
export const featured = [
  {
    slug: "jackets",
    number: "01",
    name: "Jackets",
    image: "/img/category-jackets.webp",
    alt: "Model wearing a structured black jacket",
    href: "/clothing/coats-jackets", /* was the retired /clothing/jackets, which only reached here through a redirect */
  },
  {
    slug: "trousers",
    number: "02",
    name: "Trousers",
    image: "/img/category-trousers.webp",
    alt: "Model wearing tailored black trousers",
    href: "/clothing/trousers",
  },
  {
    slug: "dresses",
    number: "03",
    name: "Dresses",
    image: "/img/category-dresses.webp",
    alt: "Model wearing a black midi dress",
    href: "/clothing/dresses",
  },
  {
    slug: "knitwear",
    number: "04",
    name: "Knitwear",
    image: "/img/category-knitwear.webp",
    alt: "Model wearing charcoal knitwear",
    href: "/clothing/knitwear",
  },
  /* Was Accessories until 2026-09-22, at the client's request: no
     accessories are sold online (the /accessories page says so itself), so a
     home-page card leading there promised a rail with nothing on it. Its
     photograph was also a generated black handbag that reads as a Hermès
     Birkin — an implied luxury-brand stockist on a shop that has confirmed it
     carries no big labels.

     The image is HER photograph of a real piece, the Tomato Vase, not
     generated artwork: a card for a category of three objects should show
     one of the three. */
  {
    slug: "homeware",
    number: "05",
    name: "Homeware",
    image: "/img/product/bb-vase-tomato-1280.webp",
    alt: "The Tomato Vase, a red ceramic vase covered in tomatoes, on a plaster plinth",
    href: "/homeware",
    /* Her photographs are SQUARE; the other cards' are 3:4. object-fit:
       cover in a ~0.6-wide card scales a square by HEIGHT, so it needs a
       source as wide as the card is tall. Measured with the rail's default
       sizes: 640px delivered where a 547px-tall card at DPR 2 needs 1,094 —
       visibly soft. 40vw covers 1024-1920, 120vw a phone. */
    sizes: "(min-width: 1024px) 40vw, 120vw",
  },
] as const;
