"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { formatPriceShort, productBySlug } from "@/lib/catalogue";
import { useCart } from "@/lib/useCart";
import { FreeDelivery } from "./FreeDelivery";
import { ProductPhoto } from "./ProductPhoto";

/* The bag as a slide-out drawer (2026-09-24, Brad), with the £120
 * free-delivery bar. It is a view of the same bag /bag shows (useCart), not
 * a second checkout: "Checkout" goes to /bag, where delivery details and
 * payment already live. Opened by the header bag and after an add, through
 * one window event, so neither has to know the other exists. Native
 * <dialog>: focus in, Escape out, focus back to what opened it. */

export function openCart() {
  window.dispatchEvent(new Event("bb:open-cart"));
}

export function CartDrawer() {
  const d = useRef<HTMLDialogElement>(null);
  const { lines, count, subtotalP, setQty, remove } = useCart();
  const path = usePathname();

  useEffect(() => {
    const open = () => {
      if (window.location.pathname === "/bag") return;
      if (!d.current?.open) d.current?.showModal();
    };
    window.addEventListener("bb:open-cart", open);
    return () => window.removeEventListener("bb:open-cart", open);
  }, []);

  /* Following a link inside closes it. */
  useEffect(() => {
    d.current?.close();
  }, [path]);

  return (
    <dialog
      ref={d}
      className="drawer cd"
      aria-labelledby="cd-h"
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <div className="drawer-in cd-in">
        <div className="drawer-head">
          <h2 id="cd-h" className="drawer-h">
            Your bag{count > 0 ? <span className="cd-count"> ({count})</span> : null}
          </h2>
          <button type="button" className="drawer-x" onClick={() => d.current?.close()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="sr-only">Close bag</span>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="cd-empty">
            <p className="cd-empty-h">Your bag is empty.</p>
            <Link href="/shop" className="btn-solid">
              <span className="roll"><span>Shop the rails</span></span>
            </Link>
          </div>
        ) : (
          <>
            <FreeDelivery subtotalP={subtotalP} />
            <ul className="cd-lines">
              {lines.map((l) => {
                const p = productBySlug(l.slug);
                if (!p) return null;
                const way = p.colourways.find((c) => c.colour === l.colour) ?? p.colourways[0];
                return (
                  <li key={`${l.slug}-${l.size}-${l.colour}`} className="cd-line">
                    <Link href={`/shop/${p.slug}`} className="cd-media" aria-label={p.name}>
                      <ProductPhoto photo={way.image} square={p.category === "Homeware"} sizes="88px" className="absolute inset-0 h-full w-full object-cover" />
                    </Link>
                    <div className="cd-info">
                      <Link href={`/shop/${p.slug}`} className="cd-name">{p.name}</Link>
                      <p className="cd-meta">
                        {[l.colour, p.sizes.length > 1 ? `Size ${l.size}` : ""].filter(Boolean).join(" · ")}
                      </p>
                      <div className="cd-row">
                        <div className="cd-qty" role="group" aria-label={`Quantity of ${p.name}`}>
                          <button type="button" onClick={() => setQty(l.slug, l.size, l.colour, l.qty - 1)} aria-label="One fewer">−</button>
                          <span aria-live="polite">{l.qty}</span>
                          <button type="button" onClick={() => setQty(l.slug, l.size, l.colour, l.qty + 1)} aria-label="One more">+</button>
                        </div>
                        <p className="cd-price">{p.demo ? "Price to confirm" : formatPriceShort(p.priceP * l.qty)}</p>
                      </div>
                      <button type="button" className="cd-remove" onClick={() => remove(l.slug, l.size, l.colour)}>
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="cd-foot">
              <p className="cd-sub">
                <span>Subtotal</span>
                <span>{formatPriceShort(subtotalP)}</span>
              </p>
              <p className="cd-note">Delivery is worked out at checkout.</p>
              <Link href="/bag" className="cf-submit atb-add cd-go">
                <span className="roll"><span>Checkout</span></span>
              </Link>
              <button type="button" className="cd-continue" onClick={() => d.current?.close()}>
                Continue shopping
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
