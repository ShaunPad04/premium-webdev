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
 *   TEXTURE — generated with Higgsfield at the client's request: a cream
 *   boucle macro (2026-09-22) and the hero, a vintage brass rail with four
 *   garments against dark marble (2026-09-23; the client: "it doesn't need
 *   to be an interior of her shop"). Neither shows her shop, a product she
 *   sells or a person, so neither can say anything untrue about the
 *   business, and both carry alt="" on the page. (A black
 *   and gold marble texture was also made; its section was removed on
 *   2026-09-23 at the client's request, and the texture with it.)
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
  /* The About hero since 2026-09-23: a generated vintage still life (see
     TEXTURE above). 04-rails, the hero before it, stays in assets/ unbuilt. */
  { src: "texture-vintage-rail.jpg", out: "vintage", crop: null, widths: [1280, 1920, 2560] },
  /* Her shop photographs, replaced on 2026-09-23 with a new set Brad sent
     (uploaded to Higgsfield and upscaled 2x there, faithfully, because the
     copies that reached us were ~855px wide). The shopfront was edited in
     Higgsfield at his request: the SumUp web address on the fascia now
     reads bboutiqueclee.com and the outside paintwork is tidied; nothing
     inside the window was changed. */
  { src: "11-shopfront-edited.jpg", out: "shopfront", crop: null, widths: [640, 960, 1024], photo: true },
  { src: "08-rail-window.jpg", out: "rail-window", crop: null, widths: [960, 1440, 1920], photo: true },
  { src: "09-back.jpg", out: "back", crop: null, widths: [960, 1440, 1920], photo: true },
  { src: "10-back-counter.jpg", out: "counter", crop: null, widths: [960, 1440, 1920], photo: true },
  { src: "texture-boucle.png", out: "boucle", crop: null, widths: [640, 960, 1280] },
];

await mkdir(OUT, { recursive: true });

/* `node scripts/build-about.mjs vintage` rebuilds just the named outputs. */
const only = process.argv.slice(2);
for (const job of JOBS.filter((j) => only.length === 0 || only.includes(j.out))) {
  const input = sharp(path.join(SRC, job.src));
  const meta = await input.metadata();
  const base = job.crop
    ? input.extract({ left: job.crop[0], top: job.crop[1], width: job.crop[2], height: job.crop[3] })
    : input;
  const srcW = job.crop ? job.crop[2] : meta.width;
  const buf = await base.toBuffer();

  for (const w of job.widths) {
    const width = Math.min(w, srcW);
    const img = () => {
      const r = sharp(buf).resize({ width, withoutEnlargement: true });
      return job.photo ? r.sharpen({ sigma: 0.7 }) : r;
    };
    const q = job.photo ? { avif: 62, webp: 85, jpeg: 87 } : { avif: 55, webp: 80, jpeg: 82 };
    const stem = path.join(OUT, `${job.out}-${w}`);
    await img().avif({ quality: q.avif, effort: 6 }).toFile(`${stem}.avif`);
    await img().webp({ quality: q.webp, effort: 6 }).toFile(`${stem}.webp`);
    await img().jpeg({ quality: q.jpeg, mozjpeg: true, progressive: true }).toFile(`${stem}.jpg`);
  }
  const { width, height } = await sharp(buf).metadata();
  console.log(`${job.out}: ${width}x${height} -> ${job.widths.join(", ")}`);
}
