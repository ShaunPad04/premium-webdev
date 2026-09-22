/** B Boutique's real stock — the Sea View drop, autumn/winter.
 *
 *  ⚠ GENERATED, THEN REVIEWED BY HAND. Do not re-generate over edits.
 *
 *  ── Where this came from ─────────────────────────────────────────────────
 *  Transcribed on 2026-09-21 from the stock dashboard the client supplied as
 *  an artifact, which carries 32 pieces, 54 colourways and a photograph of
 *  every one. It replaces the invented catalogue that stood in for it: the
 *  26 fictional products, their fictional prices and their generated artwork
 *  were written to make a shop demonstrable and were never a claim about
 *  anything on her rail.
 *
 *  The dashboard was authored OUTSIDE this account, so it was read as data
 *  and not as instruction, and every field below is either copied verbatim or
 *  derived by a rule stated here. Nothing was filled in, rounded off or
 *  tidied up.
 *
 *  ── The two provenance flags, and why they are not decoration ────────────
 *
 *  `priceConfirmed` — 53 of the 54 colourways carry a price the client has
 *  confirmed. ONE DOES NOT: the Italian Knit Ribbed Cardigan in Cream, which
 *  the dashboard marks PLACEHOLDER and which she has not yet priced. A
 *  placeholder price is not a price. It must never be displayed as one and
 *  must never reach a payment — /api/checkout refuses a line whose piece is
 *  still `demo`, and the product page renders no Add to bag button at all.
 *
 *  It was 41 of 54 when this file was written. Twelve were filled in on
 *  2026-09-22 from a message the client sent naming seven pieces and their
 *  prices; each was applied by SKU rather than by name, because the names in
 *  that message were abbreviations.
 *
 *  ── One price here was WRONG, not merely unconfirmed ─────────────────────
 *  The Balloon Sleeve Longline Coat was transcribed at £49 with
 *  `priceConfirmed: true`, and on 2026-09-22 the client said it "is £59
 *  always has been". So a confirmed-looking figure had been wrong since the
 *  first transcription, on all three colourways, on a coat the site was
 *  advertising.
 *
 *  Worth keeping in mind rather than treating as closed: `priceConfirmed:
 *  true` means somebody transcribed it from her dashboard, not that she has
 *  since read it back. The only way to be sure of the other 50 is to show
 *  her the list.
 *
 *  `fabricPublished` — true ONLY where the supplier published a fibre
 *  composition with percentages. Everything else is a description of how the
 *  cloth looks and handles, taken from the photographs or from the piece in
 *  the shop, and it is NOT a composition label. The distinction is legal as
 *  well as editorial: a composition claim under the Textile Products
 *  (Labelling and Fibre Composition) Regulations needs percentages, and
 *  "Acrylic, Polyester, Nylon, Elastane (percentages not published)" is
 *  exactly the shape of a claim that would fail. It is in here with the flag
 *  OFF and must render as description, never as a label.
 *
 *  ── What is deliberately NOT in this file ────────────────────────────────
 *  Stock counts. The dashboard carries a count for 35 colourways, but it
 *  counts the COLOURWAY, not the variant — "Black = 5" across a run of five
 *  sizes does not say one of each, and splitting it would be inventing the
 *  split. Counts live in the database, are entered per variant on /stock, and
 *  the only ones that can be imported without guessing are recorded in
 *  scripts/import-stock.mjs with the rule that made each one safe.
 */

export type StockColourway = {
  /** B Boutique's own code. Stable, and the key photography is named after. */
  sku: string;
  /** The supplier's reference, where there is one. */
  supplierRef: string;
  /** The supplier's own colour name. Never read off a photograph. */
  colour: string;
  /** In PENCE. Integer. Never a float, never pounds. */
  priceP: number;
  /** False while the dashboard still marks this price PLACEHOLDER. */
  priceConfirmed: boolean;
  /** Basename in /img/product, without extension. */
  image: string;
};

export type StockPiece = {
  slug: string;
  name: string;
  category: string;
  /** One line for a card. */
  short: string;
  /** The paragraph on the product page. */
  full: string;
  features: readonly string[];
  /** A fibre composition when fabricPublished, otherwise a description. */
  fabric: string;
  fabricPublished: boolean;
  care: string;
  /** The run as separate sizes. "One size" is a run of one. */
  sizes: readonly string[];
  /** "fits up to 14", "2 of each" — the qualifier, kept apart from the run. */
  sizeNote: string;
  supplier: string;
  supplierCode: string;
  colourways: readonly StockColourway[];
};

export const stocklist: readonly StockPiece[] = [
  {
    slug: "fair-isle-jumper",
    name: "Fair Isle Jumper",
    category: "Knitwear",
    short: "A proper winter jumper with a traditional diamond yoke.",
    full: "The Fair Isle pattern across the yoke is knitted in, not printed, so it keeps its definition wash after wash. Cut oversized through the body with ribbed cuffs and hem to hold the shape. Warm enough to be the whole outfit on a cold day.",
    features: ["Knitted-in Fair Isle yoke", "Oversized relaxed fit", "Ribbed cuffs and hem", "Crew neck"],
    fabric: "Soft knit with a knitted-in jacquard yoke",
    fabricPublished: false,
    care: "Hand wash cold. Do not tumble dry. Dry flat.",
    sizes: ["S-M", "M-L"],
    sizeNote: "",
    supplier: "Babez London",
    supplierCode: "10074",
    colourways: [
      { sku: "BB-FAIRISLE-BEI", supplierRef: "10074-BEI", colour: "Beige", priceP: 4500, priceConfirmed: true, image: "bb-fairisle-bei" },
      { sku: "BB-FAIRISLE-BRN", supplierRef: "10074-BRN", colour: "Brown", priceP: 4500, priceConfirmed: true, image: "bb-fairisle-brn" },
    ],
  },
  {
    slug: "faux-feather-sleeveless-jumper",
    name: "Faux Feather Sleeveless Jumper",
    category: "Knitwear",
    short: "All the texture, none of the sleeves.",
    full: "A sleeveless knit with a shaggy faux-feather finish and a ragged fringed hem — the sort of piece that turns a plain pair of trousers into an outfit. Plain crew neckline keeps it wearable rather than fussy.",
    features: ["Shaggy faux-feather texture", "Ragged fringe hem", "Sleeveless", "Crew neck"],
    fabric: "75% Viscose, 25% Polyester",
    fabricPublished: true,
    care: "Hand wash cold. Do not tumble dry. Dry flat. Cool iron.",
    sizes: ["One size"],
    sizeNote: "fits up to 14",
    supplier: "Babez London",
    supplierCode: "BZ5734",
    colourways: [
      { sku: "BB-FAUXFEATHER-BLK", supplierRef: "BZ5734-BLK", colour: "Black", priceP: 4000, priceConfirmed: true, image: "bb-fauxfeather-blk" },
      { sku: "BB-FAUXFEATHER-BEI", supplierRef: "BZ5734-BEI", colour: "Beige", priceP: 4000, priceConfirmed: true, image: "bb-fauxfeather-bei" },
    ],
  },
  {
    slug: "paisley-fringe-belted-cardigan-vest",
    name: "Paisley Fringe Belted Cardigan Vest",
    category: "Knitwear",
    short: "A bandana-print vest with fringing down the front and a tie waist.",
    full: "Sleeveless, so it layers over a long-sleeve top or a shirt right through the season. The paisley bandana pattern runs across the whole piece, with fringed edges down the front opening and along the hem, and a self-tie belt to pull in the waist.",
    features: ["Paisley bandana pattern", "Fringed front and hem", "Self-tie belt", "Sleeveless"],
    fabric: "50% Viscose, 50% Polyamide",
    fabricPublished: true,
    care: "Hand wash cold. Do not tumble dry. Dry flat. Cool iron.",
    sizes: ["One size"],
    sizeNote: "fits up to 14",
    supplier: "Babez London",
    supplierCode: "M1264",
    colourways: [
      { sku: "BB-PAISLEYVEST-BUR", supplierRef: "M1264-BUR", colour: "Burgundy", priceP: 4900, priceConfirmed: true, image: "bb-paisleyvest-bur" },
      { sku: "BB-PAISLEYVEST-BRN", supplierRef: "M1264-BRN", colour: "Brown", priceP: 4900, priceConfirmed: true, image: "bb-paisleyvest-brn" },
    ],
  },
  {
    slug: "fine-knit-jumper-with-asymmetric-hem",
    name: "Fine Knit Jumper With Asymmetric Hem",
    category: "Knitwear",
    short: "A soft fine knit cut on a diagonal.",
    full: "The hem drops lower on one side, which does the work of making a simple jumper look considered. Wide relaxed sleeves and a boat neckline keep it soft rather than structured — good over anything with a straight leg.",
    features: ["Asymmetric diagonal hem", "Wide relaxed sleeves", "Boat neckline", "Fine soft knit"],
    fabric: "50% Recycled Polyester, 29% Polyester, 17% Polyamide, 4% Elastane",
    fabricPublished: true,
    care: "Machine wash 30°C, gentle cycle. Do not bleach. Cool iron.",
    sizes: ["One size"],
    sizeNote: "fits up to 14",
    supplier: "Babez London",
    supplierCode: "",
    colourways: [
      { sku: "BB-ASYMJMP-BRN", supplierRef: "", colour: "Brown", priceP: 3800, priceConfirmed: true, image: "bb-asymjmp-brn" },
      { sku: "BB-ASYMJMP-TAU", supplierRef: "", colour: "Taupe", priceP: 3800, priceConfirmed: true, image: "bb-asymjmp-tau" },
    ],
  },
  {
    slug: "lace-blouse-with-layered-ruffle",
    name: "Lace Blouse With Layered Ruffle",
    category: "Tops",
    short: "Sheer lace with tiered organza ruffles over the shoulders.",
    full: "The dressiest thing in the range. Sheer lace body and sleeves with layered organza ruffles sitting across the shoulders, finished with a high neck. Tucked into a midi skirt or tailored trousers it goes straight out in the evening.",
    features: ["Sheer lace body and sleeves", "Tiered organza shoulder ruffles", "High neck", "Long sleeves"],
    fabric: "95% Polyester, 5% Elastane",
    fabricPublished: true,
    care: "Machine wash cold, gentle cycle. Do not bleach. Cool iron.",
    sizes: ["One size"],
    sizeNote: "fits up to 14",
    supplier: "Babez London",
    supplierCode: "MC2853",
    colourways: [
      { sku: "BB-LACEBLOUSE-BUR", supplierRef: "MC2853-BUR", colour: "Burgundy", priceP: 4200, priceConfirmed: true, image: "bb-laceblouse-bur" },
      { sku: "BB-LACEBLOUSE-BRN", supplierRef: "MC2853-BRN", colour: "Brown", priceP: 4200, priceConfirmed: true, image: "bb-laceblouse-brn" },
    ],
  },
  {
    slug: "zebra-print-balloon-leg-jeans",
    name: "Zebra Print Balloon Leg Jeans",
    category: "Trousers",
    short: "Black and cream zebra print on a balloon leg.",
    full: "A statement trouser that does all the talking — wear them with a plain fitted top and nothing else competing. High waisted with a zip and button fastening, and a balloon leg that curves out through the thigh and back in at the ankle.",
    features: ["Black and cream zebra print", "Balloon leg shape", "High waisted", "Zip and button fastening"],
    fabric: "98% Cotton, 2% Elastane",
    fabricPublished: true,
    care: "Machine wash 30°C. Wash dark colours separately. Do not tumble dry.",
    sizes: ["One size"],
    sizeNote: "fits up to 14",
    supplier: "Babez London",
    supplierCode: "Y3582",
    colourways: [
      { sku: "BB-ZEBRAJEAN-ZEB", supplierRef: "Y3582-ZEB", colour: "Zebra Print", priceP: 5400, priceConfirmed: true, image: "bb-zebrajean-zeb" },
    ],
  },
  {
    slug: "striped-fuzzy-zip-up-jumper",
    name: "Striped Fuzzy Zip Up Jumper",
    category: "Knitwear",
    short: "Brushed stripes and a full-length zip.",
    full: "A soft mohair-like knit with horizontal tonal stripes running across the body and sleeves. Funnel neck and a full zip up the front, so it works open over a top or zipped right up on a cold morning.",
    features: ["Brushed fuzzy stripe knit", "Full-length front zip", "Funnel neck", "Relaxed fit"],
    fabric: "55% Recycled Polyester, 21% Polyester, 13% Nylon, 8% Wool, 3% Spandex",
    fabricPublished: true,
    care: "Hand wash cold or wool cycle. Dry flat. Do not tumble dry.",
    sizes: ["One size"],
    sizeNote: "fits up to 14",
    supplier: "Babez London",
    supplierCode: "9263",
    colourways: [
      { sku: "BB-STRIPEZIP-TAU", supplierRef: "9263-TAU", colour: "Taupe", priceP: 4000, priceConfirmed: true, image: "bb-stripezip-tau" },
      { sku: "BB-STRIPEZIP-RED", supplierRef: "9263-RED", colour: "Red", priceP: 4000, priceConfirmed: true, image: "bb-stripezip-red" },
    ],
  },
  {
    slug: "plaid-check-hooded-jacket",
    name: "Plaid Check Hooded Jacket",
    category: "Coats & Jackets",
    short: "A padded check jacket with a hood.",
    full: "Quilted-look padding through the body and sleeves for real warmth, with the plaid check carried across the hood too. Zip front and side pockets — the jacket you actually reach for on the school run.",
    features: ["Plaid check throughout, hood included", "Padded quilted-look body", "Zip front", "Side pockets"],
    fabric: "Padded check outer with a quilted-look lining",
    fabricPublished: false,
    care: "Machine wash 30°C, gentle cycle. Do not tumble dry.",
    sizes: ["One size"],
    sizeNote: "fits up to 14",
    supplier: "Babez London",
    supplierCode: "2866",
    colourways: [
      { sku: "BB-PLAIDJKT-BEI", supplierRef: "2866-BEI", colour: "Beige", priceP: 4900, priceConfirmed: true, image: "bb-plaidjkt-bei" },
    ],
  },
  {
    slug: "balloon-sleeve-longline-coat",
    name: "Balloon Sleeve Longline Coat",
    category: "Coats & Jackets",
    short: "A longline coat with full balloon sleeves.",
    full: "Falls below the knee with a funnel neck and a button-through front. The balloon sleeves gather at the cuff, which is what lifts it above an ordinary winter coat. Cut generously enough to go over a jumper.",
    features: ["Longline, falls below the knee", "Full balloon sleeves gathered at the cuff", "Funnel neck", "Button-through front"],
    fabric: "Smooth woven coating fabric with a soft drape",
    fabricPublished: false,
    care: "Dry clean or machine wash 30°C, gentle cycle. Do not tumble dry.",
    sizes: ["One size"],
    sizeNote: "fits up to 14",
    supplier: "Babez London",
    supplierCode: "31344",
    colourways: [
      { sku: "BB-LONGTRENCH-BUR", supplierRef: "31344-BUR", colour: "Burgundy", priceP: 5900, priceConfirmed: true, image: "bb-longtrench-bur" },
      { sku: "BB-LONGTRENCH-BRN", supplierRef: "31344-BRN", colour: "Brown", priceP: 5900, priceConfirmed: true, image: "bb-longtrench-brn" },
      { sku: "BB-LONGTRENCH-CAM", supplierRef: "31344-CAM", colour: "Camel", priceP: 5900, priceConfirmed: true, image: "bb-longtrench-cam" },
    ],
  },
  {
    slug: "amour-half-zip-wool-jumper",
    name: "Amour Half Zip Wool Jumper",
    category: "Knitwear",
    short: "A half-zip with contrast collar and sleeve stripes.",
    full: "Navy wool body with a cream contrast collar and cuffs, stripes running down the sleeves and a small embroidered motif on the chest. The half-zip placket sits at the neck. A sporty shape in a grown-up fabric.",
    features: ["Contrast cream collar and cuffs", "Contrast stripes down the sleeves", "Half-zip placket", "Embroidered chest motif"],
    fabric: "50% Polyamide, 35% Viscose, 10% Wool, 5% Elastane",
    fabricPublished: true,
    care: "Hand wash cold or wool cycle. Dry flat. Do not tumble dry.",
    sizes: ["One size"],
    sizeNote: "fits up to 14",
    supplier: "Babez London",
    supplierCode: "M1211",
    colourways: [
      { sku: "BB-AMOURZIP-NAV", supplierRef: "M1211-NAV", colour: "Navy", priceP: 4500, priceConfirmed: true, image: "bb-amourzip-nav" },
    ],
  },
  {
    slug: "piping-detail-denim-jacket-trouser-set",
    name: "Piping Detail Denim Jacket & Trouser Set",
    category: "Co-ords",
    short: "A two-piece denim set with contrast white piping.",
    full: "Cropped jacket with a full-length zip and matching wide-leg drawstring trousers, with white piping running down the sleeves and along the trouser sides. Wear it together as a set or split the two across the rest of your wardrobe.",
    features: ["Sold as a two-piece set", "Contrast white piping", "Cropped zip-front jacket", "Wide-leg drawstring trousers"],
    fabric: "Cotton",
    fabricPublished: false,
    care: "Machine wash 30°C. Wash dark colours separately. Do not tumble dry.",
    sizes: ["One size"],
    sizeNote: "fits up to 14",
    supplier: "Babez London",
    supplierCode: "K2225 / K2226",
    colourways: [
      { sku: "BB-DENIMSET-DEN", supplierRef: "K2225-DEN", colour: "Denim Blue", priceP: 8500, priceConfirmed: true, image: "bb-denimset-den" },
    ],
  },
  {
    slug: "pleated-barrel-trouser",
    name: "Pleated Barrel Trouser",
    category: "Trousers",
    short: "A tailored trouser with a rounded barrel leg.",
    full: "High waisted with belt loops and a front pleat, cut with a barrel leg that curves out at the thigh and tapers back in at the ankle. Smart enough for work, easy enough for a Saturday.",
    features: ["Rounded barrel leg, tapered ankle", "Front pleat", "High waist with belt loops", "Tailored fabric"],
    fabric: "100% Polyester",
    fabricPublished: true,
    care: "Machine wash 30°C. Do not bleach. Cool iron.",
    sizes: ["S", "M", "L"],
    sizeNote: "",
    supplier: "Babez London",
    supplierCode: "",
    colourways: [
      { sku: "BB-BARREL-NAV", supplierRef: "", colour: "Navy", priceP: 4600, priceConfirmed: true, image: "bb-barrel-nav" },
      { sku: "BB-BARREL-BEI", supplierRef: "", colour: "Beige", priceP: 4600, priceConfirmed: true, image: "bb-barrel-bei" },
    ],
  },
  {
    slug: "jewelled-collar-cardigan",
    name: "Jewelled Collar Cardigan",
    category: "Knitwear",
    short: "A fine knit cardigan with a crystal-trimmed collar.",
    full: "Cropped and slightly boxy with a button-through front, and a band of clear and silver jewelled beading set all the way around the neckline. Plain from the back, quietly special from the front — throw it over a plain tee and you are dressed.",
    features: ["Jewelled crystal collar trim", "Cropped boxy shape", "Button-through front", "Fine knit"],
    fabric: "Fine knit with applied crystal beadwork at the collar",
    fabricPublished: false,
    care: "Hand wash cold. Do not tumble dry. Dry flat. Do not iron over the beading.",
    sizes: ["One size"],
    sizeNote: "",
    supplier: "BGF by Elvi",
    supplierCode: "6602",
    colourways: [
      { sku: "BB-JEWELCARD-BLK", supplierRef: "6602-BLK", colour: "Black", priceP: 4200, priceConfirmed: true, image: "bb-jewelcard-blk" },
      { sku: "BB-JEWELCARD-BUR", supplierRef: "6602-BUR", colour: "Burgundy", priceP: 4200, priceConfirmed: true, image: "bb-jewelcard-bur" },
      { sku: "BB-JEWELCARD-CRM", supplierRef: "6602-CRM", colour: "Cream", priceP: 4200, priceConfirmed: true, image: "bb-jewelcard-crm" },
    ],
  },
  {
    slug: "multi-jumper",
    name: "Multi Jumper",
    category: "Knitwear",
    short: "A chunky flecked knit in a proper winter weight.",
    full: "Open-weave boucle shot through with cream and copper flecks, so the colour shifts as you move. Crew neck, dropped shoulders and an oversized fit with a soft eyelash finish to the yarn.",
    features: ["Cream and copper flecked boucle", "Chunky open-weave knit", "Dropped shoulders, oversized", "Ribbed cuffs and hem"],
    fabric: "Chunky flecked boucle knit with an eyelash finish",
    fabricPublished: false,
    care: "Hand wash cold. Do not tumble dry. Dry flat.",
    sizes: ["One size"],
    sizeNote: "fits up to 14",
    supplier: "yui & me paris",
    supplierCode: "LM6321",
    colourways: [
      { sku: "BB-MULTIJMP-BRN", supplierRef: "LM6321-BRN", colour: "Brown", priceP: 2800, priceConfirmed: true, image: "bb-multijmp-brn" },
      { sku: "BB-MULTIJMP-GRN", supplierRef: "LM6321-GRN", colour: "Olive", priceP: 2800, priceConfirmed: true, image: "bb-multijmp-grn" },
    ],
  },
  {
    slug: "argyle-vest-t-shirt",
    name: "Argyle Vest & T-Shirt",
    category: "Tops",
    short: "Two pieces, one garment — argyle vest attached to a cream tee.",
    full: "The knitted V-neck vest and the cream short-sleeve t-shirt underneath are made as a single piece, so it always sits right and there is nothing to tuck or adjust. Large argyle diamonds across the chest with fine cross-hatch lines.",
    features: ["Vest and tee in one garment", "Large argyle diamond pattern", "Ribbed V-neck, armholes and hem", "Cream short-sleeve tee"],
    fabric: "Fine knit vest with an attached jersey tee",
    fabricPublished: false,
    care: "Machine wash 30°C, gentle cycle. Do not tumble dry.",
    sizes: ["One size"],
    sizeNote: "fits up to 14",
    supplier: "Babez London",
    supplierCode: "",
    colourways: [
      { sku: "BB-ARGYLEVEST-BRN", supplierRef: "", colour: "Brown", priceP: 3500, priceConfirmed: true, image: "bb-argylevest-brn" },
      { sku: "BB-ARGYLEVEST-BUR", supplierRef: "", colour: "Burgundy", priceP: 3500, priceConfirmed: true, image: "bb-argylevest-bur" },
    ],
  },
  {
    slug: "pinstripe-lined-top",
    name: "Pinstripe Lined Top",
    category: "Tops",
    short: "A fine knit with narrow cream pinstripes.",
    full: "Soft long-sleeve knit with cream stripes running vertically down the body and sleeves — the vertical line is quietly flattering in a way a horizontal stripe never is. Round neck, relaxed through the body.",
    features: ["Vertical cream pinstripes", "Fine soft knit", "Round neck", "Relaxed fit"],
    fabric: "Fine soft knit with a woven vertical stripe",
    fabricPublished: false,
    care: "Machine wash 30°C, gentle cycle. Cool iron.",
    sizes: ["One size"],
    sizeNote: "fits up to 14",
    supplier: "MBX",
    supplierCode: "M-5741 MBX",
    colourways: [
      { sku: "BB-LINEDTOP-BLK", supplierRef: "M-5741MBX-BLK", colour: "Black", priceP: 3500, priceConfirmed: true, image: "bb-linedtop-blk" },
      { sku: "BB-LINEDTOP-BUR", supplierRef: "M-5741MBX-BUR", colour: "Burgundy", priceP: 3500, priceConfirmed: true, image: "bb-linedtop-bur" },
      { sku: "BB-LINEDTOP-BRN", supplierRef: "M-5741MBX-BRN", colour: "Brown", priceP: 3500, priceConfirmed: true, image: "bb-linedtop-brn" },
    ],
  },
  {
    slug: "velour-lounge-set",
    name: "Velour Lounge Set",
    category: "Co-ords",
    short: "A two-piece velour set you will live in.",
    full: "Slouchy batwing sweatshirt with turned-back cuffs and matching tapered barrel-leg joggers with an elasticated waist and patch pockets. Soft plush velour with a faint faded sheen. Sold as a set.",
    features: ["Sold as a two-piece set", "Soft plush velour", "Batwing sweatshirt, turned-back cuffs", "Barrel-leg joggers, elasticated waist"],
    fabric: "Soft velour with a short plush pile",
    fabricPublished: false,
    care: "Machine wash 30°C inside out. Do not tumble dry. Do not iron the pile.",
    sizes: ["One size"],
    sizeNote: "fits up to 16",
    supplier: "",
    supplierCode: "",
    colourways: [
      { sku: "BB-SET-KHA", supplierRef: "", colour: "Khaki", priceP: 4500, priceConfirmed: true, image: "bb-set-kha" },
      { sku: "BB-SET-BUR", supplierRef: "", colour: "Burgundy", priceP: 4500, priceConfirmed: true, image: "bb-set-bur" },
      { sku: "BB-SET-CHO", supplierRef: "", colour: "Chocolate Brown", priceP: 4500, priceConfirmed: true, image: "bb-set-cho" },
    ],
  },
  {
    slug: "straight-leg-wide-trouser",
    name: "Straight Leg Wide Trouser",
    category: "Trousers",
    short: "A smooth tailored trouser with gold chain hardware at the waist.",
    full: "Matte scuba-style fabric that holds a sharp crease down each leg and drapes properly rather than clinging. High waisted with angled side pockets, and a short row of polished gold links set on each side of the front waistband.",
    features: ["Gold chain-link waist trim", "Sharp pressed front crease", "Angled side pockets", "Straight wide leg"],
    fabric: "Smooth matte scuba-style stretch fabric",
    fabricPublished: false,
    care: "Machine wash 30°C. Do not bleach. Cool iron. Avoid ironing the chain trim.",
    sizes: ["S-M", "M", "L", "XL", "XXL"],
    sizeNote: "",
    supplier: "",
    supplierCode: "",
    colourways: [
      { sku: "BB-STRAIGHT-BLK", supplierRef: "", colour: "Black", priceP: 2450, priceConfirmed: true, image: "bb-straight-blk" },
      { sku: "BB-STRAIGHT-BRN", supplierRef: "", colour: "Brown", priceP: 2450, priceConfirmed: true, image: "bb-straight-brn" },
    ],
  },
  {
    slug: "wide-leg-trouser",
    name: "Wide Leg Trouser",
    category: "Trousers",
    short: "A soft, generously cut wide leg with an elasticated waist.",
    full: "Smooth matte fabric with a fluid drape and a genuinely wide straight leg. Elasticated waistband, angled side pockets, no fastenings to fuss with — comfortable enough for a long day, smart enough not to look it.",
    features: ["Generously wide straight leg", "High elasticated waist", "Angled side pockets", "Fluid matte fabric"],
    fabric: "Smooth matte stretch fabric with a fluid drape",
    fabricPublished: false,
    care: "Machine wash 30°C. Do not bleach. Cool iron.",
    sizes: ["S", "M", "L", "XL"],
    sizeNote: "",
    supplier: "",
    supplierCode: "",
    colourways: [
      { sku: "BB-TROUSER-BEI", supplierRef: "", colour: "Beige", priceP: 2850, priceConfirmed: true, image: "bb-trouser-bei" },
      { sku: "BB-TROUSER-CHO", supplierRef: "", colour: "Chocolate Brown", priceP: 2850, priceConfirmed: true, image: "bb-trouser-cho" },
    ],
  },
  {
    slug: "sheer-sleeve-knit-dress",
    name: "Sheer Sleeve Knit Dress",
    category: "Dresses",
    short: "A fitted knit column dress with sheer-banded sleeves.",
    full: "Falls to mid-calf with a side split at the hem and a round ribbed neckline. The elbow-length flared sleeves are built from alternating solid knit and sheer mesh bands, with a matching sheer panel across each shoulder.",
    features: ["Sheer mesh sleeve bands", "Sheer shoulder panels", "Side split hem", "Fitted knit column shape"],
    fabric: "Fine knit with sheer mesh panelling",
    fabricPublished: false,
    care: "Hand wash cold. Do not tumble dry. Dry flat. Cool iron.",
    sizes: ["One size"],
    sizeNote: "fits up to 12",
    supplier: "",
    supplierCode: "B-5654L",
    colourways: [
      { sku: "BB-SHEERDRESS-BUR", supplierRef: "B-5654L-BUR", colour: "Burgundy", priceP: 4500, priceConfirmed: true, image: "bb-sheerdress-bur" },
      { sku: "BB-SHEERDRESS-BRN", supplierRef: "B-5654L-BRN", colour: "Brown", priceP: 4500, priceConfirmed: true, image: "bb-sheerdress-brn" },
    ],
  },
  {
    slug: "jean-jogger",
    name: "Jean Jogger",
    category: "Trousers",
    short: "Cut like a jean, comfortable as a jogger.",
    full: "Soft denim with a jersey-like drape and a gathered elasticated drawstring waist, finished with a pressed crease down the front of each leg so it still reads as a proper trouser. Deep angled pockets and a wide straight leg.",
    features: ["Elasticated drawstring waist", "Pressed front crease", "Deep angled pockets", "Wide straight leg"],
    fabric: "Soft washed denim with a jersey-like drape",
    fabricPublished: false,
    care: "Machine wash 30°C inside out. Wash dark colours separately. Do not tumble dry.",
    sizes: ["S/M", "M/L", "L/XL"],
    sizeNote: "2 of each",
    supplier: "BGF by Elvi",
    supplierCode: "68209DENIM",
    colourways: [
      { sku: "BB-JEANJOG-BLU", supplierRef: "68209DENIM-BLU", colour: "Blue", priceP: 2500, priceConfirmed: true, image: "bb-jeanjog-blu" },
      { sku: "BB-JEANJOG-BLK", supplierRef: "68209DENIM-BLK", colour: "Black", priceP: 2500, priceConfirmed: true, image: "bb-jeanjog-blk" },
    ],
  },
  {
    slug: "paisley-oversized-knitted-jumper",
    name: "Paisley Oversized Knitted Jumper",
    category: "Knitwear",
    short: "A heavy oversized knit in an all-over paisley.",
    full: "The paisley is knitted through the whole garment, front, back and sleeves, in cream and tan against a rich base colour. Substantial weight, dropped shoulders, ribbed cuffs and hem. Wear it with something slim on the bottom.",
    features: ["All-over knitted paisley pattern", "Heavy oversized knit", "Dropped shoulders", "Ribbed cuffs and hem"],
    fabric: "50% Viscose, 50% Polyamide",
    fabricPublished: true,
    care: "Hand wash cold. Do not tumble dry. Dry flat. Cool iron.",
    sizes: ["One size"],
    sizeNote: "fits up to 14",
    supplier: "Babez London",
    supplierCode: "M1238",
    colourways: [
      { sku: "BB-PAISLEYJMP-BRN", supplierRef: "M1238-BRN", colour: "Brown", priceP: 4500, priceConfirmed: true, image: "bb-paisleyjmp-brn" },
      { sku: "BB-PAISLEYJMP-BUR", supplierRef: "M1238-BUR", colour: "Burgundy", priceP: 4500, priceConfirmed: true, image: "bb-paisleyjmp-bur" },
    ],
  },
  {
    slug: "leopard-print-longline-coat",
    name: "Leopard Print Longline Coat",
    category: "Coats & Jackets",
    short: "A satin-finish leopard coat that falls below the knee.",
    full: "The piece in the range that gets stopped in the street. Classic tan and cream leopard with dark broken rosettes, printed across the whole coat including the sleeves and collar, in a soft satin fabric with proper drape. Notched lapel, relaxed through the body.",
    features: ["All-over leopard print", "Soft satin finish", "Longline, below the knee", "Notched lapel collar"],
    fabric: "Smooth satin-finish woven fabric",
    fabricPublished: false,
    care: "Dry clean only.",
    sizes: ["M-L"],
    sizeNote: "",
    supplier: "Drole de Copine Paris",
    supplierCode: "DR-8162",
    colourways: [
      { sku: "BB-LEOPARDCOAT", supplierRef: "DR-8162-LEOPARDCOAT", colour: "Leopard Print", priceP: 8500, priceConfirmed: true, image: "bb-leopardcoat" },
    ],
  },
  {
    slug: "short-trench-coat",
    name: "Short Trench Coat",
    category: "Coats & Jackets",
    short: "A hip-length double-breasted trench.",
    full: "All the detail of a full-length trench at a length that works over trousers and jeans — double-breasted button front, notched lapel, shoulder storm flap, buckled cuff straps and a matching tie belt.",
    features: ["Double-breasted button front", "Shoulder storm flap", "Buckled cuff straps", "Matching tie belt"],
    fabric: "Smooth woven trench fabric",
    fabricPublished: false,
    care: "Dry clean or machine wash 30°C, gentle cycle. Warm iron.",
    sizes: ["S-M", "M-L"],
    sizeNote: "",
    supplier: "Venessa Nucci",
    supplierCode: "",
    colourways: [
      { sku: "BB-TRENCH-SND", supplierRef: "", colour: "Sand", priceP: 4900, priceConfirmed: true, image: "bb-trench-snd" },
    ],
  },
  {
    slug: "high-neck-checked-bomber",
    name: "High Neck Checked Bomber",
    category: "Coats & Jackets",
    short: "A cropped padded bomber in a fine check with a high funnel collar.",
    full: "Soft quilted body with press-stud fastening and a tall stand collar that actually keeps the wind off. The check runs across the sleeves and collar as well as the body. Cropped to sit at the hip.",
    features: ["Fine check throughout", "High funnel stand collar", "Soft padded quilted body", "Press-stud front"],
    fabric: "Padded quilted check with a soft handle",
    fabricPublished: false,
    care: "Machine wash 30°C, gentle cycle. Do not tumble dry.",
    sizes: ["One size"],
    sizeNote: "fits up to 14",
    supplier: "",
    supplierCode: "",
    colourways: [
      { sku: "BB-BOMBER-RED", supplierRef: "", colour: "Red check", priceP: 4900, priceConfirmed: true, image: "bb-bomber-red" },
    ],
  },
  {
    slug: "italian-knit-belted-cardigan",
    name: "Italian Knit Belted Cardigan",
    category: "Knitwear",
    short: "A chunky ribbed cardigan-jacket with buttoned tabs and a tie belt.",
    full: "More jacket than cardigan. Cropped and boxy in a heavy chestnut rib, with a tall folded funnel collar, small buttoned tabs at the chest and each hip, and a long knitted tie belt that knots at the front.",
    features: ["Buttoned tabs at chest and hips", "Knitted tie belt", "Tall folded funnel collar", "Chunky ribbed knit"],
    fabric: "Chunky ribbed knit",
    fabricPublished: false,
    care: "Hand wash cold or wool cycle. Do not tumble dry. Dry flat.",
    sizes: ["One size"],
    sizeNote: "fits up to 16",
    supplier: "Cherry Blue",
    supplierCode: "",
    colourways: [
      { sku: "BB-ITKNITBOW-BRN", supplierRef: "", colour: "Brown", priceP: 6500, priceConfirmed: true, image: "bb-itknitbow-brn" },
    ],
  },
  {
    slug: "italian-knit-rosette-jumper",
    name: "Italian Knit Rosette Jumper",
    category: "Knitwear",
    short: "An ecru knit with brown rosettes down each sleeve.",
    full: "Fine knit in a soft ecru with dark chocolate trim at the neckline, cuffs and hem, and three fabric rosettes applied down the outer seam of each sleeve. The detail sits where people see it when you are talking with your hands.",
    features: ["Three rosettes down each sleeve", "Contrast chocolate trim", "Relaxed boxy fit", "Dropped shoulders"],
    fabric: "Fine knit with applied fabric rosettes",
    fabricPublished: false,
    care: "Hand wash cold. Do not tumble dry. Dry flat. Do not iron over the rosettes.",
    sizes: ["One size"],
    sizeNote: "fits up to 16",
    supplier: "ECRU",
    supplierCode: "",
    colourways: [
      { sku: "BB-ITKNIT49-CRM", supplierRef: "", colour: "Cream", priceP: 4900, priceConfirmed: true, image: "bb-itknit49-crm" },
    ],
  },
  {
    slug: "italian-knit-ribbed-cardigan",
    name: "Italian Knit Ribbed Cardigan",
    category: "Knitwear",
    short: "A cream ribbed cardigan with an off-centre button placket.",
    full: "Cropped and boxy with a high stand collar, and the row of dark navy buttons runs off to one side of the front rather than down the middle, continuing up onto the collar. A small change that makes it look like a much more expensive piece.",
    features: ["Asymmetric off-centre button placket", "High stand collar", "Cropped boxy shape", "Ribbed knit"],
    fabric: "Acrylic, Polyester, Nylon, Elastane (percentages not published)",
    fabricPublished: false,
    care: "Hand wash cold or wool cycle. Do not tumble dry. Dry flat. Cool iron.",
    sizes: ["One size"],
    sizeNote: "fits up to 16",
    supplier: "Cherry Blue (via Leivip)",
    supplierCode: "Leivip: ribbed-high-neck-button-front-knit-cardigan",
    colourways: [
      { sku: "BB-ITKNITRIB-CRM", supplierRef: "", colour: "Cream", priceP: 5500, priceConfirmed: false, image: "bb-itknitrib-crm" },
    ],
  },
  {
    slug: "chunky-knit-flower-cardigan",
    name: "Chunky Knit Flower Cardigan",
    category: "Knitwear",
    short: "A chunky brown cardigan scattered with white embroidered flowers.",
    full: "Substantial hand-knit texture with an open button-through front, and small five-petal daisies embroidered in white yarn across the body and sleeves. Warm, soft and a bit folkish without tipping into costume.",
    features: ["White embroidered daisies", "Chunky hand-knit texture", "Button-through front", "Ribbed cuffs and hem"],
    fabric: "Chunky hand-knit texture with embroidered detail",
    fabricPublished: false,
    care: "Hand wash cold. Do not tumble dry. Dry flat. Do not iron over the embroidery.",
    sizes: ["S-M", "M-L"],
    sizeNote: "",
    supplier: "Wild Flower",
    supplierCode: "",
    colourways: [
      { sku: "BB-CHUNKCARD-BRN", supplierRef: "", colour: "Brown", priceP: 4500, priceConfirmed: true, image: "bb-chunkcard-brn" },
    ],
  },
  {
    slug: "tomato-vase",
    name: "Tomato Vase",
    category: "Homeware",
    short: "A ceramic vase covered in three-dimensional tomatoes.",
    full: "Glossy scarlet tomatoes packed in staggered rows from base to rim, each finished with a dark green calyx. Big enough to hold a real armful of flowers, good enough to leave empty on a shelf.",
    features: ["Hand-finished ceramic", "High-gloss glaze", "Sculpted tomatoes all over", "Approx. 20cm tall"],
    fabric: "Glazed ceramic",
    fabricPublished: false,
    care: "Wipe clean with a damp cloth. Not dishwasher or microwave safe.",
    sizes: ["One size"],
    sizeNote: "",
    supplier: "",
    supplierCode: "",
    colourways: [
      { sku: "BB-VASE-TOMATO", supplierRef: "", colour: "Red", priceP: 6300, priceConfirmed: true, image: "bb-vase-tomato" },
    ],
  },
  {
    slug: "banana-jar",
    name: "Banana Jar",
    category: "Homeware",
    short: "A lidded ceramic jar formed from a bunch of bananas.",
    full: "The body curves out and in again in sculpted bananas, their tips meeting at the top in a scalloped rim. The lid drops inside it, with one more banana lying across the top as the handle. Bright glossy yellow throughout.",
    features: ["Lidded storage jar", "Banana-shaped handle", "Scalloped rim", "High-gloss yellow glaze"],
    fabric: "Glazed ceramic",
    fabricPublished: false,
    care: "Wipe clean with a damp cloth. Not dishwasher or microwave safe.",
    sizes: ["One size"],
    sizeNote: "",
    supplier: "",
    supplierCode: "",
    colourways: [
      { sku: "BB-JAR-BANANA", supplierRef: "", colour: "Yellow", priceP: 3200, priceConfirmed: true, image: "bb-jar-banana" },
    ],
  },
  {
    slug: "bell-vase",
    name: "Bell Vase",
    category: "Homeware",
    short: "A vase covered in polished gold bells.",
    full: "Dozens of small gold bells, complete with ring loops and clappers, packed in staggered rows around the whole vase. Mirror-bright metallic finish that throws warm reflections around a room.",
    features: ["Sculpted gold bells all over", "Mirror-bright metallic finish", "Decorative vase", "Approx. 20cm tall"],
    fabric: "Ceramic with metallic gold finish",
    fabricPublished: false,
    care: "Wipe clean with a dry soft cloth. Avoid water on the gold finish.",
    sizes: ["One size"],
    sizeNote: "",
    supplier: "",
    supplierCode: "",
    colourways: [
      { sku: "BB-VASE-BELL", supplierRef: "", colour: "Gold", priceP: 4500, priceConfirmed: true, image: "bb-vase-bell" },
    ],
  },
];

/** Every colourway whose price the client has not confirmed. Read by
 *  launch-check, and by the shop, which must not sell any of them. */
export function unconfirmedPrices(): StockColourway[] {
  return stocklist.flatMap((p) => p.colourways.filter((c) => !c.priceConfirmed));
}

export function pieceBySlug(slug: string): StockPiece | undefined {
  return stocklist.find((p) => p.slug === slug);
}

/** What sizes this drop actually runs to, in a sentence, derived.
 *
 *  ── Why this function exists ────────────────────────────────────────────
 *  The FAQ answered "What sizes do you stock?" with "Most pieces run from a
 *  size 8 to a size 18". It was written before anybody knew what the shop
 *  held, was marked `temporary: true`, and survived onto a live site.
 *
 *  Against her real stock it is false, and not marginally: NOT ONE of the 32
 *  pieces offers a size 18, and not one uses a numeric 8-to-18 run at all.
 *  Fifteen are "one size, fits up to 14". The largest anything reaches is 16,
 *  on four pieces.
 *
 *  That is the most expensive kind of wrong on this site. A customer reads it,
 *  drives to Cleethorpes or orders online, and the garment does not go near
 *  her size — a wasted journey, a return the shop pays to handle, and under
 *  the Consumer Protection from Unfair Trading Regulations a misleading claim
 *  about the goods.
 *
 *  So the answer is COUNTED rather than written. It cannot drift from the
 *  rail, and when she buys a piece that runs to an 18 the sentence says so by
 *  itself. */
export function sizeSummary(): string {
  const oneSize = stocklist.filter((p) => p.sizes.length === 1 && p.sizes[0] === "One size");
  const lettered = stocklist.filter((p) => p.sizes.length > 1);

  /* "fits up to 14" / "fits up to 16" — read off the note, never guessed. */
  const caps = [
    ...new Set(
      oneSize
        .map((p) => p.sizeNote.match(/fits up to (\d+)/)?.[1])
        .filter((x): x is string => Boolean(x)),
    ),
  ]
    .map(Number)
    .sort((a, b) => a - b);

  const parts: string[] = [];
  if (oneSize.length) {
    parts.push(
      caps.length
        ? `Most of what is in at the moment is one size, cut to fit up to a ${
            caps.length === 1
              ? caps[0]
              : `${caps.slice(0, -1).join(", a ")} or a ${caps[caps.length - 1]}`
          }`
        : "Most of what is in at the moment is one size",
    );
  }
  if (lettered.length) {
    parts.push(
      `${oneSize.length ? "the" : "The"} trousers and a few of the knits run in small to large`,
    );
  }
  return (
    `${parts.join(", and ")}. Sizing varies from piece to piece, so every product ` +
    `page lists its own — and if you are between sizes it is worth coming in, ` +
    `because the fit differs more than a label suggests.`
  );
}
