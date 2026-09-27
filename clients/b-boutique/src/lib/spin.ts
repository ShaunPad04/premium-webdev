import "server-only";

import { readdirSync } from "node:fs";
import path from "node:path";

/* Turntable frames for a piece, found on disk: public/img/spin/<slug>/NN.webp
 * (on white, for the product page) or public/img/spin/<slug>/hero/NN.webp
 * (transparent, for the home hero). No folder, no turn. `generated` is true
 * while public/img/spin/<slug>/GENERATED exists: the frames are AI-made and
 * the page has to say so until the client checks the back of the piece. */
export function spinFor(slug: string, sub = "") {
  try {
    const base = path.join(process.cwd(), "public/img/spin", slug);
    const files = readdirSync(path.join(base, sub));
    const frames = files
      .filter((f) => /^\d+\.webp$/.test(f))
      .sort()
      .map((f) => `/img/spin/${slug}/${sub ? `${sub}/` : ""}${f}`);
    return frames.length > 1 ? { frames, generated: readdirSync(base).includes("GENERATED") } : null;
  } catch {
    return null;
  }
}
