// Turntable frames for Spin360, from transparent cut-outs.
//   node scripts/build-spin.mjs assets/spin/<slug>/cutouts public/img/spin/<slug>
// Cut-outs onto pure white with ONE soft floor shadow, identical in every
// frame (median feet position across the set) so it never jitters.
// See assets/spin/fair-isle-jumper/README.md for how the cut-outs were made.
//
// --transparent (2026-09-27, the hero turn): keep the alpha, no white and no
// baked shadow (the page draws its own ground shadow), 1248 tall so she can
// stand most of a screen high:
//   node scripts/build-spin.mjs assets/spin/<slug>/cutouts public/img/spin/<slug>/hero --transparent
import { createRequire } from "node:module";
import { readdirSync } from "node:fs";
const require = createRequire(process.cwd() + "/package.json");
const sharp = require("sharp");
const [cutDir, outDir, flag] = process.argv.slice(2);
const transparent = flag === "--transparent";
const files = readdirSync(cutDir).filter((f) => /^\d\d\.(png|webp)$/.test(f)).sort();

const feet = [];
for (const f of files) {
  const { data, info } = await sharp(`${cutDir}/${f}`).extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  let bottom = 0;
  for (let y = info.height - 1; y >= 0 && !bottom; y--)
    for (let x = 0; x < info.width; x++) if (data[y * info.width + x] > 128) { bottom = y; break; }
  let minX = info.width, maxX = 0;
  for (let y = bottom - 40; y <= bottom; y++)
    for (let x = 0; x < info.width; x++) if (data[y * info.width + x] > 128) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
  feet.push({ bottom, cx: (minX + maxX) / 2, w: info.width, h: info.height });
}
const med = (k) => feet.map((f) => f[k]).sort((a, b) => a - b)[feet.length >> 1];
const W = feet[0].w, H = feet[0].h, by = med("bottom"), cx = med("cx");
console.log("feet bottom", by, "centre", cx, "range", Math.min(...feet.map((f) => f.bottom)), Math.max(...feet.map((f) => f.bottom)));

const rx = W * 0.14, ry = W * 0.018;
const shadow = await sharp(Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><ellipse cx="${cx}" cy="${by - ry * 0.3}" rx="${rx}" ry="${ry}" fill="#000" fill-opacity="0.16"/></svg>`,
)).blur(18).png().toBuffer();

if (transparent) {
  const { mkdirSync } = await import("node:fs");
  mkdirSync(outDir, { recursive: true });
  // One crop for every frame: the union of where she is across the turn,
  // plus a margin, so she fills the box and never jumps between frames.
  let L = Infinity, T = Infinity, R = 0, B = 0;
  for (const f of files) {
    const { data, info } = await sharp(`${cutDir}/${f}`).extractChannel(3).raw().toBuffer({ resolveWithObject: true });
    for (let y = 0; y < info.height; y++)
      for (let x = 0; x < info.width; x++)
        if (data[y * info.width + x] > 24) { if (x < L) L = x; if (x > R) R = x; if (y < T) T = y; if (y > B) B = y; }
  }
  const pad = 24;
  const box = { left: Math.max(0, L - pad), top: Math.max(0, T - pad), width: Math.min(W, R + pad) - Math.max(0, L - pad), height: Math.min(H, B + pad) - Math.max(0, T - pad) };
  console.log("crop", box);
  for (const f of files) {
    await sharp(`${cutDir}/${f}`)
      .extract(box)
      .resize({ height: 1248, kernel: "lanczos3", withoutEnlargement: true })
      .webp({ quality: 80, alphaQuality: 90 })
      .toFile(`${outDir}/${f.replace(/\.(png|webp)$/, ".webp")}`);
  }
  console.log("wrote", files.length, "transparent");
  process.exit(0);
}

for (const f of files) {
  // sharp composites after resizing whatever the chain order, so flatten first.
  const full = await sharp({ create: { width: W, height: H, channels: 3, background: "#ffffff" } })
    .composite([{ input: shadow }, { input: `${cutDir}/${f}` }])
    .png()
    .toBuffer();
  await sharp(full)
    .resize({ width: 960, kernel: "lanczos3" })
    .webp({ quality: 84 })
    .toFile(`${outDir}/${f.replace(/\.(png|webp)$/, ".webp")}`);
}
console.log("wrote", files.length);
