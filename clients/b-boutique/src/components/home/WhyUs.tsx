import { formatPriceShort, FREE_DELIVERY_OVER_P } from "@/lib/catalogue";
import { ScrollAcross } from "@/components/ScrollAcross";

/* Why B Boutique (2026-09-24, Brad asked for a "why choose us" strip in
 * place of a journal with nothing in it yet).
 *
 * Seven reasons, every one of them already true on this site and read from
 * the same place the rest of the site reads it: "chosen by hand" is the
 * philosophy line, "one of one" is the FAQ, the delivery threshold is
 * FREE_DELIVERY_OVER_P, and 14 days is the online cancellation right in
 * lib/policies.ts. Three more came in on 2026-09-27 (Brad, so the scroll
 * across lasts longer), each from an answer the client gave in lib/faq.ts:
 * everything online is on the rail in Cleethorpes ("Do you sell online?"),
 * the four-day hold with a deposit, and gift cards in any amount, bought
 * and used in person. Nothing here is a new claim.
 *
 * The photographs are GENERATED mood images (Higgsfield, scripts: none;
 * sources in assets/why): a hand at a rail, a cardigan on a hook, a jumper
 * in tissue in a plain paper mailer, a folded jumper; and, added with the
 * three new reasons, a fitting corner, a knit tied with a blank tag, a blank
 * card in an envelope (same style, the first two as references). None is her
 * shop or her stock, and none is captioned as if it were; they are
 * decorative (alt=""), and the words carry the meaning. The delivery image
 * was a black gift box until 2026-09-24, when Brad confirmed orders do not
 * come in one; it is now plain postal packaging.
 *
 * Scrolling down through the section moves the four across, right to left,
 * while the section holds still (2026-09-27, Brad; ScrollAcross). */
const POINTS = [
  { img: "hand", title: "Chosen by hand", text: "Every piece on the rails is chosen by hand, one at a time." },
  { img: "one", title: "Mostly one of one", text: "Most pieces here are one of one, so yours won't be on everyone else." },
  { img: "try", title: "Try it on in the shop", text: "Everything online is on the rail in Cleethorpes, so you can see it first." },
  { img: "parcel", title: `Free UK delivery over ${formatPriceShort(FREE_DELIVERY_OVER_P)}`, text: "Sent by Royal Mail, packed by hand." },
  { img: "return", title: "14 days to change your mind", text: "Bought online? Send it back within 14 days for a refund." },
  { img: "hold", title: "We'll hold it for you", text: "We keep a piece for four days with a deposit paid." },
  { img: "gift", title: "Gift cards in any amount", text: "Bought and used in the shop, against anything on the rails." },
] as const;

const set = (n: string, ext: string) => `/img/why/${n}-640.${ext} 640w, /img/why/${n}-896.${ext} 896w`;

export function WhyUs() {
  return (
    <section className="why" aria-labelledby="why-h">
      <ScrollAcross className="why-track">
      <div className="why-inner">
        <div className="why-head">
          <p className="label why-eyebrow">Why B Boutique</p>
          <h2 id="why-h" className="why-h">
            A shop, <em>not a warehouse</em>
          </h2>
        </div>
        <ol className="why-list" data-across>
          {POINTS.map((p, i) => (
            <li key={p.img} className="why-item" style={{ "--n": i } as React.CSSProperties}>
              <span className="why-media">
                <picture>
                  <source type="image/avif" srcSet={set(p.img, "avif")} sizes="(min-width: 1024px) 34vw, 76vw" />
                  <source type="image/webp" srcSet={set(p.img, "webp")} sizes="(min-width: 1024px) 34vw, 76vw" />
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
      </ScrollAcross>
    </section>
  );
}
