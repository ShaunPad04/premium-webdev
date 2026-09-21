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
  phone: "07305534342" as string,
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

/** The rails. These drive the expanding panels. */
export const categories = [
  { slug: "all",         name: "Shop All",    note: "Everything on the rails this week, in one place." },
  { slug: "jackets",     name: "Jackets",     note: "For a street that faces the sea." },
  { slug: "trousers",    name: "Trousers",    note: "Wide, tailored, and cut to actually fit." },
  { slug: "dresses",     name: "Dresses",     note: "Occasion, day, and the one you keep coming back to." },
  { slug: "tops",        name: "Tops",        note: "Silk, cotton and stripes that go with everything." },
  { slug: "knitwear",    name: "Knitwear",    note: "Lambswool, cotton, and proper weight." },
  /* Added 2026-09-06 at the client's request, with photography generated to
     match the existing shoot. Four more of the sections a womenswear boutique
     of this kind actually runs — they are ordinary shop categories rather than
     claims about stock, and no piece, price or brand is asserted under any of
     them. The line under each is written for the demo, in the same voice as
     the five above. */
  { slug: "coats",       name: "Coats",       note: "Wool, weight, and enough length to be worth it." },
  { slug: "shirts",      name: "Shirts",      note: "Cotton poplin, silk, and the good white one." },
  { slug: "skirts",      name: "Skirts",      note: "Midi, bias-cut, and made to move." },
  { slug: "denim",       name: "Denim",       note: "Straight, wide, and dark enough for evening." },
  { slug: "accessories", name: "Accessories", note: "Bags, scarves, and small gold things." },
  { slug: "homeware",    name: "Homeware",    note: "Candles, ceramics, and things worth wrapping." },
] as const;

export type Category = (typeof categories)[number];

/** New in — the short list the home page rail carries.
 *  No price here on purpose: prices live in lib/catalogue.ts, with the shop,
 *  and every one of them is invented. Keeping them out of this file keeps the
 *  rail from becoming a second, quietly diverging price list. */
export const newIn = [
  { slug: "wool-trouser",    name: "Wide-leg wool trouser",  category: "Trousers",    tone: "bone" },
  { slug: "camel-blazer",    name: "Tailored camel blazer",  category: "Jackets",     tone: "marble" },
  { slug: "lambswool-crew",  name: "Ribbed lambswool crew",  category: "Knitwear",    tone: "gold" },
  { slug: "cotton-tee",      name: "Heavyweight cotton tee", category: "Tops",        tone: "bone" },
  { slug: "slip-dress",      name: "Bias-cut silk slip dress", category: "Dresses",   tone: "onyx" },
  { slug: "leather-crossbody", name: "Leather crossbody",    category: "Accessories", tone: "marble" },
  { slug: "silk-scarf",      name: "Silk twill scarf",       category: "Accessories", tone: "gold" },
  { slug: "stoneware-carafe", name: "Stoneware carafe",      category: "Homeware",    tone: "onyx" },
  { slug: "boucle-overshirt", name: "Boucle overshirt",      category: "Jackets",     tone: "bone" },
  /* Four accessories added 2026-09-06, with photography generated to match the
     still lifes above. The accessories page held two pieces, which is not a
     range — it is what the project happened to contain. Names describe what is
     in the photograph and nothing else: no brand, no price, no size and no
     stock count, because none of those is known and every one is a claim. */
  { slug: "gold-hoops",      name: "Gold hoop earrings",   category: "Accessories", tone: "gold" },
  { slug: "leather-belt",    name: "Slim leather belt",    category: "Accessories", tone: "bone" },
  { slug: "lambswool-scarf", name: "Lambswool scarf",      category: "Accessories", tone: "bone" },
  { slug: "leather-tote",    name: "Structured tote",      category: "Accessories", tone: "marble" },
] as const;

/** The rest of the rails.
 *
 *  `newIn` above is what the home page's New In rail carries — a short list,
 *  deliberately, because that rail renders its set twice and every item is a
 *  photograph. This is everything else the shop sells, and the two together
 *  are the catalogue.
 *
 *  Added 2026-09-06 because four clothing categories had a card, a name and
 *  nothing behind them: a boutique with an empty Coats rail. Photography was
 *  generated to match; prices and sizes live in lib/catalogue.ts and every one
 *  of them is invented. Names describe the garment in the photograph and
 *  nothing more — no brand, no fabric weight, no origin, no care. */
export const moreStock = [
  { slug: "tapered-trouser",   name: "Tapered tailored trouser", category: "Trousers", tone: "onyx" },
  { slug: "charcoal-overcoat", name: "Charcoal wool overcoat",   category: "Coats",    tone: "marble" },
  { slug: "camel-wrap-coat",   name: "Camel wrap coat",          category: "Coats",    tone: "bone" },
  { slug: "poplin-shirt",      name: "Cotton poplin shirt",      category: "Shirts",   tone: "bone" },
  { slug: "silk-blouse",       name: "Silk blouse",              category: "Shirts",   tone: "gold" },
  { slug: "satin-skirt",       name: "Bias-cut satin skirt",     category: "Skirts",   tone: "onyx" },
  { slug: "pleated-skirt",     name: "Pleated wool skirt",       category: "Skirts",   tone: "marble" },
  { slug: "straight-jeans",    name: "Straight-leg jean",        category: "Denim",    tone: "onyx" },
  { slug: "wide-jeans",        name: "Wide-leg ecru jean",       category: "Denim",    tone: "bone" },
  { slug: "merino-rollneck",   name: "Merino roll-neck",         category: "Knitwear", tone: "onyx" },
  { slug: "burgundy-dress",    name: "Pleated silk midi dress",  category: "Dresses",  tone: "red" },
  { slug: "wool-blazer",       name: "Wool tailored blazer",     category: "Jackets",  tone: "marble" },
  { slug: "striped-top",       name: "Striped cotton top",       category: "Tops",     tone: "bone" },
] as const;


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
    href: "/clothing/jackets",
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
  {
    slug: "accessories",
    number: "05",
    name: "Accessories",
    image: "/img/category-accessories.webp",
    alt: "Model carrying a structured black handbag",
    href: "/accessories",
  },
] as const;
