#!/usr/bin/env node
/* Pre-encode the product photography.
 *
 * 54 colourways, one photograph each, from the client's stock dashboard.
 * They arrive as WebP at 1856x2304 (a few of the homeware at 2048 square),
 * which is a review-quality copy rather than the original — the dashboard
 * says the full-resolution files should end up in Blob or in the repository,
 * and when they do this script is what re-runs over them.
 *
 * ── Why pre-encode at all ────────────────────────────────────────────────
 * Same reason as the hero: the Next image optimiser encodes on demand, and
 * a grid of 54 product cards is 54 cold encodes the first time anybody opens
 * /shop. Encoding ahead of time turns every one of them into a static file.
 *
 * ── Three widths, and why those three ────────────────────────────────────
 * Measured against the real layouts rather than guessed:
 *   /shop and /clothing render cards in a grid that is 1 up at 390, 2 up at
 *   768 and 4 up at 1440, so the widest a CARD is ever drawn is about 330
 *   CSS px — 660 at 2x. The product page runs the same photograph up to
 *   about 620 CSS px, so 1240 at 2x.
 * 640 / 960 / 1280 covers both with a little headroom and nothing beyond it.
 * The source is 1856 wide, so every one of the three is a downscale: none of
 * these is an upscale pretending to be detail.
 *
 * ── No crop ──────────────────────────────────────────────────────────────
 * The frames are already a consistent 4:5 with the garment centred and the
 * model's head and feet inside the frame. Cropping to a different ratio here
 * would cut heads off, and the site's own CSS can letterbox if a layout ever
 * wants a different shape. The three square homeware frames are left square
 * for the same reason — they are objects on a surface, not figures, and a
 * 4:5 crop of a square vase shot is a worse photograph.
 *
 *   node scripts/build-product.mjs
 */
import sharp from "sharp";
import { mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SRC = "assets/product";
const OUT = "public/img/product";

/** See the note above. Anything wider than the source would be an upscale. */
const WIDTHS = [640, 960, 1280];

/* AVIF first because it is what nearly every current browser takes, and it
   is roughly 30% smaller than WebP at a matched appearance on this kind of
   image — a clean studio backdrop with one subject and a soft shadow.
   Quality is deliberately higher than the hero's: a hero is looked at for a
   second behind type, a product photograph is what somebody decides to
   spend money on, and a compression artefact in a knit is the difference
   between "textured" and "pilled". */
/* `effort` is encoder search time, not quality. At 6 this script took six
   seconds per file and 48 minutes for the set, which is long enough that
   nobody runs it and the built files drift from the sources. Measured on
   this imagery, 4 costs about 2% in size for roughly a third of the time.
   Quality is the number that matters here and it is untouched. */
const AVIF = { quality: 62, effort: 4 };
const WEBP = { quality: 80, effort: 4 };
/* The fallback exists for a browser that takes neither, which in practice is
   a very old Safari. It is not in the hot path and does not need to be tiny. */
const JPEG = { quality: 82, mozjpeg: true, progressive: true };

async function main() {
  if (!existsSync(SRC)) {
    throw new Error(`${SRC} is missing — the source photographs are not in the repository`);
  }
  await mkdir(OUT, { recursive: true });

  const files = (await readdir(SRC)).filter((f) => f.endsWith(".webp")).sort();
  if (files.length === 0) throw new Error(`no .webp sources in ${SRC}`);

  let written = 0;
  let bytes = 0;
  const report = [];

  /* A small pool rather than a plain loop. libvips threads inside one encode,
     but it does not saturate the machine on a file this size, and 486 files
     done strictly one after another left most of the CPU idle. Four is picked
     to stay well inside memory: each worker holds one decoded 1856x2304
     frame, not the whole set. */
  const POOL = 4;

  async function one(file) {
    const base = path.basename(file, ".webp");
    const src = path.join(SRC, file);
    const meta = await sharp(src).metadata();

    for (const w of WIDTHS) {
      /* Never enlarge. A 1280 from a 1024 source is a blurrier file that
         claims to be sharper, and `withoutEnlargement` is how that is
         stated rather than assumed. */
      if (meta.width && w > meta.width) {
        report.push(`${base}: skipped ${w} (source is only ${meta.width} wide)`);
        continue;
      }
      const pipe = () => sharp(src).resize({ width: w, withoutEnlargement: true });
      const out = [
        [`${base}-${w}.avif`, pipe().avif(AVIF)],
        [`${base}-${w}.webp`, pipe().webp(WEBP)],
        [`${base}-${w}.jpg`, pipe().jpeg(JPEG)],
      ];
      for (const [name, p] of out) {
        const info = await p.toFile(path.join(OUT, name));
        written += 1;
        bytes += info.size;
      }
    }
  }

  const queue = [...files];
  await Promise.all(
    Array.from({ length: POOL }, async () => {
      for (let next = queue.shift(); next; next = queue.shift()) await one(next);
    }),
  );

  console.log(`${files.length} photographs -> ${written} files, ${(bytes / 1024 / 1024).toFixed(1)} MB total`);
  for (const line of report) console.log(`  note: ${line}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
