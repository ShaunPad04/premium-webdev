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
 * each piece's own product photograph as the reference. Put live at Brad's
 * instruction (2026-09-24), before Hayley has approved them.
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

/* The centre frame opens full-screen and slightly wider (it starts at
   ~120% of the window), so it has steps up to 4200px from a 6048px 4K
   source (2026-09-24, Brad: the first one was soft). */
const set = (src: string, i: number, ext: string) =>
  (i === 0 ? [1000, 2000, 3000, 4200] : [1000, 2000]).map((w) => `/img/fabric/${src}-${w}.${ext} ${w}w`).join(", ");

export function UpClose() {
  return (
    <section className="uc" aria-labelledby="uc-h">
      <div className="uc-track">
        <div className="uc-sticky">
          {FRAMES.map((f, i) => (
            <div key={f.src} className={`uc-el uc-el--${i}`}>
              <figure className="uc-frame">
                <picture>
                  <source type="image/avif" srcSet={set(f.src, i, "avif")} sizes={i === 0 ? "(max-width: 767px) 180vw, 120vw" : "40vw"} />
                  <source type="image/webp" srcSet={set(f.src, i, "webp")} sizes={i === 0 ? "(max-width: 767px) 180vw, 120vw" : "40vw"} />
                  <img src={`/img/fabric/${f.src}-1000.jpg`} alt={`Close-up of the ${f.piece}: ${f.fabric}`} loading="lazy" decoding="async" className="uc-img" />
                </picture>
              </figure>
            </div>
          ))}
          {/* The words sit ON the opening close-up (2026-09-24, Brad) and
              fade as the collage opens out. */}
          <div className="uc-head">
            <h2 id="uc-h" className="uc-h">Up close</h2>
            <p className="uc-p">
              Soft curly boucle, a knitted-in jacquard yoke, velvet with metallic
              embroidery. Carefully selected pieces that are stylish, affordable
              and made to be touched, so come in and feel them.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
