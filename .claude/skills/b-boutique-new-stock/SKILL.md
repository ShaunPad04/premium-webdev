---
name: b-boutique-new-stock
description: Take new pieces from the B Boutique Stock Book artifact (Hayley's supplier link, price, colours and counts) all the way onto bboutiqueclee.com — supplier photos through Higgsfield onto the catalogue's white set, stocklist and opening counts, build, checks, a video preview for Brad, then push on his green light and mark the book. Use when asked to add new stock, process the stock book, or "add the new pieces to the website".
---

# B Boutique: new stock, from the book to the site

Everything below was done by hand on 2026-10-10 for four pieces and is
recorded in `clients/b-boutique/CLAUDE.md` ("New stock — 2026-10-10"). This
skill makes it repeatable. Work in `clients/b-boutique`.

## 0. The two hard rules

- **Prices and counts are what Hayley wrote.** Never second-guess a price
  against an older figure in the code; Brad's instruction, 2026-10-10.
- **Nothing is pushed until Brad has seen the video and said go.** The
  branch `client/b-boutique` deploys straight to production.

## 1. Read the book

The Stock Book is the artifact at https://claude.ai/artifact/Bu51nWcdC7QeRtQgXEKUce
(db collection `pieces`). With the `ArtifactData` tool:

```
query  url=<artifact url>  collection=pieces  query={"where":[["status","==","new"]]}
```

Each doc: `url` (supplier page), `name` (optional), `pricePence`,
`colours: [{colour, qty, sizes}]`, `notes`, `answer` (her reply to an
earlier question), `createdAt`, `status`.

If something is missing or contradictory (no sizes on a sized run, a colour
the supplier does not list, a price that is clearly a typo), do NOT guess:
`update` the doc with `status: "question"` and `reply: "<the question in
plain words>"`, and move on to the next piece. Her answer comes back as
`answer` with `status: "new"`.

## 2. The supplier page

Fetch it with curl (`-A "Mozilla/5.0"`). Babez London is BigCommerce: the
description block gives Style Number, Available Colours, Fabric
(composition with percentages → `fabricPublished: true`), Pack and Ratio.
Photos: `stencil/1920w/products/.../<style>-<Colour>__*.jpg`. Map her colour
names to the supplier's files (she says Green, the file says Khaki; she
says Chocolate, the file says Brown) and SAY which mapping you made in the
stocklist comment. Where files are unnamed (IMG_0558…), look at each one.

Sizes: her `sizes` text wins. If she gave only a total and the supplier's
pack ratio divides it exactly (3 = 1xS 1xM 1xL), use the pack split and
note it; otherwise ask (step 1).

## 3. Photos through Higgsfield (MCP tools), then compose

Per colourway photo:

1. `media_upload` → `curl -X PUT` the file → `media_confirm`.
2. If the file is under ~1100px wide: `upscale_image` (bytedance, 2k).
   It fails sometimes; just resubmit.
3. If the shot stops at the thigh/knee: `outpaint_image` aspect `9:16`.
   The model tends to put the shoes on the bottom edge; check the cutout's
   bottom row later, and if it is solid, crop the frame to just below the
   garment and outpaint again. Three tries, then accept hems at the floor.
4. `remove_background` (image) on the result.
5. Download the PNG and run
   `python3 scripts/compose-product.py <cutout.png> assets/product/<image>.webp`
   (scales the figure to head 172 / feet 2188 on white 1856x2304 with the
   measured contact shadow; no garment pixel is regenerated).
6. `node scripts/build-product.mjs <image> …` and
   `node scripts/build-product-zoom.mjs <image> …` (names, no extension).

Image names: `bb-<short>-<col>` (e.g. `bb-checkbarrel-brn`). Look at every
composed photo beside an existing one before moving on.

## 4. Data

- `src/lib/stocklist.ts`: append the piece LAST (New arrivals and Shop the
  collection read from the top and stay as they are). Fields as the
  2026-10-10 entries; `priceConfirmed: true`; a dated comment naming the
  source and any colour-name mapping.
- `src/data/opening-stock.json`: `opening[slug][colour] = total`. Sized
  runs: `statedSizesByColour[slug][colour] = {S: n, …}` (a size she does
  not list seeds as 0). One-size runs need only the total.
- `src/lib/catalogue.ts`: add the slug to `NOT_IN_SALE` unless she gave a
  usual price.
- `tests/accessibility.spec.ts`: the "coat" search count goes up by one per
  new Coats & Jackets piece.
- `CLAUDE.md`: a dated section, same shape as 2026-10-10.

## 5. Check, preview, wait

```
pnpm typecheck && pnpm build && pnpm launch-check
pnpm start &   # then
BB_SERVER_OWNED=1 pnpm test:a11y
node scripts/new-stock-preview.mjs <slug> …   # then ffmpeg → mp4
```
Known local flakes: the mobile search contrast test (passes on rerun) and
"Back returns to exactly where you were" (fails on HEAD on this Mac too).

Send Brad the MP4 (SendUserFile) with the table of pieces, prices and
counts. STOP and wait for his go.

## 6. Push and close the loop

On his go: commit (message in the 2026-10-10 shape, Co-Authored-By line),
`git push origin client/b-boutique`, wait for the product pages to answer
200 on bboutiqueclee.com, then for each piece `update` its book doc:
`status: "done"`, `productUrl: "https://bboutiqueclee.com/shop/<slug>"`,
`updatedAt`. If Vercel reports `git_info_fail`, the deploy died before
building: ask Brad to press Redeploy in the dashboard.
