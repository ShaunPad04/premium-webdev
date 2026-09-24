import Link from "next/link";

import { showDrafts } from "@/lib/drafts";
import { owner, shop } from "@/lib/shop";
import { ShopMarquee } from "./ShopMarquee";

/* Meet Hayley (2026-09-24, Brad's editorial rebuild): her portrait, one
 * short quote with her signature, and a slow marquee of the real shop floor
 * underneath. It replaced the owner card.
 *
 * The quote is her own sentence, verbatim, from the bio she supplied
 * (owner.bio in lib/shop.ts); only its use as a signed pull quote is new,
 * so the draft flag asks her to confirm that, on previews only. */

const QUOTE = "Our customers are at the heart of everything we do.";

export function MeetHayley() {
  const fullName = `${owner.firstName} ${owner.lastName}`;
  return (
    <section className="mh" aria-labelledby="mh-h">
      <div className="mh-in">
        {owner.portrait ? (
          <picture className="mh-pic">
            <source type="image/avif" srcSet={`/img/owner/${owner.portrait}.avif`} />
            <source type="image/webp" srcSet={`/img/owner/${owner.portrait}.webp`} />
            <img
              src={`/img/owner/${owner.portrait}.jpg`}
              alt={`${fullName}, ${owner.role.toLowerCase()} of ${shop.name}`}
              width={487}
              height={649}
              loading="lazy"
              decoding="async"
              className="mh-img"
            />
          </picture>
        ) : null}
        <div className="mh-body">
          <h2 id="mh-h" className="mh-h">Meet {owner.firstName}</h2>
          <figure className="mh-quote">
            <blockquote>
              <p>&ldquo;{QUOTE}&rdquo;</p>
            </blockquote>
            <figcaption>
              <span className="mh-sig" aria-hidden="true">{owner.firstName}</span>
              <span className="mh-role">
                <span className="sr-only">{fullName}, </span>
                {owner.role}, {shop.name}
              </span>
            </figcaption>
          </figure>
          {showDrafts ? <p className="draft-flag">Draft: Hayley to confirm this line as her signed quote</p> : null}
          <Link href="/about" className="mh-link">
            Our story <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
      <ShopMarquee />
    </section>
  );
}
