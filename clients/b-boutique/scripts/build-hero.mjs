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

const slides = ["horses", "silk", "rail", "ribbon", "shore"];

/* ── 2026-09-21, second correction: stop downscaling below the source ──────
 *
 * These were 1800 and 1100, chosen to match what the single-image hero had
 * shipped before the slideshow, so the comparison against it could not
 * flatter. That guard did its job — but matching the old number is not the
 * same as being right, and it left real pixels on the floor: the landscape
 * sources are 2048 wide and the portrait ones 1536, so every slide was being
 * thrown away at 88% and 72% respectively before it was ever encoded.
 *
 * It shows on a high-DPR display, which is most of them. A full-bleed hero on
 * a DPR-2 laptop at 1440 CSS px wants 2880 device pixels across; 1800 is 62%
 * of that and reads soft. 2048 was 71% — still short, and it was as far as
 * the source went.
 *
 * ── 2026-09-22: the source is no longer the ceiling ──────────────────────
 * The five landscape frames were upscaled to 4096x2304, so the 2880 a retina
 * laptop asks for is now covered with headroom rather than missed by 29%.
 * 3840 rather than the full 4096: it clears 2880 comfortably, it is still a
 * genuine DOWNSCALE from the source so nothing is interpolated up, and the
 * last 256px would cost bytes on every desktop load to serve a display size
 * almost nobody has.
 *
 * The upscale was checked both ways before it was accepted, and it is not
 * lossless — the report is in the commit. Short version: faces are intact and
 * genuinely sharper, fine repeating detail is REGENERATED rather than
 * sharpened, and on 4-flowers the bouquet is visibly a different bouquet.
 * That is tolerable here only because these frames are campaign imagery and
 * not a photograph of the shop, the stock or anyone real. The same tool must
 * not be pointed at a product shot on that reasoning.
 *
 * The phone case is unchanged and was already covered: 1536 against the 1170
 * device pixels a DPR-3 390px phone asks for. The portrait sources are still
 * 1536x2752 and were NOT upscaled, because at that width there is no gap to
 * close — the mobile files were never the complaint.
 *
 * The caps below are a ceiling, not a target. `withoutEnlargement` means a
 * source smaller than the cap is used at its own size and never stretched. */
/* 2026-09-24, Brad: "not 4K, slightly blurry". Measured at 1920 against
   the source: the horses at AVIF q56 4:2:0 were PSNR 31.1 dB, the red field
   smeared by chroma subsampling; q74 4:4:4 is 37.0 dB. Qualities below were
   raised and chroma kept full on every step. Desktop files grow (horses
   1920: 359 -> ~700 KB); the phone's first frame is the silk, so the phone
   LCP path is not the one paying. */
const DESKTOP_W = 3840;
const MOBILE_W = 1536;
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

for (const name of slides) {
  /* PNG or a quality-95 JPEG: the 2026-09-24 frames are 5120px Seedream
     renders, ~15 MB each as PNG, and are kept as JPEG to spare the repo. */
  const src = (base) => (existsSync(`${base}.png`) ? `${base}.png` : `${base}.jpg`);
  const land = src(`assets/hero/${name}`);
  const port = src(`assets/hero/${name}-portrait`);

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
    desk.clone().avif({ quality: 74, effort: 6, chromaSubsampling: "4:4:4" }).toFile(`public/img/hero/${name}-d.avif`),
    desk.clone().webp({ quality: 86, smartSubsample: true }).toFile(`public/img/hero/${name}-d.webp`),
    desk.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(`public/img/hero/${name}-d.jpg`),
    /* 54 for the phone, not 62, and it was measured both ways.
     *
     * Resolution and compression are different things, and only the first
     * one was ever the client's complaint: he said the hero "should look
     * 1080p", and the fix for that was raising these from 1100px to the
     * source's full 1536px. That width is untouched here.
     *
     * What changes is how hard the encoder works, and the curve at 1536px
     * is lopsided — q62 is 267 KB at 37.51 dB, q54 is 139 KB at 36.26 dB.
     * Half the bytes for 1.25 dB, on the one image that gates LCP.
     *
     * Checked for the failure modes rather than trusted to PSNR, which can
     * miss the thing that actually shows: mean absolute difference 2.28/255
     * (0.9%), only 1.4% of subpixels differing by more than 8/255, and —
     * the one that matters for this photograph — 80 flat 32px cells
     * sampled, worst difference inside any of them 6/255. Large flat areas
     * of saturated colour band before detailed regions do, and the red
     * Paris door is exactly that; it does not band.
     *
     * And it was looked at. Face, hair, skin texture and the street plaque
     * are indistinguishable at 1:1.
     *
     * The desktop file stays at 62: it is 100-150 KB already, it is not
     * what the mobile LCP waits on, and there is nothing to buy there. */
    mob.clone().avif({ quality: 62, effort: 6, chromaSubsampling: "4:4:4" }).toFile(`public/img/hero/${name}-m.avif`),
    mob.clone().webp({ quality: 78 }).toFile(`public/img/hero/${name}-m.webp`),
    mob.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(`public/img/hero/${name}-m.jpg`),
  ]);
  /* A phone-sized portrait (2026-09-23). The 1536px portrait was going to
     every phone; a 412px screen at 1.75x shows ~805 device pixels across
     the cover crop, so most phones get this 900px one via srcset and only
     3x screens still ask for 1536. Measured, not assumed: see CLAUDE.md. */
  const small = sharp(port).resize({ width: 900, withoutEnlargement: true });
  await Promise.all([
    /* 46, not 54 (2026-09-23): the MADRID frame is a dense red texture
       and cost 154 KB at 54, which measured as a later simulated LCP than
       the frame it replaced. 46 is 101 KB, PSNR 33.4 vs 35.4 dB, and no
       difference could be seen at 2x zoom. */
    small.clone().avif({ quality: 58, effort: 6, chromaSubsampling: "4:4:4" }).toFile(`public/img/hero/${name}-s.avif`),
    small.clone().webp({ quality: 70 }).toFile(`public/img/hero/${name}-s.webp`),
  ]);

  /* A 1200 phone step (2026-09-23): with a 4K source the 1536 phone file
     is ~460 KB, and a DPR 2.6-3 phone (1071-1170 device px) was being sent
     it. 1200 at q46 covers those screens at a fraction of the weight. */
  {
    const mid = sharp(port).resize({ width: 1200, withoutEnlargement: true });
    await Promise.all([
      mid.clone().avif({ quality: 58, effort: 6, chromaSubsampling: "4:4:4" }).toFile(`public/img/hero/${name}-s1200.avif`),
      mid.clone().webp({ quality: 70 }).toFile(`public/img/hero/${name}-s1200.webp`),
    ]);
  }

  /* ── Desktop steps below 4K (2026-09-23) ──────────────────────────────
     The hero became a true 4K frame (4096 source) at Brad's request, and
     the 3840 AVIF alone is ~1.2 MB of dense red texture. A 1440 laptop at
     DPR 1 needs 1440 px, not 3840, so desktops get a srcset: 1920 and 2560
     steps, with the full 3840 kept for retina and 4K screens. */
  for (const w of [1920, 2560]) {
    const step = sharp(land).resize({ width: w, withoutEnlargement: true });
    await Promise.all([
      step.clone().avif({ quality: 74, effort: 6, chromaSubsampling: "4:4:4" }).toFile(`public/img/hero/${name}-d${w}.avif`),
      step.clone().webp({ quality: 86, smartSubsample: true }).toFile(`public/img/hero/${name}-d${w}.webp`),
    ]);
  }

  console.log(
    `${name.padEnd(11)} land ${lm.width}x${lm.height} port ${pm.width}x${pm.height}  ->  ` +
      `desktop ${da.width}x${da.height} avif ${kb(da.size)} webp ${kb(dw.size)} jpg ${kb(dj.size)}  |  ` +
      `mobile ${ma.width}x${ma.height} avif ${kb(ma.size)} webp ${kb(mw.size)} jpg ${kb(mj.size)}`,
  );
}
