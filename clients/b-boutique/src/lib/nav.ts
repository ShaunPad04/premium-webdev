import { clothingCards } from "./pages";
import { shop } from "./shop";

export type MenuItem = {
  n: string;
  label: string;
  href: string;
  /** True when this still needs a dedicated page; it currently resolves to
   *  the nearest real section so the link is never broken. */
  pending?: boolean;
};

/** Menu destinations.
 *
 *  ── Why every anchor here starts with a slash ─────────────────────────────
 *  This stopped being a single-route site on 2026-09-06: /clothing,
 *  /accessories, /about and /contact are real pages now. The header, the
 *  corner menu and the footer are on all five routes, so a bare "#rails"
 *  would have meant "a section of whatever page you are already on" — which
 *  is nothing at all on four of them.
 *
 *  "/#rails" is right on every route, including the home page itself: when
 *  the path and query already match, the browser treats it as an ordinary
 *  same-document fragment link and simply scrolls. Nothing special is needed
 *  for it, and nothing intercepts it — Lenis is initialised without anchor
 *  handling, so anchor scrolling is the browser's.
 *
 *  `pending` is gone from Womenswear and Accessories: both now have a page.
 */
export const MENU: MenuItem[] = [
  { n: "01", label: "Shop", href: "/shop" },
  { n: "02", label: "Womenswear", href: "/clothing" },
  { n: "03", label: "Accessories", href: "/accessories" },
  { n: "04", label: "Homeware", href: "/homeware" },
  { n: "05", label: "New Arrivals", href: "/#new-in" },
  { n: "06", label: "The Boutique", href: "/about" },
  { n: "07", label: "Visit Us", href: "/#visit" },
  { n: "08", label: "Contact", href: "/contact" },
];

/** Social accounts.
 *
 *  ── SUPPLIED BY THE CLIENT 2026-09-21 ────────────────────────────────────
 *  Both URLs were given directly, in chat, and are pasted verbatim — query
 *  strings included. `?hl=en` and `?locale=en_GB` are the platforms' own
 *  language hints; they are harmless, they are what the client handed over,
 *  and a client-supplied URL is not tidied up on a guess about what is
 *  safe to drop.
 *
 *  Note the Facebook URL carries her own name. That is the account as it
 *  exists, not something composed here.
 *
 *  This array was deliberately empty until now, and the reason is worth
 *  keeping: a guessed handle on a real trading business's site is not a
 *  placeholder, it is a link sending her customers to a stranger's page —
 *  and `bboutiquecleethorpes` was a "plausible" guess that happened to be
 *  right, which is exactly why guessing is not a method. It was waited for.
 *
 *  The footer and the corner menu both render this array only when it has
 *  entries, so nothing else needed changing to turn the row on.
 *
 *  `name` must stay exactly "Instagram" or "Facebook" — the footer matches on
 *  it to choose the logo, and falls back to the plain name for anything else.
 */
export type Social = { name: "Instagram" | "Facebook" | (string & {}); href: string };

export const socials: Social[] = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/bboutiquecleethorpes/?hl=en",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/p/B-Boutique-Cleethorpes-Hayley-Brown-100091972337800/?locale=en_GB",
  },
];

/** The address as Google Maps wants it. One definition: the Visit section,
 *  the footer map and the directions link all read this, so the pin can never
 *  disagree with the address printed beside it. */
export const mapsQuery = encodeURIComponent(
  `${shop.name}, ${shop.street}, ${shop.town} ${shop.postcode}`,
);

/** Real directions link, built from the real address. Not a placeholder.
 *  Deliberately the address rather than the coordinates: this one is read by a
 *  person, and "18 Sea View Street" is a destination they can check, where a
 *  decimal pair is not. */
export const directionsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

/** The embedded map, pinned to the shop's own point rather than searched for
 *  by name. B Boutique is new and may not be listed yet — the client's own
 *  link was to the street address, not to a business — so a name search could
 *  land anywhere. A lat/lng pin cannot. */
export const mapEmbedSrc = `https://www.google.com/maps?q=${shop.lat},${shop.lng}&z=17&output=embed`;

/** Footer navigation.
 *
 *  Every href here resolves today, which is the whole rule: a link is added
 *  when its page exists and not before. Delivery, Returns, Terms of sale and
 *  Privacy were all omitted for exactly that reason and all four are here now
 *  that they are built. /cookies still is not, because this site sets no
 *  cookies — see the privacy page, which says so and names the check.
 *
 *  Contact appears now that there is a page and a confirmed phone number
 *  behind it. It was omitted for as long as there was nothing to link to. */
export const footerNav: { heading: string; items: MenuItem[] }[] = [
  {
    heading: "Shop",
    items: [
      { n: "", label: "Shop all", href: "/shop" },
      { n: "", label: "New In", href: "/#new-in" },
      { n: "", label: "Clothing", href: "/clothing" },
      { n: "", label: "Accessories", href: "/accessories" },
      { n: "", label: "Homeware", href: "/homeware" },
    ],
  },
  {
    heading: "B Boutique",
    items: [
      { n: "", label: "About us", href: "/about" },
      { n: "", label: "The Rails", href: "/#rails" },
      { n: "", label: "Questions", href: "/#faq" },
      { n: "", label: "Visit Us", href: "/#visit" },
      { n: "", label: "Contact", href: "/contact" },
    ],
  },
  /* Added 2026-09-08 with the pages themselves. A shop selling at a distance
     has to make its delivery and returns terms available BEFORE the customer
     is bound — a link in the footer, on every page including the bag, is the
     ordinary way that is done. They are not buried in small print at the
     bottom of the meta row for the same reason. */
  {
    heading: "Buying online",
    items: [
      { n: "", label: "Delivery", href: "/delivery" },
      { n: "", label: "Returns", href: "/returns" },
      { n: "", label: "Terms of sale", href: "/terms" },
      { n: "", label: "Privacy", href: "/privacy" },
    ],
  },
];

/** The hero's centre navigation.
 *
 *  Clothing and Accessories now go to their own pages rather than both
 *  landing on the home page's rails, which is what they promised and did not
 *  deliver. Contact is new and has a page and a phone number behind it.
 *
 *  BRANDS WAS REMOVED on 2026-09-21, from here and from the corner menu.
 *  It pointed at the home page's logo band, and the shop does not stock
 *  those labels — see lib/statements.ts. A menu entry reading "Brands" that
 *  lands on a band naming none is a broken promise in the navigation, so the
 *  entry went with the logos rather than being repointed at nothing. */
/** What hangs under a header item that has a menu.
 *
 *  ── DERIVED, after this list 404'd five of its own entries ──────────────
 *  This was hand-written, and on 2026-09-22 the category taxonomy changed
 *  with the arrival of the client's real stock. Jackets, Coats, Shirts,
 *  Skirts and Denim stopped existing. The list did not change with them, so
 *  the header's Clothing menu offered five links that every one returned a
 *  404 — the single worst kind of broken, because it is in the primary
 *  navigation of every page on the site and it looks deliberate.
 *
 *  It now comes out of `clothingCards`, which comes out of `categories` in
 *  shop.ts, which is checked against the catalogue at build. A category
 *  cannot be in this menu unless it exists AND has stock behind it, and
 *  nobody has to remember to edit two files. */
export const CLOTHING_MENU = [
  ...clothingCards.map((c) => ({ label: c.name, href: `/clothing/${c.slug}` })),
  { label: "View all clothing", href: "/clothing" },
];

export const PRIMARY = [
  { label: "Shop", href: "/shop" },
  { label: "New In", href: "/#new-in" },
  { label: "Clothing", href: "/clothing", menu: CLOTHING_MENU },
  { label: "Accessories", href: "/accessories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

/** The three things the shop sells.
 *
 *  Was the hero's left micro navigation until 2026-09-06, when the client
 *  asked for the labels to come off the photograph. Nothing reads this today.
 *  It is kept rather than deleted because it is the list, not the layout, and
 *  restoring the hero labels — or building a category strip somewhere else —
 *  should not mean rewriting it from memory. */
export const HERO_CATEGORIES = [
  { label: "Womenswear", href: "#rails" },
  { label: "Accessories", href: "#rails" },
  { label: "Homeware", href: "#homeware" },
] as const;
