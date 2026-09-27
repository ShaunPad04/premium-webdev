"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

/* The 21st.dev "Expanded Map" (dev.shejanmahamud, id 21987), in Visit since
 * 2026-09-27 (Brad). A small card with the shop's name on a faint grid tilts
 * with the pointer; a click, Enter or Space springs it open to the map.
 *
 * Changed from the original: ink and white instead of emerald, the display
 * face for the name, sized for the section, and Google's embed in place of
 * its Carto tiles. Carto now needs a paid key and OpenStreetMap refuses
 * sites that pull its tiles directly; Google's is the map /privacy already
 * names, and it is requested only once the card is opened. The iframe is a
 * picture (pointer-events none, hidden from assistive tech): the address is
 * real text beside it and "Get directions" opens the real Google Maps. */

const fmt = (lat: number, lng: number) =>
  `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}, ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`;

export function ExpandedMap({ location, sub, latitude, longitude, embedSrc }: {
  location: string; sub: string; latitude: number; longitude: number; embedSrc: string;
}) {
  const [vw, setVw] = useState(1440);
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-50, 50], [8, -8]), { stiffness: 300, damping: 30 });
  const ry = useSpring(useTransform(mx, [-50, 50], [-8, 8]), { stiffness: 300, damping: 30 });

  useEffect(() => {
    const on = () => setVw(window.innerWidth);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  // Desktop: 380x200 closed, up to 640x460 open. Phones: the screen width.
  const phone = vw < 1024;
  const full = phone ? vw - 32 : Math.min(640, vw * 0.44);
  const size = phone ? { w: full, h: 150, W: full, H: 340 } : { w: 380, h: 200, W: full, H: 460 };
  const toggle = () => setOpen((o) => !o);

  return (
    <motion.div
      ref={ref}
      className="em"
      style={{ perspective: 1000 }}
      onMouseMove={still ? undefined : (e) => { const r = ref.current!.getBoundingClientRect(); mx.set(e.clientX - r.left - r.width / 2); my.set(e.clientY - r.top - r.height / 2); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { mx.set(0); my.set(0); setHover(false); }}
      onClick={toggle}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } }}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-label={`${open ? "Close" : "Open"} the map of ${location}`}
    >
      <motion.div
        className="em-card"
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        initial={false}
        animate={{ width: open ? size.W : size.w, height: open ? size.H : size.h }}
        transition={still ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 35 }}
      >
        <AnimatePresence>
          {open && (
            <motion.div className="em-map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: still ? 0 : 0.4, delay: still ? 0 : 0.1 }}>
              <iframe className="em-frame" src={embedSrc} title="" aria-hidden="true" tabIndex={-1} referrerPolicy="no-referrer-when-downgrade" />
              <div className="em-fade" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="em-grid" animate={{ opacity: open ? 0 : 1 }} />

        <div className="em-content">
          <motion.svg animate={{ opacity: open ? 0 : 1 }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" x2="9" y1="3" y2="18" /><line x1="15" x2="15" y1="6" y2="21" />
          </motion.svg>
          <div>
            <motion.p className="em-name" animate={{ x: hover && !still ? 4 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>{location}</motion.p>
            <p className="em-sub">{open ? fmt(latitude, longitude) : sub}</p>
            <motion.div className="em-line" initial={{ scaleX: 0.3 }} animate={{ scaleX: hover || open ? 1 : 0.3 }} transition={{ duration: still ? 0 : 0.4 }} />
            {!open ? <p className="em-hint">Tap to open the map</p> : null}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
