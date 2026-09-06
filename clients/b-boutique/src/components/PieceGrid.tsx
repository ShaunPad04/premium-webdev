import { ImageSlot } from "./ImageSlot";

/* Actual pieces, shown still rather than on a moving rail.
 *
 * The home page shows New In as a continuous marquee, which is right there —
 * it is a picture of a rail being walked past. On a category page the reader
 * has arrived deliberately and is looking for what is in, so the same nine
 * photographs stop moving and become a grid you can read at your own pace.
 *
 * Category above name, as on the home page. Not brand, not price: neither
 * exists in the data, and both are exactly the kind of thing that must never
 * be invented for a shop that sells in person and has published no prices. */
export function PieceGrid({
  pieces,
  idPrefix,
}: {
  pieces: readonly { slug: string; name: string; category: string; tone: string }[];
  /** Keeps the SVG filter ids unique when two grids sit on one page. */
  idPrefix: string;
}) {
  return (
    <ul className="piece-grid">
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
              sizes="(min-width: 1024px) 23vw, (min-width: 640px) 31vw, 44vw"
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
