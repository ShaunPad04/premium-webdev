"use client";

import { useEffect, useState } from "react";

/* Phones: once the buy block has scrolled out of view, a slim bar with the
   price and one button that brings it back (2026-09-24, Brad). It scrolls to
   the real controls rather than adding blind, because size and colour have
   to be chosen there. Hidden on desktop, where the buy block is beside the
   photograph the whole way down. */
export function StickyBuy({ name, price }: { name: string; price: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = document.querySelector(".pdp .atb");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="sticky-buy" data-on={show ? "" : undefined} aria-hidden={!show}>
      <div className="sticky-buy-t">
        <span className="sticky-buy-n">{name}</span>
        <span className="sticky-buy-p">{price}</span>
      </div>
      <button
        type="button"
        className="cf-submit atb-add sticky-buy-b"
        tabIndex={show ? 0 : -1}
        onClick={() => {
          const atb = document.querySelector<HTMLElement>(".pdp .atb");
          atb?.scrollIntoView({ behavior: "smooth", block: "center" });
          atb?.querySelector<HTMLElement>("input:not(:disabled), button")?.focus({ preventScroll: true });
        }}
      >
        <span className="roll"><span>Add to bag</span></span>
      </button>
    </div>
  );
}
