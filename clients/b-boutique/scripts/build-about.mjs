/* The About page's photographs: assets/about/*  ->  public/img/about/*.
 *
 * Run: node scripts/build-about.mjs
 *
 * Two kinds of source, kept apart on purpose:
 *
 *   REAL — the client's own photographs of 18 Sea View Street (phone
 *   frames, 3840x2160). Each is cropped here rather than in an editor so the
 *   crop is reviewable in a diff. Two crops remove things that are not the
 *   shop: the ring light on the left of the fitting-room frame, and a
 *   passer-by at the right edge of the mustard-wall frame. The shopfront
 *   frame is deliberately NOT used: its fascia reads "Accessories &
 *   Homeware", and Accessories came off the site on 2026-09-22.
 *
 *   TEXTURE — two abstract macros generated with Higgsfield on 2026-09-22 at
 *   the client's request (black marble with gold veining, cream boucle).
 *   Neither contains a shop, a product or a person, so neither can say
 *   anything untrue about the business. They echo the real shop's walls and
 *   its knitwear rail; they never stand in for either.
 *
 * Encoding is deterministic, so re-running changes no existing file. */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "assets/about";
const OUT = "public/img/about";

/* crop: [left, top, width, height] in source pixels, or null for the whole
   frame. widths: the encoded sizes, capped at what the crop can supply. */
const JOBS = [
  { src: "04-rails.jpg", out: "rails", crop: null, widths: [1280, 1920, 2560] },
  { src: "02-walkin.jpg", out: "walkin", crop: [1700, 0, 1728, 2160], widths: [640, 960, 1280] },
  { src: "05-fitting.jpg", out: "fitting", crop: [540, 0, 1728, 2160], widths: [640, 960, 1280] },
  { src: "06-mustard.jpg", out: "mustard", crop: [460, 0, 3226, 2150], widths: [960, 1440, 1920] },
  { src: "07-window.jpg", out: "window", crop: [300, 0, 2160, 2160], widths: [640, 960, 1280] },
  { src: "03-homeware.jpg", out: "homeware", crop: [1000, 260, 1536, 1024], widths: [640, 960, 1280] },
  { src: "texture-marble.png", out: "marble", crop: null, widths: [1024] },
  { src: "texture-boucle.png", out: "boucle", crop: null, widths: [640, 960, 1280] },
];

await mkdir(OUT, { recursive: true });

for (const job of JOBS) {
  const input = sharp(path.join(SRC, job.src));
  const meta = await input.metadata();
  const base = job.crop
    ? input.extract({ left: job.crop[0], top: job.crop[1], width: job.crop[2], height: job.crop[3] })
    : input;
  const srcW = job.crop ? job.crop[2] : meta.width;
  const buf = await base.toBuffer();

  for (const w of job.widths) {
    const width = Math.min(w, srcW);
    const img = () => sharp(buf).resize({ width, withoutEnlargement: true });
    const stem = path.join(OUT, `${job.out}-${w}`);
    await img().avif({ quality: 55, effort: 6 }).toFile(`${stem}.avif`);
    await img().webp({ quality: 80, effort: 6 }).toFile(`${stem}.webp`);
    await img().jpeg({ quality: 82, mozjpeg: true, progressive: true }).toFile(`${stem}.jpg`);
  }
  const { width, height } = await sharp(buf).metadata();
  console.log(`${job.out}: ${width}x${height} -> ${job.widths.join(", ")}`);
}
