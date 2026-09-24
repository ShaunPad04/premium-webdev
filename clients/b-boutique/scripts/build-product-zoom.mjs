#!/usr/bin/env node
/* The zoom files (2026-09-24, Brad: "elite" galleries). The product page
 * zooms a photograph ~1.9x under the cursor and opens it full screen on a
 * phone. The largest listing step is 1280px, which is soft at that scale, so
 * each source also gets one file at its NATIVE width (1856 or 2048), AVIF and
 * WebP only. They are fetched on the first hover or tap, never on page load,
 * so they cost nothing until somebody asks to look closer. The JPEG fallback
 * is the listing's 1280 file. */
import sharp from "sharp";
import { readdir } from "node:fs/promises";
import path from "node:path";

const SRC = "assets/product";
const OUT = "public/img/product";
const AVIF = { quality: 62, effort: 4 };
const WEBP = { quality: 80, effort: 4 };

const files = (await readdir(SRC)).filter((f) => f.endsWith(".webp")).sort();
let bytes = 0;
const POOL = 4;
let next = 0;
async function worker() {
  while (next < files.length) {
    const file = files[next++];
    const base = path.basename(file, ".webp");
    const src = path.join(SRC, file);
    const [a, w] = await Promise.all([
      sharp(src).avif(AVIF).toFile(path.join(OUT, `${base}-z.avif`)),
      sharp(src).webp(WEBP).toFile(path.join(OUT, `${base}-z.webp`)),
    ]);
    bytes += a.size + w.size;
  }
}
await Promise.all(Array.from({ length: POOL }, worker));
console.log(`${files.length} photographs, ${(bytes / 1048576).toFixed(1)} MB of zoom files`);
