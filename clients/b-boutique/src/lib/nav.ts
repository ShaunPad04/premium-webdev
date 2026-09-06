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
  { n: "01", label: "Womenswear", href: "/clothing" },
  { n: "02", label: "Accessories", href: "/accessories" },
  { n: "03", label: "Homeware", href: "/#homeware" },
  { n: "04", label: "New Arrivals", href: "/#new-in" },
  { n: "05", label: "The Boutique", href: "/about" },
  { n: "06", label: "Visit Us", href: "/#visit" },
  { n: "07", label: "Contact", href: "/contact" },
];

/** Social accounts.
 *
 *  Deliberately empty. No handles are held anywhere in this project, and a
 *  guessed URL on a real trading business's site sends customers to somebody
 *  else's account. The menu renders this row only when it has entries — add
 *  `{ name: "Instagram", href: "https://instagram.com/…" }` and it appears.
 */
export const socials: { name: string; href: string }[] = [];

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
 *  Every href here resolves today. A footer column of /privacy, /terms and
 *  /cookies would be three links to 404s, so those are omitted until the
 *  pages exist rather than linked and broken.
 *
 *  Contact appears now that there is a page and a confirmed phone number
 *  behind it. It was omitted for as long as there was nothing to link to. */
export const footerNav: { heading: string; items: MenuItem[] }[] = [
  {
    heading: "Shop",
    items: [
      { n: "", label: "New In", href: "/#new-in" },
      { n: "", label: "Clothing", href: "/clothing" },
      { n: "", label: "Accessories", href: "/accessories" },
      { n: "", label: "Homeware", href: "/#homeware" },
    ],
  },
  {
    heading: "B Boutique",
    items: [
      { n: "", label: "About us", href: "/about" },
      { n: "", label: "The Rails", href: "/#rails" },
      /* #brands became a real anchor when the marquee was rebuilt; it was
         reachable from the header but not from here. */
      { n: "", label: "Brands", href: "/#brands" },
      { n: "", label: "Questions", href: "/#faq" },
      { n: "", label: "Visit Us", href: "/#visit" },
      { n: "", label: "Contact", href: "/contact" },
    ],
  },
];

/** The hero's centre navigation.
 *
 *  Clothing and Accessories now go to their own pages rather than both
 *  landing on the home page's rails, which is what they promised and did not
 *  deliver. Contact is new and has a page and a phone number behind it.
 *
 *  Nothing was taken out. Brands still points at the home page's brand rail,
 *  which is where the logos are; it is "/#brands" rather than "#brands" for
 *  the reason given above MENU — the header is on five routes now. */
/** What hangs under a header item that has a menu.
 *
 *  Every href resolves to something that exists: the five slugs are the ids
 *  CategoryGrid puts on its cards, so each one lands on that category on
 *  /clothing rather than at the top of the page. There is no per-category
 *  route to point at — see the note in CategoryGrid about why the cards
 *  themselves are not links — so an anchor is the honest destination. */
export const CLOTHING_MENU = [
  { label: "Jackets", href: "/clothing#jackets" },
  { label: "Trousers", href: "/clothing#trousers" },
  { label: "Dresses", href: "/clothing#dresses" },
  { label: "Tops", href: "/clothing#tops" },
  { label: "Knitwear", href: "/clothing#knitwear" },
  { label: "Coats", href: "/clothing#coats" },
  { label: "Shirts", href: "/clothing#shirts" },
  { label: "Skirts", href: "/clothing#skirts" },
  { label: "Denim", href: "/clothing#denim" },
  { label: "View all clothing", href: "/clothing" },
] as const;

export const PRIMARY = [
  { label: "New In", href: "/#new-in" },
  { label: "Clothing", href: "/clothing", menu: CLOTHING_MENU },
  { label: "Accessories", href: "/accessories" },
  { label: "Brands", href: "/#brands" },
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
