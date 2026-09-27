#!/usr/bin/env python3
"""Stacked-alpha turn video for the home hero (HeroTurn.tsx).

    python3 scripts/build-turn-video.py <cutout-dir> <out-dir> [--fps 24] [--ffmpeg PATH]

<cutout-dir> holds transparent PNG/WebP frames of one full turn, in order
(000.png, 001.png, ...). Writes to <out-dir>:

    turn.mp4    H.264, twice as tall as the picture: her colour in the top
                half, her cut-out mask (white = her) in the bottom half.
                HeroTurn's shader puts the two back together, so she is
                see-through on every browser, iPhones included (Safari
                cannot play video with a real alpha channel).
    turn.webm   the same, VP9, for browsers without H.264 (open-source
                Chromium, some Linux builds). The page offers both.
    poster.webp the first frame, transparent: the hero's first paint.

Every frame is cropped to one box, the union of where she is across the
whole turn plus a margin, so she fills the picture and never jumps. Needs
Pillow and an ffmpeg binary (imageio-ffmpeg's works).

The cut-outs for the Fair Isle Jumper were made from
assets/spin/fair-isle-jumper/turn-seedance-2.5-1080p.mp4, frames 0-183
(one full turn), with rembg birefnet-general, mask computed at 768 wide.
"""
import argparse, os, shutil, subprocess, sys, tempfile
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("out")
ap.add_argument("--fps", type=int, default=24)
ap.add_argument("--height", type=int, default=1120, help="height of one half")
ap.add_argument("--ffmpeg", default=shutil.which("ffmpeg") or "ffmpeg")
a = ap.parse_args()

files = sorted(f for f in os.listdir(a.src) if f.lower().endswith((".png", ".webp")))
if not files: sys.exit("no frames")

L = T = 10**9; R = B = 0
for f in files:
    bb = Image.open(os.path.join(a.src, f)).getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox()
    if bb: L, T, R, B = min(L, bb[0]), min(T, bb[1]), max(R, bb[2]), max(B, bb[3])
W0, H0 = Image.open(os.path.join(a.src, files[0])).size
pad = 24
box = (max(0, L - pad), max(0, T - pad), min(W0, R + pad), min(H0, B + pad))
h = a.height
w = round((box[2] - box[0]) * h / (box[3] - box[1]) / 2) * 2   # even, for H.264
print("crop", box, "->", w, "x", h, "per half")

os.makedirs(a.out, exist_ok=True)
tmp = tempfile.mkdtemp()
for i, f in enumerate(files):
    im = Image.open(os.path.join(a.src, f)).convert("RGBA").crop(box).resize((w, h), Image.LANCZOS)
    alpha = im.getchannel("A")
    # Colour under the fully transparent pixels does not matter (the shader
    # multiplies by alpha), but a neutral grey there keeps H.264 from
    # smearing the old studio into her edges.
    rgb = Image.new("RGB", (w, h), (128, 128, 128)); rgb.paste(im.convert("RGB"), mask=alpha)
    stack = Image.new("RGB", (w, h * 2)); stack.paste(rgb, (0, 0)); stack.paste(Image.merge("RGB", (alpha,) * 3), (0, h))
    stack.save(os.path.join(tmp, f"{i:04d}.png"))
    if i == 0:
        im.save(os.path.join(a.out, "poster.webp"), quality=86, method=6)

subprocess.run([a.ffmpeg, "-y", "-loglevel", "error", "-framerate", str(a.fps), "-i", os.path.join(tmp, "%04d.png"),
                "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-profile:v", "high",
                "-movflags", "+faststart", "-an", os.path.join(a.out, "turn.mp4")], check=True)
subprocess.run([a.ffmpeg, "-y", "-loglevel", "error", "-framerate", str(a.fps), "-i", os.path.join(tmp, "%04d.png"),
                "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "34", "-row-mt", "1", "-pix_fmt", "yuv420p", "-an",
                os.path.join(a.out, "turn.webm")], check=True)
shutil.rmtree(tmp)
print("wrote", len(files), "frames ->", os.path.join(a.out, "turn.mp4"), os.path.getsize(os.path.join(a.out, "turn.mp4")) // 1024, "KB")
