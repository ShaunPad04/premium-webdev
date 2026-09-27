"use client";

import { animate, motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/* Image Stack Carousel (21st.dev, 2026-09-27, Brad: Up close on phones).
 * A pile of cards; drag the front one far enough, or tap it, and it goes
 * to the back.
 *
 * Changed on the way in:
 * - `motion/react`, already in the site, instead of adding `framer-motion`
 *   (the same library under its current name).
 * - The demo's five remote images are gone; cards are passed in, each a
 *   <picture> (AVIF + WebP) with its own title, shown under the pile.
 * - A tap sends the front card back too, so it works without a drag.
 * - A throw swishes (Brad: "swish a bit more when throwing the cards to
 *   the sides"): the card leans the way it is dragged, and a throw (far
 *   enough, or fast enough) sends it flying off that side with a spin
 *   before it drops in at the back. A tap throws it to the right.
 * - Decorative (aria-hidden, alt=""): the section's list of the same
 *   fabrics is what a screen reader reads. */

export type StackCard = { id: string; title: string; avif: string; webp: string };

const settings = {
  width: 320,
  height: 320,
  radius: 18,
  swipeThreshold: 110,
  stackRotation: 4,
  stackScale: 0.035,
  tiltStrength: 25,
  springStiffness: 300,
  springDamping: 30,
  mobileBreakpoint: 480,
  mobileScale: 0.9,
};

function SwipeCard({ children, isFront, zIndex, onSendToBack, size }: { children: ReactNode; isFront: boolean; zIndex: number; onSendToBack: () => void; size: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-200, 200], [settings.tiltStrength, -settings.tiltStrength]);
  const rotateY = useTransform(x, [-200, 200], [-settings.tiltStrength, settings.tiltStrength]);
  /* The lean while dragging, carried on through the throw. */
  const rotate = useTransform(x, [-400, 0, 400], [-28, 0, 28]);
  const flying = useRef(false);

  const fling = (dirX: number, dirY = 0) => {
    if (flying.current) return;
    flying.current = true;
    const opts = { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };
    Promise.all([
      animate(x, dirX * (size * 1.9), opts),
      animate(y, dirY * size * 0.6 + 40, opts),
    ]).then(() => {
      onSendToBack();
      x.jump(0);
      y.jump(0);
      flying.current = false;
    });
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const far = Math.abs(info.offset.x) > settings.swipeThreshold || Math.abs(info.offset.y) > settings.swipeThreshold;
    const fast = Math.abs(info.velocity.x) > 600 || Math.abs(info.velocity.y) > 600;
    if (far || fast) {
      const dx = info.offset.x + info.velocity.x * 0.1;
      fling(dx < 0 ? -1 : 1, Math.max(-1, Math.min(1, info.offset.y / 200)));
    } else {
      animate(x, 0, { type: "spring", stiffness: settings.springStiffness, damping: settings.springDamping });
      animate(y, 0, { type: "spring", stiffness: settings.springStiffness, damping: settings.springDamping });
    }
  };

  return (
    <motion.div
      className="absolute cursor-grab select-none active:cursor-grabbing"
      style={{ width: size, height: size, x: isFront ? x : 0, y: isFront ? y : 0, rotate: isFront ? rotate : 0, rotateX: isFront ? rotateX : 0, rotateY: isFront ? rotateY : 0, zIndex, touchAction: "pan-y" }}
      drag={isFront}
      /* No constraints or momentum: onDragEnd decides, spring home or throw,
         so the drag system's own snap-back never fights the throw. */
      dragMomentum={false}
      onDragEnd={onDragEnd}
      onTap={isFront ? () => fling(1) : undefined}
    >
      {children}
    </motion.div>
  );
}

export function SwipeCards({ cards, className = "" }: { cards: StackCard[]; className?: string }) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${settings.mobileBreakpoint}px)`);
    const update = () => setScale(mq.matches ? settings.mobileScale : 1);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const size = Math.round(settings.width * scale);
  const [list, setList] = useState(cards);
  const toBack = (id: string) => setList((prev) => [...prev.filter((c) => c.id !== id), ...prev.filter((c) => c.id === id)]);

  return (
    <div className={`isc select-none ${className}`} aria-hidden="true">
      <div className="relative mx-auto" style={{ width: size, height: size, perspective: 1200 }}>
        {list.map((card, index) => (
          <SwipeCard key={card.id} isFront={index === 0} zIndex={list.length - index} size={size} onSendToBack={() => toBack(card.id)}>
            <motion.div
              className="isc-card relative h-full w-full overflow-hidden"
              style={{ borderRadius: settings.radius }}
              animate={{ rotateZ: index * settings.stackRotation, scale: 1 - index * settings.stackScale, transformOrigin: "85% 85%" }}
              initial={false}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <picture>
                <source type="image/avif" srcSet={card.avif} />
                <img src={card.webp} alt="" draggable={false} loading={index < 2 ? "eager" : "lazy"} className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
              </picture>
            </motion.div>
          </SwipeCard>
        ))}
      </div>
      <p className="isc-title">{list[0]?.title}</p>
    </div>
  );
}

export default SwipeCards;
