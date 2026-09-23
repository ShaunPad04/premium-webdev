#!/usr/bin/env node
/* Pre-encode the masthead textures.
 *
 * Seven extreme macros of cloth and glaze — one per category rail — that sit
 * behind the big Bodoni on a category masthead. Generated, deliberately of
 * MATERIAL and not of garments, rails or the shop: see the note in
 * PageMasthead.tsx for why that distinction is the whole point.
 *
 * ── One width, unlike the hero and the products ─────────────────────────
 * This is a background band, not a picture anybody looks at. The masthead is
 * never taller than ~440px and the image is cropped to it and then darkened
 * hard by the scrim, so the detail a second width would buy is detail nobody
 * can see. 2000px covers a 1440 layout at DPR 1.4 and every phone at DPR 3,
 * and one file per format keeps 21 files out of the repository.
 *
 * Quality is lower than the product set for the same reason — 48 rather than
 * 62 on AVIF. Compression artefacts in a knit matter when somebody is
 * deciding whether to spend £45 on it; they do not matter at 18% opacity
 * behind a headline. Measured: the set lands at well under 100 KB a frame.
 *
 *   node scripts/build-texture.mjs
 */
import sharp from "sharp";
import { mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SRC = "assets/texture";
const OUT = "public/img/texture";
const WIDTH = 2000;
const MOBILE = 900;

async function main() {
  if (!existsSync(SRC)) throw new Error(`${SRC} is missing`);
  await mkdir(OUT, { recursive: true });

  const files = (await readdir(SRC)).filter((f) => f.endsWith(".png")).sort();
  if (files.length === 0) throw new Error(`no .png sources in ${SRC}`);

  let bytes = 0;
  for (const file of files) {
    const base = path.basename(file, ".png");
    const src = path.join(SRC, file);
    const meta = await sharp(src).metadata();
    if (meta.width && meta.width < WIDTH) {
      throw new Error(
        `${base}: source is ${meta.width}px, narrower than the ${WIDTH}px output — ` +
          `that would be an upscale`,
      );
    }
    const pipe = () => sharp(src).resize({ width: WIDTH, withoutEnlargement: true });
    /* The phone crop (2026-09-23). A masthead on a phone is taller than it
       is wide, so `object-fit: cover` only ever shows a slice of the 21:9
       frame, yet phones were downloading the whole 2000px file. This is a
       square cut of the part a phone shows (centred 82% across, the same
       point the CSS used), at 900px: sharp at a 390px screen's 2x DPR. */
    const side = Math.min(meta.width, meta.height);
    const left = Math.max(0, Math.min(meta.width - side, Math.round(meta.width * 0.82 - side / 2)));
    const top = Math.round((meta.height - side) / 2);
    const phone = () =>
      sharp(src).extract({ left, top, width: side, height: side }).resize({ width: MOBILE, withoutEnlargement: true });
    for (const [name, p] of [
      [`${base}.avif`, pipe().avif({ quality: 48, effort: 4 })],
      [`${base}.webp`, pipe().webp({ quality: 70, effort: 4 })],
      [`${base}.jpg`, pipe().jpeg({ quality: 74, mozjpeg: true, progressive: true })],
      [`${base}-m.avif`, phone().avif({ quality: 48, effort: 4 })],
      [`${base}-m.webp`, phone().webp({ quality: 70, effort: 4 })],
      [`${base}-m.jpg`, phone().jpeg({ quality: 74, mozjpeg: true, progressive: true })],
    ]) {
      const info = await p.toFile(path.join(OUT, name));
      bytes += info.size;
    }
  }

  console.log(
    `${files.length} textures -> ${files.length * 6} files, ` +
      `${(bytes / 1024).toFixed(0)} KB total`,
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
