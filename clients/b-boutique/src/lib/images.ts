/** Generated art direction, keyed by the slot it fills.
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
 *  A set, not a boolean. The upload arrived 16 of 19 complete, and a single
 *  flag would have forced a choice between pointing slots at files that do not
 *  exist or leaving all of them on an unreachable CDN. Per-slot, the vendored
 *  ones load locally and the rest fall back to the CDN — which the sandbox
 *  cannot reach, so here they show their designed marble and cloth, while a
 *  real visitor gets the photograph. Add a slot when its file lands.
 *
 *  Not vendored:
 *    new-boucle-overshirt · homeware-ceramics
 *      their source PNG was not in the upload.
 *    panel-tops · panel-dresses · panel-accessories
 *      vendored once, for a category-panel treatment the rail replaced. The
 *      .webp files were removed in the release cleanup because nothing on the
 *      page rendered them; their CDN source below is kept so the photograph
 *      can come back if a slot ever needs it again.
 *
 *  panel-jackets is gone entirely: it had no local file AND no consumer, so
 *  it was one dead remote URL the page could never have used. */
const vendored = new Set<string>(
  [
  "panel-all",
  "panel-knitwear",
  "panel-trousers",
  "panel-homeware",
  "new-wool-trouser",
  "new-camel-blazer",
  "new-cotton-tee",
  "new-slip-dress",
  "new-lambswool-crew",
  "new-leather-crossbody",
  "new-silk-scarf",
  "new-stoneware-carafe",
  "homeware-linen"
]
);

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
  "new-charcoal-overcoat":  "hf_20260906_223202_d37645b0-0053-48f1-97e0-4335119ef087_min.webp",
  "new-camel-wrap-coat":    "hf_20260906_223202_a0c07a1a-7f0a-4071-add8-24ecd03a8a71_min.webp",
  "new-poplin-shirt":       "hf_20260906_223202_4e0f689d-7d17-437e-819d-697eb8aad703_min.webp",
  "new-silk-blouse":        "hf_20260906_223202_dc6f3d4c-a735-456e-8ec2-1efa0460d184_min.webp",
  "new-satin-skirt":        "hf_20260906_223202_d1d34cff-c702-499d-8fd9-49e026bcb17d_min.webp",
  "new-pleated-skirt":      "hf_20260906_223202_d77989c7-c7b0-4d05-888d-46e794128a49_min.webp",
  "new-straight-jeans":     "hf_20260906_223202_e7ca6518-3092-4888-beed-60492d9c8283_min.webp",
  "new-wide-jeans":         "hf_20260906_223202_615dc887-033e-4ab0-a931-b045ecec3ac6_min.webp",
  "new-merino-rollneck":    "hf_20260906_223202_c5526975-1803-48fa-94a8-daf6d09938d9_min.webp",
  "new-burgundy-dress":     "hf_20260906_223202_d1c3be07-5bdf-4e03-bae9-e471902e781c_min.webp",
  "new-wool-blazer":        "hf_20260906_223202_da9bb067-5387-4c1d-9f24-590439c8b14e_min.webp",
  "new-striped-top":        "hf_20260906_223202_f858bf93-854e-42ea-b6cc-91c7fa18a380_min.webp",

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
  "panel-coats":   "hf_20260906_215715_7e7bb502-00fc-482d-84a8-38198a23894e_min.webp",
  "panel-shirts":  "hf_20260906_215715_d5ded46b-eae4-4627-be36-e251cfef8d18_min.webp",
  "panel-skirts":  "hf_20260906_215715_7b87b535-cccb-44c2-b2f5-814703018c19_min.webp",
  "panel-denim":   "hf_20260906_215715_6c32a3e8-3220-49ca-8e99-a81fc9e28cc5_min.webp",

  "new-gold-hoops":      "hf_20260906_215715_7a10e049-8195-4937-8c24-5e15b125f218_min.webp",
  "new-leather-belt":    "hf_20260906_215715_927c9ece-a72f-45e8-801c-31bcde99b73e_min.webp",
  "new-lambswool-scarf": "hf_20260906_215715_3e6072ab-bd1d-446c-a88e-f8357b3d232e_min.webp",
  "new-leather-tote":    "hf_20260906_215715_62b81f5c-80a1-4ed0-b9b5-e36cae6803f5_min.webp",

  // Category panels — one per rail, keyed by slug so a reorder cannot
  // silently mis-pair a photograph with the wrong category.
  "panel-all":         "hf_20260901_005602_d257ff55-dc4f-40c5-bd57-f948cfbb8480.png",
  "panel-tops":        "hf_20260901_005609_b5cc1ef9-3ce9-4b5a-a591-78da88a8f43f.png",
  "panel-dresses":     "hf_20260831_213118_14e2c6f8-dcde-4c09-986b-584661bb7fb6.png",
  "panel-knitwear":    "hf_20260831_213122_f1b362aa-51b9-415a-87ee-792954a78c57.png",
  "panel-trousers":    "hf_20260831_213130_a30796f6-3422-4bef-9404-01110b1701da.png",
  "panel-accessories": "hf_20260831_213132_410d532a-cd67-4c29-9277-1a33348ce3c2.png",
  "panel-homeware":    "hf_20260831_213133_3cad2c02-b79d-4c6f-bb3b-865418e5192e.png",

  /* New in — one photograph per piece.
   *
   * The trouser, blazer, tee and slip dress were shot 2026-09-01 as single
   * garments: the brief was a dress, a jacket, trousers and a t-shirt that
   * read as specific pieces rather than a rail or a still life. Same set as
   * the rest, so they cut together with the originals. */
  "new-wool-trouser":      "hf_20260901_211245_625772ec-5bbb-414c-a36a-c0087e92624a.png",
  "new-camel-blazer":      "hf_20260901_211239_cc10350a-5a88-4247-bc86-014303508a30.png",
  "new-cotton-tee":        "hf_20260901_211251_7a3352f0-d1b5-4990-b4e5-f2791eedd1a4.png",
  "new-slip-dress":        "hf_20260901_211233_0610cafa-ecc2-4711-bacb-05061bc841ff.png",
  "new-lambswool-crew":    "hf_20260831_213144_1312c8d5-9154-4c77-9a39-380f7b328e63.png",
  "new-leather-crossbody": "hf_20260831_213223_e22ab789-2dd1-4cf5-8b64-6bd4815a9348.png",
  "new-silk-scarf":        "hf_20260831_213229_80e138d9-ece1-4d14-9d7f-c00b7603590c.png",
  "new-stoneware-carafe":  "hf_20260831_213231_6b53732f-613b-42ee-82e6-a5b400917dde.png",
  "new-boucle-overshirt":  "hf_20260831_213242_cd9f22e5-fcad-404a-9c40-ee438645bd60.png",

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
