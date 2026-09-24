import { formatPriceShort, FREE_DELIVERY_OVER_P } from "@/lib/catalogue";

/* Why B Boutique (2026-09-24, Brad asked for a "why choose us" strip in
 * place of a journal with nothing in it yet).
 *
 * Four reasons, every one of them already true on this site and read from
 * the same place the rest of the site reads it: "chosen by hand" is the
 * philosophy line, "one of one" is the FAQ, the delivery threshold is
 * FREE_DELIVERY_OVER_P, and 14 days is the online cancellation right in
 * lib/policies.ts. Nothing here is a new claim.
 *
 * The photographs are GENERATED mood images (Higgsfield, scripts: none;
 * sources in assets/why): a hand at a rail, a cardigan on a hook, a gift
 * box, a folded jumper. None of them is her shop or her stock, and none is
 * captioned as if it were; they are decorative (alt=""), and the words
 * carry the meaning. The gift box in particular must not be read as how
 * orders are packed unless Hayley confirms it (CLIENT INPUT). */
const POINTS = [
  { img: "hand", title: "Chosen by hand", text: "Every piece on the rails is chosen by hand, one at a time." },
  { img: "one", title: "Mostly one of one", text: "Most pieces here are one of one, so yours won't be on everyone else." },
  { img: "parcel", title: `Free UK delivery over ${formatPriceShort(FREE_DELIVERY_OVER_P)}`, text: "Sent by Royal Mail, packed by hand." },
  { img: "return", title: "14 days to change your mind", text: "Bought online? Send it back within 14 days for a refund." },
] as const;

const set = (n: string, ext: string) => `/img/why/${n}-640.${ext} 640w, /img/why/${n}-896.${ext} 896w`;

export function WhyUs() {
  return (
    <section className="why" aria-labelledby="why-h">
      <div className="why-inner">
        <div className="why-head">
          <p className="label why-eyebrow">Why B Boutique</p>
          <h2 id="why-h" className="why-h">
            A shop, <em>not a warehouse.</em>
          </h2>
        </div>
        <ol className="why-list">
          {POINTS.map((p, i) => (
            <li key={p.img} className="why-item" style={{ "--n": i } as React.CSSProperties}>
              <span className="why-media">
                <picture>
                  <source type="image/avif" srcSet={set(p.img, "avif")} sizes="(min-width: 1024px) 23vw, 46vw" />
                  <source type="image/webp" srcSet={set(p.img, "webp")} sizes="(min-width: 1024px) 23vw, 46vw" />
                  <img src={`/img/why/${p.img}-640.jpg`} alt="" width={896} height={1120} loading="lazy" decoding="async" className="why-img" />
                </picture>
              </span>
              <span className="why-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="why-title">{p.title}</h3>
              <p className="why-text">{p.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
