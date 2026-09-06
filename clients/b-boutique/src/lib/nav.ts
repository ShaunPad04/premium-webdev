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
 *  This is a single-route site: src/app/page.tsx is the only page. Items
 *  marked `pending` have no dedicated route yet and point at the section
 *  where that content currently lives, so every link works today. Give them a
 *  real route and change one href each.
 */
export const MENU: MenuItem[] = [
  { n: "01", label: "Womenswear", href: "#rails", pending: true },
  { n: "02", label: "Accessories", href: "#rails", pending: true },
  { n: "03", label: "Homeware", href: "#homeware" },
  { n: "04", label: "New Arrivals", href: "#new-in" },
  { n: "05", label: "The Boutique", href: "#our-story" },
  { n: "06", label: "Visit Us", href: "#visit" },
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
 *  Every href here resolves today. This project is a single route —
 *  src/app/page.tsx — so the site's navigation is section anchors, and a
 *  footer column of /privacy, /terms and /cookies would be three links to
 *  404s. They are omitted until those pages exist rather than linked and
 *  broken.
 *
 *  "Contact" is omitted for the same reason: shop.phone and shop.email are
 *  deliberately empty, so there is nothing to link to. The FAQ answers the
 *  question and the Visit section carries the address. */
export const footerNav: { heading: string; items: MenuItem[] }[] = [
  {
    heading: "Shop",
    items: [
      { n: "", label: "New In", href: "#new-in" },
      { n: "", label: "Womenswear", href: "#rails", pending: true },
      { n: "", label: "Accessories", href: "#rails", pending: true },
      { n: "", label: "Homeware", href: "#homeware" },
    ],
  },
  {
    heading: "B Boutique",
    items: [
      { n: "", label: "The Boutique", href: "#our-story" },
      { n: "", label: "The Rails", href: "#rails" },
      /* #brands became a real anchor when the marquee was rebuilt; it was
         reachable from the header but not from here. */
      { n: "", label: "Brands", href: "#brands" },
      { n: "", label: "Questions", href: "#faq" },
      { n: "", label: "Visit Us", href: "#visit" },
    ],
  },
];

/** The hero's centre navigation.
 *
 *  Every href is an anchor that exists on this page — checked, not assumed.
 *  There are no product routes yet, so Clothing and Accessories both land on
 *  the rails, which is where both actually live. That is honest rather than
 *  lossy: the alternative is a 404 dressed as a category.
 *
 *  When real routes exist, change the href here and nothing else moves. */
export const PRIMARY = [
  { label: "New In", href: "#new-in" },
  { label: "Clothing", href: "#rails" },
  { label: "Accessories", href: "#rails" },
  { label: "Brands", href: "#brands" },
  { label: "About", href: "#our-story" },
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
