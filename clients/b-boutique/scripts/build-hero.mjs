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
 * ── Why the mobile crop is taken here and not by the browser ──────────────
 * A 16:9 frame shown through a 100svh phone viewport is cropped to roughly
 * a third of its width by `object-fit: cover`. Left to the browser that
 * means downloading 2048px of picture to display 650 of it, and centring on
 * whatever happens to be in the middle. Every one of these photographs puts
 * the subject right of centre, so a centre crop cuts her in half.
 *
 * So each slide carries `subject`, the horizontal position of the person as
 * a fraction of the frame, and the portrait crop is taken around it.
 *
 * Known cost, stated rather than hidden: the portrait crop is 648x1152 out
 * of the 2048x1152 source. A 390px viewport at DPR 2 wants ~780px, so these
 * are about 17% under what a high-density phone would like. They are not
 * upscaled to hide that — upscaling adds bytes without adding detail. The
 * fix, if it matters later, is to outpaint each source to 9:16 the way
 * `1-paris` already was for the single-image hero; that costs credits and
 * has not been spent on the other four.
 *
 *   node scripts/build-hero.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

await mkdir("public/img/hero", { recursive: true });

/* `subject` is where the person's head sits across the frame, 0 = left edge,
 * 1 = right edge. Read off each photograph by eye and then checked against
 * the rendered page at 390px — a wrong value here crops someone's face off
 * on every phone, and it is invisible on a desktop screenshot. */
const slides = [
  { src: "assets/hero/1-paris.png", out: "1-paris", subject: 0.52 },
  { src: "assets/hero/2-street.png", out: "2-street", subject: 0.55 },
  { src: "assets/hero/3-terrace.png", out: "3-terrace", subject: 0.55 },
  { src: "assets/hero/4-flowers.png", out: "4-flowers", subject: 0.5 },
  { src: "assets/hero/5-sea.png", out: "5-sea", subject: 0.68 },
];

const DESKTOP_W = 1800;
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

for (const { src, out, subject } of slides) {
  const meta = await sharp(src).metadata();

  /* Desktop: the frame as shot, just resized. */
  const desk = sharp(src).resize({ width: DESKTOP_W, withoutEnlargement: true });

  /* Mobile: a 9:16 window taken around the subject, clamped so it cannot
     run off either edge of the source. */
  const cropW = Math.round((meta.height * 9) / 16);
  const left = Math.max(
    0,
    Math.min(meta.width - cropW, Math.round(meta.width * subject - cropW / 2)),
  );
  const mob = sharp(src).extract({ left, top: 0, width: cropW, height: meta.height });

  const [da, dw, dj, ma, mw, mj] = await Promise.all([
    desk.clone().avif({ quality: 62, effort: 6 }).toFile(`public/img/hero/${out}-d.avif`),
    desk.clone().webp({ quality: 78 }).toFile(`public/img/hero/${out}-d.webp`),
    desk.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(`public/img/hero/${out}-d.jpg`),
    mob.clone().avif({ quality: 62, effort: 6 }).toFile(`public/img/hero/${out}-m.avif`),
    mob.clone().webp({ quality: 78 }).toFile(`public/img/hero/${out}-m.webp`),
    mob.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(`public/img/hero/${out}-m.jpg`),
  ]);

  console.log(
    `${out.padEnd(11)} ${meta.width}x${meta.height}  ` +
      `desktop ${da.width}x${da.height} avif ${kb(da.size)} webp ${kb(dw.size)} jpg ${kb(dj.size)}  |  ` +
      `mobile ${ma.width}x${ma.height} avif ${kb(ma.size)} webp ${kb(mw.size)} jpg ${kb(mj.size)}`,
  );
}
