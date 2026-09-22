/** Generated art direction, keyed by the slot it fills.
 *
 *  ── 2026-09-22: 33 of the 39 slots were deleted ─────────────────────────
 *  They were the stand-in artwork for the 26 invented products and the
 *  category panels, all of which are gone: the shop renders the client's own
 *  54 photographs now (see ProductPhoto), and the category cards use a real
 *  piece from the category rather than a generated magazine spread.
 *
 *  Leaving them would not have been harmless. `pnpm launch-check` counts
 *  un-vendored slots and was still blocking on six of them, every one dead —
 *  a gate reporting a problem nobody can fix is how a gate stops being read.
 *  And one of the six was `panel-accessories`, which this file already
 *  recorded as REPRODUCING THIRD-PARTY TRADE MARKS (an interlocking-GG
 *  emblem, a Triomphe-style clasp). Nothing rendered it, but a dead URL to a
 *  trademark infringement sitting in a client repository is not something to
 *  keep for tidiness.
 *
 *  Six remain, all still rendered: the three Homeware stills and three
 *  category panels.
 *
 *  Shot as one set: black marble with white veining, polished brass, a pale
 *  bone floor, warm directional window light from the left. That consistency
 *  is what makes twenty separate generations read as one photoshoot.
 *
 *  ── Where the files actually live ────────────────────────────────────────
 *  Until they are vendored, every slot resolves to Higgsfield's CDN. That
 *  host is denied by the Claude Code sandbox's egress policy, so inside that
 *  environment the slots fall back to their designed marble and cloth — the
 *  photographs are fine, the sandbox simply cannot reach them.
 *
 *  `node scripts/fetch-images.mjs`, run anywhere with normal internet, pulls
 *  the set into public/img as web-weight WebP and flips VENDORED to true.
 *  Nothing else has to change: SlotPhoto already routes a local path through
 *  next/image, which adds AVIF and a srcset on top.
 *
 *  The CDN filenames stay in this file either way, so a vendored copy can
 *  always be traced back to the generation it came from — and re-fetched.
 *
 *  Every slot keeps its designed fallback underneath regardless, so a slot
 *  that fails to load still reads as intentional rather than broken. */

const CDN =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3HwrG1wTADv3RkUcvzwwuwfoAUh/";

/** The slots whose photograph is vendored in public/img as <slot>.webp.
 *
 *  A set, not a boolean. The vendored ones load locally; the rest fall back to
 *  the CDN, which a real visitor CAN reach — falling back is not the same as
 *  not being shown. Only this sandbox is blocked from that host, which is why
 *  an un-vendored slot shows its designed marble here and the photograph in
 *  production. Add a slot when its file lands.
 *
 *  (was 33 of 39 as of 2026-09-08) `pnpm images` fetched all 39; six were then
 *  held back after the first visual review of the set, and their files
 *  deliberately removed so this manifest cannot claim a local copy that is
 *  not there:
 *
 *    panel-coats · panel-shirts · panel-skirts · panel-denim
 *      generated as fake magazine spreads carrying gibberish typography, and
 *      two of the four have malformed hands. All four are rendered — they are
 *      the clothing category cards in lib/pages.ts — so they are still on the
 *      page from the CDN. Not vendoring them does not fix that; new art does.
 *    panel-accessories
 *      reproduces third-party trade marks (an interlocking-GG emblem, a
 *      Triomphe-style clasp). Nothing renders it, and it is kept out of the
 *      repository deliberately. Do not vendor it.
 *    new-satin-skirt
 *      the photograph is a matte brown pencil skirt; the product is a
 *      bias-cut satin skirt. Wrong garment, not merely a weak shot.
 *
 *  Re-running `pnpm images` will pull all six back. That is a decision, not a
 *  routine step — read this block first.
 *
 *  panel-jackets is gone entirely: it had no local file AND no consumer, so
 *  it was one dead remote URL the page could never have used. */
const vendored = new Set<string>([
  "panel-all",
  "panel-knitwear",
  "panel-trousers",
  "panel-homeware",
  "homeware-ceramics",
  "homeware-linen",
]);

/** slot -> the generation's filename on the CDN. Order is the page's order. */
const shot: Record<string, string> = {
  /* ── Product photography, generated 2026-09-06 ─────────────────────────
   * Twelve garment still lifes, shot to the same direction as the New In set:
   * black marble with white veining, polished brass, warm window light from
   * the left. They exist because four clothing categories had a card and a
   * name and nothing behind them — a boutique with an empty Coats rail.
   *
   * Same caveats as the block below: `_min.webp` previews, not vendored, not
   * seen by anyone in this environment. `pnpm images` fixes all three. */

  /* ── Generated 2026-09-06, at the client's request ──────────────────────
   * Four clothing categories and four accessories, shot to match the sets
   * already here: the category panels are studio model shots on a muted
   * grey-green seamless with directional light from the left; the pieces are
   * still lifes on black marble and polished brass with warm window light.
   * Same shoot direction, so twenty-eight generations still read as one day.
   *
   * These are the `_min.webp` previews rather than the full-size PNGs, and
   * that is a deliberate compromise rather than an oversight. The masters are
   * 1536x2048 PNGs and nothing in this environment can reach the CDN to
   * convert them — the egress policy denies that host, which is the same
   * reason the slots below are not vendored. Shipping eight unoptimised PNGs
   * to a preview would cost more than a soft card does.
   *
   * BEFORE LAUNCH: run `pnpm images` on a machine with normal internet. It
   * pulls the full-quality masters into public/img as web-weight WebP and
   * they stop being remote. Until then these load from the CDN at preview
   * quality, and any that fail show the designed marble underneath.
   *
   * NOT VERIFIED VISUALLY. They were generated from this environment, which
   * cannot fetch them back, so nobody has looked at these eight images yet. */


  // Category panels — one per rail, keyed by slug so a reorder cannot
  // silently mis-pair a photograph with the wrong category.
  "panel-all":         "hf_20260901_005602_d257ff55-dc4f-40c5-bd57-f948cfbb8480.png",
  "panel-knitwear":    "hf_20260831_213122_f1b362aa-51b9-415a-87ee-792954a78c57.png",
  "panel-trousers":    "hf_20260831_213130_a30796f6-3422-4bef-9404-01110b1701da.png",
  "panel-homeware":    "hf_20260831_213133_3cad2c02-b79d-4c6f-bb3b-865418e5192e.png",

  /* New in — one photograph per piece.
   *
   * The trouser, blazer, tee and slip dress were shot 2026-09-01 as single
   * garments: the brief was a dress, a jacket, trousers and a t-shirt that
   * read as specific pieces rather than a rail or a still life. Same set as
   * the rest, so they cut together with the originals. */

  // Homeware section stills
  "homeware-ceramics": "hf_20260831_213243_9282d4a4-dd92-4a5c-80a2-d2de3971bcfa.png",
  "homeware-linen":    "hf_20260831_213311_6f856f33-0b6d-4742-8fee-9f5b600b9d88.png",
};

/* The hero is not in here. It is vendored already, at its own responsive
 * sizes, and HeroPicture names those files directly — the two "hero" entries
 * this map used to carry pointed at /img/hero.png and /img/hero-mobile.png,
 * neither of which exists. Nothing read them; they were dead config. */

export const images: Partial<Record<string, string>> = Object.fromEntries(
  Object.entries(shot).map(([slot, file]) => [
    slot,
    vendored.has(slot) ? `/img/${slot}.webp` : CDN + file,
  ]),
);

/** Slots still waiting on their file. Empty means the set is complete. */
export const notVendored = Object.keys(shot).filter((s) => !vendored.has(s));

/** The CDN original for a slot, whatever `images` currently resolves to.
 *  scripts/fetch-images.mjs downloads from here. */
export const sourceFor = (slot: string) =>
  shot[slot] ? CDN + shot[slot] : undefined;

export const slots = Object.keys(shot);

export const imageFor = (slot?: string) => (slot ? images[slot] : undefined);
