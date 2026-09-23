import Link from "next/link";

import { owner, ownerPending, shop } from "@/lib/shop";

/* Hayley Brown, Shop Owner.
 *
 * ── Provenance ────────────────────────────────────────────────────────────
 * The client supplied an editorial team-member card (emerald-ui, MIT) and
 * asked for it in this slot. The COMPOSITION is theirs and is kept intact,
 * because it is the good part: an overlapping portrait, the name set very
 * large and split across two lines with the surname carrying the weight, a
 * circular arrow control, and the whole thing entering in stages.
 *
 * What is not kept is its surface, and the reasons are specific rather than
 * a matter of taste:
 *
 *   - It paints in `zinc-*` with `dark:` variants. This site has its own two
 *     grounds — warm paper and warm ink — and no dark-mode toggle for a
 *     `dark:` class to answer. Pasted as written it would have been the one
 *     section on the page in a cool grey, which reads as a component
 *     borrowed from somewhere else, and that is precisely the "cheap web
 *     designer" tell the client is worried about.
 *   - It sets the name in `font-extralight`. The display face here is Bodoni
 *     Moda, signed off by the client, and a Didone at 5xl IS the editorial
 *     gesture that card is reaching for with a hairline grotesk.
 *   - `bg-linear-to-t from-black/20` over the portrait is a decorative scrim
 *     with nothing under it to make legible.
 *
 * ── Dependencies: four requested, none added ──────────────────────────────
 * The snippet asked for `clsx`, `tailwind-merge`, `lucide-react` and
 * `framer-motion`. None went in:
 *   - `clsx` + `tailwind-merge` — `cn` already exists in lib/utils.ts.
 *   - `lucide-react` — a whole icon package for one arrow, when this file's
 *     neighbours all draw theirs inline. The arrow below is the same glyph
 *     `.hero-cta` and `.svc-row-link` already use.
 *   - `framer-motion` — the project ships `motion`, its successor, and the
 *     old package alongside it would be two animation runtimes in one
 *     bundle.
 *
 * ── And no animation library at all here ──────────────────────────────────
 * The staggered entrance is done with `animation-timeline: view()`, which is
 * how every other section on this page enters. That keeps this a SERVER
 * component: no `use client`, no hydration, no JavaScript shipped for a card
 * that does not react to anything. The snippet's `whileHover`/`whileTap`
 * become CSS transitions, which is what they compile to anyway.
 *
 * ── The frame is empty, and that is the point ─────────────────────────────
 * The snippet ships a portrait URL pointing at a stock photograph of a
 * stranger. It is not in here and must not be: this card labels whatever is
 * in that frame "Hayley Brown, Shop Owner" on her own shop's website, so a
 * stock face is not a placeholder — it is a photograph of somebody else
 * presented as her.
 *
 * The BIO is no longer waiting: the client supplied three paragraphs on
 * 2026-09-21 and they are printed verbatim, so only the photograph is
 * outstanding and the on-screen marker says exactly that. (This comment used
 * to read "the same goes for the bio. Both are CLIENT INPUT REQUIRED" — it is
 * corrected here rather than left to be believed.) */
export function OwnerCard() {
  const fullName = `${owner.firstName} ${owner.lastName}`;

  return (
    <section aria-labelledby="owner-heading" className="owner">
      <div className="owner-inner">
        <p className="owner-eyebrow">{owner.role}</p>

        <div className="owner-layout">
          <div className="owner-portrait">
            {owner.portrait ? (
              /* A <picture>, like the hero, so a browser picks AVIF before
                 any request goes out. No object-position: the file is
                 cropped to this frame's 3:4 by scripts/build-owner.mjs, so
                 it fills exactly and her face cannot be re-cropped by a
                 later change to the CSS. */
              <picture>
                <source type="image/avif" srcSet={`/img/owner/${owner.portrait}.avif`} />
                <source type="image/webp" srcSet={`/img/owner/${owner.portrait}.webp`} />
                <img
                  src={`/img/owner/${owner.portrait}.jpg`}
                  /* Names her and her role. It does not describe her
                     appearance, her age or her clothes — none of that is the
                     information a reader needs here, and a photograph of a
                     real person is not a place to narrate. */
                  alt={`${fullName}, ${owner.role.toLowerCase()} of ${shop.name}`}
                  width={487}
                  height={649}
                  decoding="async"
                  className="owner-img"
                />
              </picture>
            ) : (
              /* Not a grey box pretending to be a photograph, and not a
                 stranger's face. An empty frame that says what it is
                 waiting for, so it cannot be mistaken for finished. */
              <div className="owner-frame" role="img" aria-label={`Photograph of ${fullName} — not yet supplied`}>
                <span className="owner-frame-mark">
                  Photograph
                  <br />
                  to come
                </span>
              </div>
            )}
          </div>

          {/* Overlaps the portrait, which is the whole gesture of the card
              the client chose: the type sits ON the picture rather than
              beside it. */}
          <div className="owner-body">
            <h2 id="owner-heading" className="owner-name">
              {owner.firstName}
              <br />
              <span className="owner-surname">{owner.lastName}</span>
            </h2>

            <div className="owner-details">
              <Link
                href="/contact"
                aria-label={`Contact ${fullName}`}
                className="owner-cta"
              >
                <span className="owner-cta-ring">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M4 10h12M11.5 5.5L16 10l-4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                </span>
                {/* A visible label: an unlabelled circle between her name and
                    her words read as a stray control (2026-09-23 review). */}
                <span className="owner-cta-label">Get in touch</span>
              </Link>

              {/* Her words, verbatim, one paragraph per entry. Not a
                  <blockquote>: this is the shop describing itself in the
                  first person on its own site, not a quotation from
                  somewhere else, and marking it up as a quote would imply a
                  source to attribute. */}
              <div className="owner-bio">
                {owner.bio.length ? (
                  owner.bio.map((para) => (
                    <p key={para.slice(0, 32)} className="owner-bio-text">
                      {para}
                    </p>
                  ))
                ) : (
                  <p className="owner-bio-ask">
                    A line or two from Hayley about the shop — in her own
                    words, not ours.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {ownerPending ? (
          <p className="owner-pending">
            [CLIENT INPUT REQUIRED — a photograph of Hayley. Her words have
            arrived and are printed above, verbatim; the frame is still
            empty. Nothing here is invented; see `owner` in lib/shop.ts]
          </p>
        ) : null}
      </div>
    </section>
  );
}
