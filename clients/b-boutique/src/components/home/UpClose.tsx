import { showDrafts } from "@/lib/drafts";

/* Up close (2026-09-24, Brad): a little about the clothes, and the cloth
 * itself. One 21:9 close-up fills the screen; scrolling zooms out to show
 * six more around it (after 21st.dev's "Zoom Parallax").
 *
 * Built on a CSS scroll timeline, no JavaScript: each frame scales from its
 * own start size down to 1 as the tall track passes, transform only. Where
 * scroll timelines are not supported, or motion is reduced, it is simply
 * the finished collage.
 *
 * The photographs are GENERATED macro shots (Higgsfield seedream_v4_5) using
 * each piece's own product photograph as the reference, so they are drafts
 * awaiting Hayley's approval and the section renders on previews only.
 * The fabric words are the stocklist's own (lib/stocklist.ts `fabric`).
 * CLIENT INPUT REQUIRED: Hayley to approve the close-ups, or supply her own.
 * Known liberty: the cardigan close-up shows one large flower where the real
 * piece has several small ones. Sources in assets/fabric/. */

const FRAMES = [
  { src: "knit", piece: "Chunky Knit Flower Cardigan", fabric: "chunky hand-knit texture with embroidered detail" },
  { src: "boucle", piece: "Cosy Hooded Boucle Coat", fabric: "soft curly boucle" },
  { src: "fairisle", piece: "Fair Isle Jumper", fabric: "a knitted-in jacquard yoke" },
  { src: "tweed", piece: "Check Tweed Shirt", fabric: "a soft brushed woven check" },
  { src: "velvet", piece: "Leopard Embroidered Velvet Bomber", fabric: "velvet with metallic embroidery" },
  { src: "lace", piece: "Lace Blouse With Layered Ruffle", fabric: "lace with a layered ruffle" },
  { src: "velour", piece: "Velour Lounge Set", fabric: "velour with a short plush pile" },
];

/* The centre frame opens full-screen, so it also has a 3000px step. */
const set = (src: string, i: number, ext: string) =>
  [1000, 2000, ...(i === 0 ? [3000] : [])].map((w) => `/img/fabric/${src}-${w}.${ext} ${w}w`).join(", ");

export function UpClose() {
  if (!showDrafts) return null;
  return (
    <section className="uc" aria-labelledby="uc-h">
      <div className="uc-head">
        <h2 id="uc-h" className="uc-h">Up close</h2>
        <p className="uc-p">
          Soft curly boucle, a knitted-in jacquard yoke, velvet with metallic
          embroidery. Carefully selected pieces that are stylish, affordable
          and made to be touched, so come in and feel them.
        </p>
        <p className="draft-flag">Draft: generated close-ups of real pieces, Hayley to approve before this goes live</p>
      </div>
      <div className="uc-track">
        <div className="uc-sticky">
          {FRAMES.map((f, i) => (
            <div key={f.src} className={`uc-el uc-el--${i}`}>
              <figure className="uc-frame">
                <picture>
                  <source type="image/avif" srcSet={set(f.src, i, "avif")} sizes={i === 0 ? "100vw" : "40vw"} />
                  <source type="image/webp" srcSet={set(f.src, i, "webp")} sizes={i === 0 ? "100vw" : "40vw"} />
                  <img src={`/img/fabric/${f.src}-1000.jpg`} alt={`Close-up of the ${f.piece}: ${f.fabric}`} loading="lazy" decoding="async" className="uc-img" />
                </picture>
              </figure>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
