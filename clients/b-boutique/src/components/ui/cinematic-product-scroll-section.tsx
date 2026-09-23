"use client";

/* Cinematic product scroll — vendored 2026-09-22 for the home page, as an
 * upsell: the client asked for it to carry the most expensive pieces.
 *
 * The motion is the component's own — each piece in greyscale, colouring in
 * as you scroll, its details stepping up beside it; then a strip of cards
 * that drop in with an elastic settle (animejs). What was changed on the way
 * in, and why:
 *
 *   - NO MOCK PRODUCTS. The demo's trench, silk dress and cashmere came with
 *     invented fabrics ("100% organic mulberry silk"), dollar prices and a
 *     made-up brand ("CLOSET STUDIO, EST. 2024"). Here the three pieces are
 *     DERIVED — the most expensive buyable garments in the catalogue, by the
 *     same priceP the checkout charges — so the selection follows the stock
 *     and cannot show a price the till would not honour.
 *   - NO COLOUR DOTS. The demo painted hex swatches. Nobody has confirmed a
 *     swatch colour for any of her pieces, and a dot is a claim about what
 *     the garment looks like; her colour NAMES are printed instead.
 *   - REAL LINKS. /products/… does not exist here; every link is the
 *     product's own /shop/ page.
 *   - The site's own photographs (ProductPhoto: AVIF/WebP/JPEG at measured
 *     sizes) instead of next/image on a remote CDN; the site's tokens instead
 *     of shadcn's (bg-primary, text-muted-foreground are not defined here);
 *     two inline SVGs instead of lucide-react for two icons.
 *   - The 100dvh intro is a compact heading. The home page already has a
 *     hero; a second full-screen one halfway down is a second front door.
 *   - The scroll handler caches its elements and runs once per frame, rather
 *     than querying the DOM on every scroll event.
 *   - Reduced motion: colour shown, details shown, cards placed — nothing
 *     animates.
 */

import Link from "next/link";
import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

import { formatPriceShort, isBuyable, products, type Product } from "@/lib/catalogue";
import { ProductPhoto } from "@/components/ProductPhoto";
import { AddToBag } from "@/components/AddToBag";
import { ColourProvider } from "@/components/ColourChoice";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/* The most expensive garments that can actually be bought. Homeware is left
   out: this is a clothing upsell, and a vase in a scroll about fit and size
   has no sizes to show. Ties keep catalogue order. */
const PIECES: Product[] = [...products]
  .filter((p) => isBuyable(p) && p.category !== "Homeware")
  .sort((a, b) => b.priceP - a.priceP)
  .slice(0, 3);

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── One piece, coloured in by the scroll ──────────────────────────────── */
function ProductHero({ product, reversed, reduced }: { product: Product; reversed: boolean; reduced: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const mask = section.querySelector<HTMLElement>(".cps-mask");
    const steps = Array.from(section.querySelectorAll<HTMLElement>(".cps-step"));
    const marks = steps.map((s) => parseFloat(s.dataset.progress || "0"));

    if (reduced) {
      if (mask) mask.style.clipPath = "none";
      steps.forEach((s) => s.classList.add("is-on"));
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const narrow = window.innerWidth < 768;
      let progress = 0;
      if (narrow) {
        progress = (vh - rect.top) / (vh - vh * 0.25);
      } else if (rect.top <= 0) {
        const travel = rect.height - vh;
        if (travel > 0) progress = Math.abs(rect.top) / travel;
      }
      progress = Math.min(Math.max(progress, 0), 1);
      if (mask) {
        mask.style.clipPath = narrow
          ? `inset(0 ${100 - progress * 100}% 0 0)`
          : `inset(0 0 ${100 - progress * 100}% 0)`;
      }
      steps.forEach((s, i) => s.classList.toggle("is-on", progress > marks[i]));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  const href = `/shop/${product.slug}`;

  return (
    <div ref={sectionRef} className="cps-scene">
      <div className="cps-stage">
        <div className={`cps-grid${reversed ? " is-reversed" : ""}`}>
          <div className="cps-media">
            <div className="cps-frame">
              <div className="cps-grey" aria-hidden="true">
                <ProductPhoto photo={product.photo} sizes="(min-width: 768px) 50vw, 92vw" className="cps-img" />
              </div>
              <div className="cps-mask" style={{ clipPath: "inset(0 0 100% 0)" }}>
                <ProductPhoto
                  photo={product.photo}
                  alt={product.name}
                  sizes="(min-width: 768px) 50vw, 92vw"
                  className="cps-img"
                />
              </div>
            </div>
          </div>

          <div className="cps-copy">
            <div className="cps-copy-inner">
              <div className="cps-step" data-progress="0.15">
                <p className="label cps-cat">{product.category}</p>
                <h3 className="cps-name">{product.name}</h3>
                <p className="cps-price">{formatPriceShort(product.priceP)}</p>
              </div>

              <div className="cps-step" data-progress="0.35">
                <p className="cps-desc">{product.short}</p>
              </div>

              {/* The product page's own buy block: colour swatches, size,
                  Add to bag, Buy now, the same stock and size checks. Asked
                  for 2026-09-23 ("where is the buy now / add to basket"). */}
              <div className="cps-step cps-buy" data-progress="0.55">
                <ColourProvider colours={product.colourways.map((c) => c.colour)}>
                  <AddToBag product={product} />
                </ColourProvider>
                <Link href={href} className="cps-view">
                  <span>View the piece</span>
                  <Arrow />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── A card in the closing strip: greyscale, coloured in from the pointer ── */
function MiniCard({ product }: { product: Product }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const place = (x: number, y: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--rx", `${((x - r.left) / r.width) * 100}%`);
    el.style.setProperty("--ry", `${((y - r.top) / r.height) * 100}%`);
  };
  return (
    <Link
      ref={ref}
      href={`/shop/${product.slug}`}
      className="cps-card"
      onMouseEnter={(e) => place(e.clientX, e.clientY)}
      onTouchStart={(e) => place(e.touches[0].clientX, e.touches[0].clientY)}
    >
      <div className="cps-card-media">
        <div className="cps-grey" aria-hidden="true">
          <ProductPhoto photo={product.photo} sizes="(min-width: 768px) 300px, 46vw" className="cps-img" />
        </div>
        <div className="cps-card-colour" aria-hidden="true">
          <ProductPhoto photo={product.photo} sizes="(min-width: 768px) 300px, 46vw" className="cps-img" />
        </div>
      </div>
      <div className="cps-card-body">
        <span className="cps-card-cat">{product.category}</span>
        <span className="cps-card-name">{product.name}</span>
        <span className="cps-card-price">{formatPriceShort(product.priceP)}</span>
      </div>
    </Link>
  );
}

export function Component() {
  const reduced = usePrefersReducedMotion();
  const stripRef = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const cards = strip.querySelectorAll<HTMLElement>(".cps-card-wrap");
    if (reduced) {
      cards.forEach((c) => (c.style.opacity = "1"));
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done.current) return;
        done.current = true;
        animate(cards, {
          translateY: [-120, 0],
          opacity: [0, 1],
          delay: stagger(150),
          duration: 1000,
          ease: "outElastic(1, .6)",
        });
        io.disconnect();
      },
      { threshold: 0.2 },
    );
    io.observe(strip);
    return () => io.disconnect();
  }, [reduced]);

  if (PIECES.length === 0) return null;

  return (
    <section aria-labelledby="cps-h" className="cps">
      <div className="cps-intro">
        <p className="label cps-eyebrow">Treat yourself</p>
        <h2 id="cps-h" className="cps-h">
          The <em>statement</em> pieces.
        </h2>
        {/* Her words, from the owner bio in shop.ts. */}
        <p className="cps-lede">
          Carefully selected pieces that are stylish, affordable and perfect for treating yourself.
        </p>
      </div>

      {PIECES.map((p, i) => (
        <ProductHero key={p.slug} product={p} reversed={i % 2 === 1} reduced={reduced} />
      ))}

      <div ref={stripRef} className="cps-strip">
        <div className="cps-strip-head">
          <span className="label">All three</span>
          <Link href="/shop" className="cps-strip-link">
            <span>Shop everything</span>
            <Arrow />
          </Link>
        </div>
        <div className="cps-strip-row">
          {PIECES.map((p) => (
            <div key={p.slug} className="cps-card-wrap">
              <MiniCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Component;
