import { ImageSlot } from "./ImageSlot";

/* Actual pieces, shown still rather than on a moving rail.
 *
 * The home page shows New In as a continuous marquee, which is right there —
 * it is a picture of a rail being walked past. On a category page the reader
 * has arrived deliberately and is looking for what is in, so the same nine
 * photographs stop moving and become a grid you can read at your own pace.
 *
 * Category above name, and deliberately no price: this grid is editorial —
 * it shows what has landed — and the shop's own ProductGrid is where prices
 * belong. Two grids both showing money is two places for it to disagree. */
export function PieceGrid({
  pieces,
  idPrefix,
}: {
  pieces: readonly { slug: string; name: string; category: string; tone: string }[];
  /** Keeps the SVG filter ids unique when two grids sit on one page. */
  idPrefix: string;
}) {
  /* Two or three pieces in a four-column grid is a row that is mostly empty,
     and empty grid cells read as missing stock rather than as a small range.
     Below four, the grid drops to two columns and the frames grow to fill the
     width — the same pieces, shown as a pair rather than as the leftovers of a
     wall. There is no padding with invented items to make the numbers work. */
  const sparse = pieces.length < 4;

  return (
    <ul className={`piece-grid${sparse ? " is-sparse" : ""}`}>
      {pieces.map((piece, i) => (
        <li key={piece.slug} className="piece" style={{ "--i": i } as React.CSSProperties}>
          <div className="piece-media">
            <ImageSlot
              tone={piece.tone as "bone" | "onyx" | "marble" | "gold" | "red"}
              seed={i + 11}
              uid={`${idPrefix}-${i}`}
              slot={`new-${piece.slug}`}
              /* Empty on purpose: the category and the name sit directly
                 beneath in real text, so a copy of the name here would be
                 announced twice, and there is no per-piece description in the
                 data to say anything more useful without inventing it. */
              alt=""
              /* Measured against the rendered frame at each breakpoint, in
                 both densities: the sparse pair is roughly twice the width of
                 a four-up card, so it cannot share one `sizes`. */
              sizes={
                sparse
                  ? "(min-width: 1024px) 44vw, (min-width: 640px) 46vw, 88vw"
                  : "(min-width: 1024px) 23vw, (min-width: 640px) 31vw, 44vw"
              }
              className="absolute inset-0 h-full w-full"
            />
          </div>
          <p className="piece-cat">{piece.category}</p>
          <p className="piece-name">{piece.name}</p>
        </li>
      ))}
    </ul>
  );
}
