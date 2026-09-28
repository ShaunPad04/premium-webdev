#!/usr/bin/env python3
"""Up close photographs (components/home/UpClose.tsx).

    python3 scripts/build-fabric.py

Reads assets/fabric/<name>-wide.jpg (16:9) and <name>-tall.jpg (9:16), the
4K Higgsfield recreations of the earlier close-ups (2026-09-27: the old
1728px portraits were soft once the section went full-bleed), and writes
public/img/fabric/<name>-wide-<w>.{avif,webp,jpg} and <name>-tall-<w>... The
wide set is for landscape screens, the tall set for portrait ones.
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "fabric")
OUT = os.path.join(ROOT, "public", "img", "fabric")
SETS = {"wide": [1600, 2400, 3200], "tall": [800, 1200, 1800]}

for name in ["boucle", "fairisle", "velvet"]:
    for shape, widths in SETS.items():
        im = Image.open(os.path.join(SRC, f"{name}-{shape}.jpg")).convert("RGB")
        for w in widths:
            r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            base = os.path.join(OUT, f"{name}-{shape}-{w}")
            r.save(base + ".avif", quality=62)
            r.save(base + ".webp", quality=82, method=6)
            if w == widths[0]:
                r.save(base + ".jpg", quality=84, optimize=True, progressive=True)
        print(name, shape, "done")

"""The 3:4 cards of the tilted grid (2026-09-28): one centre crop per fabric,
at the three widths the cards need (a phone card is ~163 CSS px, a desktop
one ~380). The browser picks a srcset step by width, so a landscape source
cropped into a portrait card was chosen too small and stretched.

feather is the eighth card, cards only: GPT Image 2.5 from her own
photograph of the beige Faux Feather Sleeveless Jumper (1744x2336)."""
CARD = [600, 900, 1200]
for name in ["velvet", "boucle", "fairisle", "lace", "tweed", "knit", "velour", "feather"]:
    path = os.path.join(SRC, f"{name}-tall.jpg")
    im = Image.open(path if os.path.exists(path) else os.path.join(SRC, f"{name}.jpg")).convert("RGB")
    w, h = im.size
    cw, ch = (w, round(w * 4 / 3)) if h / w >= 4 / 3 else (round(h * 3 / 4), h)
    im = im.crop(((w - cw) // 2, (h - ch) // 2, (w - cw) // 2 + cw, (h - ch) // 2 + ch))
    for cwid in CARD:
        r = im.resize((cwid, round(cwid * 4 / 3)), Image.LANCZOS)
        base = os.path.join(OUT, f"{name}-card-{cwid}")
        r.save(base + ".avif", quality=60)
        r.save(base + ".webp", quality=80, method=6)
    print(name, "card done")
