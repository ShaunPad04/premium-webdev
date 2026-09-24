import { reviews, type Review } from "@/lib/reviews";

/* Reviews, static (2026-09-24, Brad). Three is a small number, so no
 * marquee and no carousel: the cards sit still, side by side on a desktop
 * and stacked on a phone. Every word comes from lib/reviews.ts, which holds
 * only reviews copied from Google, and the section renders nothing while
 * that list is empty. */
function Stars({ n }: { n: number }) {
  return (
    <span className="rv-stars" role="img" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 20 20" aria-hidden="true" data-on={i < n || undefined}>
          <path d="M10 1.8l2.5 5.3 5.8.7-4.3 4 1.1 5.8L10 14.8l-5.1 2.8 1.1-5.8-4.3-4 5.8-.7z" fill="currentColor" />
        </svg>
      ))}
    </span>
  );
}

export function Reviews({ items = reviews }: { items?: Review[] }) {
  if (items.length === 0) return null;
  return (
    <section className="rv" aria-labelledby="rv-h">
      <div className="rv-inner">
        <p className="label rv-eyebrow">Reviews</p>
        <h2 id="rv-h" className="rv-h">In their <em>words</em>.</h2>
        <ul className="rv-list">
          {items.map((r) => (
            <li key={r.name + r.quote.slice(0, 20)} className="rv-card">
              <figure>
                {r.stars ? <Stars n={r.stars} /> : null}
                <blockquote className="rv-quote"><p>{r.quote}</p></blockquote>
                <figcaption className="rv-by">
                  <span className="rv-name">{r.name}</span>
                  <span className="rv-src">{r.source} review</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
