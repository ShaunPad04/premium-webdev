# Fair Isle Jumper turntable — sources

Made 2026-09-26 for the drag-to-turn viewer (`src/components/Spin360.tsx`) on
`preview/radian-study`. **AI-generated, not photographed.** The back of the
jumper is the model's guess until the client checks it against the garment;
`public/img/spin/fair-isle-jumper/GENERATED` keeps the page saying so.

## What is here

| Path | What | Made with |
|---|---|---|
| `angles/045…315-*.png` | Seven angle stills, 1792×2240. `180-back.png` is cut out and flattened onto white; the rest came back white. | GPT Image 2.5, high, 2K, 2.75 cr each, referencing the live product photo `bb-fairisle-bei-1280.jpg` (the front, 0°) |
| `turn-seedance-2.5-1080p.mp4` | The turn: 8 s, 1248×1664, 24 fps, 193 frames | Seedance 2.5 omni_reference, 1080p, high bitrate, 96 cr. Start and end image = the product photo; the seven angles as references |
| `cutouts/00…35.webp` | The 36 picked frames, background removed, transparent, lossless | Higgsfield image background remover, 1 cr each |

Seedance ignored the white references and rendered a grey studio, which is
why the frames were cut out rather than used straight.

## Frame picks

The clip does not turn at a constant speed (it dwells at the back and at the
end), so frames were picked by ANGLE, anchored every 45°:

| Angle | 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315 | 360 |
|---|---|---|---|---|---|---|---|---|---|
| Video frame | 0 | 22 | 46 | 66 | 90 | 114 | 138 | 162 | 184 |

Linear between anchors, one pick per 10°:

`0 5 10 15 20 25 30 35 41 46 50 55 59 64 69 74 79 85 90 95 101 106 111 117 122 127 133 138 143 149 154 159 164 169 174 179`

## Rebuilding the page frames

From `clients/b-boutique`:

    node scripts/build-spin.mjs assets/spin/fair-isle-jumper/cutouts public/img/spin/fair-isle-jumper

Pure white, one soft floor shadow at the median feet position (identical in
every frame), 960 wide, WebP q84. To change the shadow or the size, change the
script and re-run; no credits needed.
