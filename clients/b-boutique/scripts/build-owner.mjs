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
 * The offset keeps the whole head with natural headroom. On the original
 * 487x1057 file the candidates were 0 (dead space above her), 40 (right),
 * 120 (hair against the edge) and 204 — the centred default, the one that
 * cuts through the top of her head. It is stored as a fraction of the height
 * so it survives the source being replaced.
 *
 * ── Resolution: solved 2026-09-21 ────────────────────────────────────────
 * The client's original was 487px wide against a frame that is up to 420 CSS
 * px, so a DPR-2 display got 58% of the pixels it wanted. It was upscaled
 * 4.44x to 2160x4712 (Higgsfield / bytedance_image_upscale, 2 credits), and
 * the crop is now 2160px wide — comfortably past the ~840px a retina display
 * asks for.
 *
 * It is an UPSCALE, not a regeneration, and that distinction was tested
 * rather than trusted. Downscaled back to 487x1057 and compared with the
 * original pixel by pixel, the face region differs by 1.89% mean — the
 * signature of sharpening, not of new features — and looked at side by side
 * at 1:1 the brow, eye, nose, lip and hairline geometry is identical, with
 * the fine lines around her eyes still present rather than smoothed away.
 * The output is capped below to stop a future 4K source shipping 8MB.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

await mkdir("public/img/owner", { recursive: true });

const SRC = "assets/owner/hayley-source.jpg";
/* As a FRACTION of the source height, not a pixel count.
 *
 * It was `const TOP = 40` against the original 487x1057 file. The source was
 * then replaced with a 2160x4712 upscale, and 40px on that image is a tenth
 * of the offset it was on the old one — the crop would have silently moved.
 * A fraction survives a change of source, which is exactly what happened
 * here and will happen again if a better original arrives. */
const TOP_FRACTION = 40 / 1057;
const RATIO = 3 / 4;

const meta = await sharp(SRC).metadata();
const TOP = Math.round(meta.height * TOP_FRACTION);
const width = meta.width;
const height = Math.round(width / RATIO);

if (TOP + height > meta.height) {
  throw new Error(
    `Crop runs past the bottom of ${SRC}: ${TOP} + ${height} > ${meta.height}. ` +
      `A replacement source with a different shape needs TOP re-checked, not nudged.`,
  );
}

/* Sized against the two real cases, both MEASURED in a browser rather than
   reasoned about:
     desktop, 420px slot at DPR 2  -> needs  840px
     phone,   354px slot at DPR 3  -> needs 1062px
   960 was tried first and covered the desktop but left the phone at 90% of
   what it asks for. 1120 clears both with a little headroom.
   Not the full 2160: that made a 205 KB AVIF for a slot that can never show
   more than a fifth of it, which is just the mirror image of the
   under-resolved problem this replaced. */
const OUT_W = 1120;

const base = sharp(SRC)
  .extract({ left: 0, top: TOP, width, height })
  .resize({ width: Math.min(OUT_W, width), withoutEnlargement: true });
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
