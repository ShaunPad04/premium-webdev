#!/usr/bin/env node
/* Garment-only packshots for the product-card hover (2026-09-29, Brad: the
 * model photo stays the main image; hovering shows the piece on its own on
 * white).
 *
 * Sources: assets/packshot/<photo>.png, named after the colourway's photo
 * (e.g. bb-fairisle-bei.png), made in Higgsfield from her own photo and
 * checked against it by eye before they are added. A packshot that shows a
 * detail the real piece does not have (pockets, buttons, a label) must not go
 * in: it is a picture of the product a customer is buying.
 *
 * Output: public/img/product/pack/<photo>-{400,640,960,1280}.{avif,webp}
 * plus -960.jpg, the same set and encoder settings as build-product.mjs, so
 * ProductPhoto serves them unchanged (photo="pack/<photo>"). Frames are 4:5
 * like the model photos; anything else is fitted onto white at 4:5.
 *
 *   node scripts/build-packshot.mjs
 */
import sharp from "sharp";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const SRC = "assets/packshot";
const OUT = "public/img/product/pack";
const WIDTHS = [400, 640, 960, 1280];
const AVIF = { quality: 62, effort: 4 };
const WEBP = { quality: 80, effort: 4 };
const JPEG = { quality: 82, mozjpeg: true, progressive: true };

/* The generator's "white" is not white: faint grey blotches that show as
   patches on the card's #FFF. Only near-white pixels are lifted, with a
   soft ramp (min channel 228 -> 246) so the garment's edge is untouched. */
async function cleanWhite(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 3) {
    const m = Math.min(data[i], data[i + 1], data[i + 2]);
    if (m <= 228) continue;
    const t = Math.min(1, (m - 228) / 18);
    for (let c = 0; c < 3; c++) data[i + c] = Math.round(data[i + c] + (255 - data[i + c]) * t);
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } }).png().toBuffer();
}

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort();
for (const file of files) {
  const base = path.parse(file).name;
  const clean = await cleanWhite(path.join(SRC, file));
  for (const w of WIDTHS) {
    const pipe = () =>
      sharp(clean)
        .resize({ width: w, height: Math.round((w * 5) / 4), fit: "contain", background: "#FFFFFF" })
        .flatten({ background: "#FFFFFF" });
    await pipe().avif(AVIF).toFile(path.join(OUT, `${base}-${w}.avif`));
    await pipe().webp(WEBP).toFile(path.join(OUT, `${base}-${w}.webp`));
    if (w === 960) await pipe().jpeg(JPEG).toFile(path.join(OUT, `${base}-${w}.jpg`));
  }
  console.log(base);
}
console.log(`${files.length} packshot(s) -> ${OUT}`);
