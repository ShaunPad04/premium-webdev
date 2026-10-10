#!/usr/bin/env python3
"""Compose a cut-out figure onto the catalogue's white set.

Every product photograph on the site is 1856x2304, pure white, with the
model's head at y=172 and feet at about y=2180-2195, centred, with a faint
contact shadow fading out within ~20px below the feet (measured from
bb-stripecardi-cho.webp, 2026-10-10). Earlier batches were composed with a
script that lived in a session scratchpad and was lost; this one is kept.

  python3 scripts/compose-product.py <cutout.png> assets/product/<name>.webp

The input is an RGBA cutout (Higgsfield background remover). No garment
pixel is regenerated: the figure is only scaled and placed.
"""
import sys
from PIL import Image, ImageFilter, ImageDraw
import numpy as np

W, H = 1856, 2304
HEAD_Y, FEET_Y = 172, 2188

def main(src, dst):
    im = Image.open(src).convert("RGBA")
    a = np.asarray(im)[:, :, 3]
    # Bounding box of solid pixels (ignore faint haze from the matte).
    mask = a > 40
    ys = np.where(mask.any(axis=1))[0]
    xs = np.where(mask.any(axis=0))[0]
    im = im.crop((xs[0], ys[0], xs[-1] + 1, ys[-1] + 1))
    scale = (FEET_Y - HEAD_Y) / im.height
    fig = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    x = (W - fig.width) // 2
    canvas = Image.new("RGBA", (W, H), (255, 255, 255, 255))

    # Contact shadow: a thin dark ellipse under the feet, blurred, faint.
    fa = np.asarray(fig)[:, :, 3] > 40
    foot_rows = fa[-60:, :]
    fx = np.where(foot_rows.any(axis=0))[0]
    cx = x + (fx[0] + fx[-1]) // 2
    half = max(90, (fx[-1] - fx[0]) // 2 + 40)
    sh = Image.new("L", (W, H), 0)
    ImageDraw.Draw(sh).ellipse((cx - half, FEET_Y - 22, cx + half, FEET_Y + 14), fill=70)
    sh = sh.filter(ImageFilter.GaussianBlur(14))
    shadow = Image.new("RGBA", (W, H), (30, 24, 22, 0))
    shadow.putalpha(sh)
    canvas.alpha_composite(shadow)

    canvas.alpha_composite(fig, (x, HEAD_Y))
    out = canvas.convert("RGB")
    out.save(dst, "WEBP", quality=92, method=6)
    print(f"{dst}: figure {fig.width}x{fig.height} at x={x}, scale {scale:.3f}")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
