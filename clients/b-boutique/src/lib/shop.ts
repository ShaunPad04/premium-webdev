/** Single source of truth for B Boutique. Everything on the site — the
 *  "open now" badge, the hours table, the schema.org markup — reads from here.
 *  Change it once, it changes everywhere. */

export const shop = {
  name: "B Boutique",
  /* ── PHONE: CONFIRMED BY THE CLIENT 2026-09-06 ────────────────────────
     Given by the client directly, in their own words, in chat. It is the
     number the contact page, the corner menu and the footer all print, and
     the only contact channel the site currently has.

     EMAIL IS STILL EMPTY, and that is deliberate rather than an oversight.
     Nobody has supplied one, so nothing on the site prints an address and
     the contact form has no destination configured — see app/api/contact.
     Fill this in and the form gains a target; leave it and the form says so
     honestly rather than pretending to send.

     Never guess either value. A wrong number on a real shop's site sends
     customers to a stranger. */
  phone: "07305534342" as string,
  email: "" as string,
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

/** 0 = Sunday, matching Date.getDay(). null = closed. Times are 24h local. */
export type Hours = { open: number; close: number } | null;

export const hours: readonly { day: string; short: string; hours: Hours }[] = [
  { day: "Monday",    short: "Mon", hours: null },
  { day: "Tuesday",   short: "Tue", hours: { open: 10, close: 16 } },
  { day: "Wednesday", short: "Wed", hours: { open: 10, close: 16 } },
  { day: "Thursday",  short: "Thu", hours: { open: 10, close: 16 } },
  { day: "Friday",    short: "Fri", hours: { open: 10, close: 16 } },
  { day: "Saturday",  short: "Sat", hours: { open: 10, close: 16 } },
  { day: "Sunday",    short: "Sun", hours: { open: 10, close: 16 } },
];

/** 12-hour display for the hours table. Kept: Visit prints every row. */
export function formatHour(h: number): string {
  const suffix = h < 12 ? "am" : "pm";
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return `${twelve}${suffix}`;
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
 *  `href` was "#visit" for all five while no category route existed. There is
 *  one now — /clothing/<slug> — and CategoryGrid links to it directly, so
 *  these hrefs are unused by the rails. Left in place rather than deleted:
 *  the field is part of the shape, and a future consumer will want it.
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
    href: "#visit",
  },
  {
    slug: "trousers",
    number: "02",
    name: "Trousers",
    image: "/img/category-trousers.webp",
    alt: "Model wearing tailored black trousers",
    href: "#visit",
  },
  {
    slug: "dresses",
    number: "03",
    name: "Dresses",
    image: "/img/category-dresses.webp",
    alt: "Model wearing a black midi dress",
    href: "#visit",
  },
  {
    slug: "knitwear",
    number: "04",
    name: "Knitwear",
    image: "/img/category-knitwear.webp",
    alt: "Model wearing charcoal knitwear",
    href: "#visit",
  },
  {
    slug: "accessories",
    number: "05",
    name: "Accessories",
    image: "/img/category-accessories.webp",
    alt: "Model carrying a structured black handbag",
    href: "#visit",
  },
] as const;
