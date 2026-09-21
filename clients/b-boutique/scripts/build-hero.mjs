#!/usr/bin/env node
/* Pre-encode the hero art.
 *
 * The Next image optimiser encodes on demand: the first request for the
 * 2.8 MB source PNG cost 1351ms, which landed directly on LCP. Encoding
 * ahead of time removes that entirely — the browser gets a finished file
 * from the static route.
 *
 * ── 2026-09-21: one photograph became five ────────────────────────────────
 * The hero is a slideshow now, so this builds a pair of files per slide
 * rather than a pair in total: a 16:9 desktop crop and a 9:16 mobile crop,
 * in three formats each, so a <picture> per slide can hand every browser
 * the smallest thing it understands and fetch exactly one file.
 *
 * ── Every slide has TWO sources, and that is the whole point ──────────────
 * `<name>.png` is the 16:9 frame. `<name>-portrait.png` is a genuine 9:16
 * version of the same photograph, made by outpainting — the scene extended
 * above and below rather than the sides thrown away.
 *
 * The first version of this script had only the landscape source and cut
 * the phone crop out of it. That is the obvious approach and it is badly
 * wrong, because there is nothing to cut: a 9:16 window out of a 2048x1152
 * frame is 648px wide, full stop. Measured against the single-image hero it
 * replaced, that was 1100px -> 648px across, a 41% drop in width and 66% of
 * the pixels, and the client saw it immediately.
 *
 * Worse, the outpainted portrait for `1-paris` already existed and this
 * script stopped using it — the good file was sitting on disk while the
 * page served a 648px cut of the landscape.
 *
 * So: the portrait source is required, not optional. The build throws if
 * one is missing rather than silently falling back to cutting the
 * landscape, because a silent fallback is exactly how the regression got
 * shipped in the first place.
 *
 *   node scripts/build-hero.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

await mkdir("public/img/hero", { recursive: true });

const slides = ["1-paris", "2-street", "3-terrace", "4-flowers", "5-sea"];

/* 1800 for the landscape file and 1100 for the portrait one, matching what
   the single-image hero shipped before the slideshow — so the comparison
   against it is like for like rather than flattering. */
const DESKTOP_W = 1800;
const MOBILE_W = 1100;
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

for (const name of slides) {
  const land = `assets/hero/${name}.png`;
  const port = `assets/hero/${name}-portrait.png`;

  /* Loud, not silent. The regression this replaces happened because the
     script quietly did something reasonable-looking with a missing file. */
  if (!existsSync(port)) {
    throw new Error(
      `Missing portrait source ${port}. Every slide needs a real 9:16 file — ` +
        `do not cut one out of the landscape, it loses two thirds of the pixels.`,
    );
  }

  const lm = await sharp(land).metadata();
  const pm = await sharp(port).metadata();

  const desk = sharp(land).resize({ width: DESKTOP_W, withoutEnlargement: true });
  const mob = sharp(port).resize({ width: MOBILE_W, withoutEnlargement: true });

  const [da, dw, dj, ma, mw, mj] = await Promise.all([
    desk.clone().avif({ quality: 62, effort: 6 }).toFile(`public/img/hero/${name}-d.avif`),
    desk.clone().webp({ quality: 78 }).toFile(`public/img/hero/${name}-d.webp`),
    desk.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(`public/img/hero/${name}-d.jpg`),
    mob.clone().avif({ quality: 62, effort: 6 }).toFile(`public/img/hero/${name}-m.avif`),
    mob.clone().webp({ quality: 78 }).toFile(`public/img/hero/${name}-m.webp`),
    mob.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(`public/img/hero/${name}-m.jpg`),
  ]);

  console.log(
    `${name.padEnd(11)} land ${lm.width}x${lm.height} port ${pm.width}x${pm.height}  ->  ` +
      `desktop ${da.width}x${da.height} avif ${kb(da.size)} webp ${kb(dw.size)} jpg ${kb(dj.size)}  |  ` +
      `mobile ${ma.width}x${ma.height} avif ${kb(ma.size)} webp ${kb(mw.size)} jpg ${kb(mj.size)}`,
  );
}
