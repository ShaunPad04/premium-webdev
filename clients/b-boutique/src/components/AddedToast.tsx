"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { productBySlug } from "@/lib/catalogue";
import { useCart } from "@/lib/useCart";
import { ProductPhoto } from "./ProductPhoto";

/* "Added to bag" (2026-09-24, Brad: nothing visibly happened on Add to
 * bag). A small card that slides in with the piece's photo, name, size and
 * colour, and two ways on: View bag, or keep shopping. It stays 4.5s, longer
 * while the pointer or focus is on it, and never covers the page for long.
 *
 * It listens for the "bb:added" event useCart fires on every add. Screen
 * readers already hear the product page's own status line, so this card is
 * not a live region (it would say the same thing twice); its links are
 * ordinary links. */
type Added = { slug: string; size: string; colour: string; n: number; key: number };

export function AddedToast() {
  const [added, setAdded] = useState<Added | null>(null);
  const [hold, setHold] = useState(false);
  const { count } = useCart();
  const timer = useRef(0);

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<Omit<Added, "key">>).detail;
      setAdded({ ...d, key: Date.now() });
    };
    window.addEventListener("bb:added", on);
    return () => window.removeEventListener("bb:added", on);
  }, []);

  useEffect(() => {
    if (!added || hold) return;
    timer.current = window.setTimeout(() => setAdded(null), 4500);
    return () => window.clearTimeout(timer.current);
  }, [added, hold]);

  const p = added ? productBySlug(added.slug) : null;
  if (!added || !p) return null;

  const detail = [added.size && added.size !== "One size" ? `Size ${added.size}` : "", added.colour]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      key={added.key}
      className="atx"
      onPointerEnter={(e) => { if (e.pointerType === "mouse") setHold(true); }}
      onPointerLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={() => setHold(false)}
    >
      <span className="atx-media">
        <ProductPhoto photo={p.photo} square={p.category === "Homeware"} alt="" sizes="64px" className="atx-img" />
      </span>
      <div className="atx-body">
        <p className="atx-h">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="#1F8A4C" /><path d="M4.5 8.2 7 10.6l4.6-5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Added to bag{added.n > 1 ? ` (${added.n})` : ""}
        </p>
        <p className="atx-name">{p.name}</p>
        {detail ? <p className="atx-detail">{detail}</p> : null}
        <div className="atx-actions">
          <Link href="/bag" className="atx-view" onClick={() => setAdded(null)}>View bag ({count})</Link>
          <button type="button" className="atx-keep" onClick={() => setAdded(null)}>Keep shopping</button>
        </div>
      </div>
      <button type="button" className="atx-close" aria-label="Close" onClick={() => setAdded(null)}>
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
    </div>
  );
}
