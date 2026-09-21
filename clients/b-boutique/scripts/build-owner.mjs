#!/usr/bin/env node
/* Pre-encode the owner portrait.
 *
 * Same job as build-hero.mjs, same reason: encode once at build time rather
 * than letting the image optimiser do it on the first request.
 *
 *   node scripts/build-owner.mjs
 *
 * ── The crop is done HERE, not in CSS, and that is the point ──────────────
 * Her photograph is 487x1057 — a 0.461 ratio. The card's frame is 3:4
 * (0.750). `object-fit: cover` therefore has to discard 408px of HEIGHT, and
 * its default `object-position: center` takes that off both ends equally:
 * 204px from the top, which cuts through the top of her head. That was
 * checked by rendering the candidates side by side rather than reasoned
 * about, and the centred one is plainly wrong.
 *
 * Cropping to 3:4 at a chosen offset here means the <img> fills its frame
 * exactly, so there is no object-position to get wrong later and no way for
 * a future change to the frame to silently re-crop her face.
 *
 * TOP = 40 keeps the whole head with natural headroom. 0 leaves dead space
 * above her; 120 puts her hair against the edge; 204 is the one that cuts.
 *
 * ── Resolution: this is the ceiling, and it is short ──────────────────────
 * The source is 487px wide. The frame is up to 420 CSS px on a desktop, so a
 * DPR-2 display wants ~840px and this supplies 58% of that. It is sharp on a
 * standard display and soft on a retina one. Nothing here can fix that — it
 * is the original. A larger file from the client replaces
 * assets/owner/hayley-source.jpg and this script regenerates everything.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

await mkdir("public/img/owner", { recursive: true });

const SRC = "assets/owner/hayley-source.jpg";
const TOP = 40;
const RATIO = 3 / 4;

const meta = await sharp(SRC).metadata();
const width = meta.width;
const height = Math.round(width / RATIO);

if (TOP + height > meta.height) {
  throw new Error(
    `Crop runs past the bottom of ${SRC}: ${TOP} + ${height} > ${meta.height}. ` +
      `A replacement source with a different shape needs TOP re-checked, not nudged.`,
  );
}

const base = sharp(SRC).extract({ left: 0, top: TOP, width, height });
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

const [a, w, j] = await Promise.all([
  base.clone().avif({ quality: 62, effort: 6 }).toFile("public/img/owner/hayley.avif"),
  base.clone().webp({ quality: 80 }).toFile("public/img/owner/hayley.webp"),
  base.clone().jpeg({ quality: 84, mozjpeg: true }).toFile("public/img/owner/hayley.jpg"),
]);

console.log(
  `source ${meta.width}x${meta.height} -> crop ${width}x${height} at top ${TOP}\n` +
    `  avif ${kb(a.size)}   webp ${kb(w.size)}   jpg ${kb(j.size)}`,
);
