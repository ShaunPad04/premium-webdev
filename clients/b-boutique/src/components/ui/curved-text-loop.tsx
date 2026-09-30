"use client";

import { useEffect, useId, useMemo, useRef, useState, type FC, type PointerEvent } from "react";

/* 21st.dev "Curved Text Loop" (2026-09-29, Brad's pick for the /contact
 * band): a line of words running along a curve, draggable to change its
 * speed and direction. Kept close to the original. Changed on the way in:
 *   - the loop writes startOffset straight to the <textPath> and no longer
 *     calls setState every frame (the original re-rendered React 60 times a
 *     second for a value it had already written to the DOM);
 *   - it stops while off screen (IntersectionObserver);
 *   - reduced motion: it does not move by itself (dragging still works);
 *   - colours and weight come from the caller's className (the site's ink,
 *     Hanken 600: font-black is not a weight this site loads). */
export interface CurvedLoopProps {
  marqueeText?: string;
  speed?: number;
  className?: string;
  curveAmount?: number;
  direction?: "left" | "right";
  interactive?: boolean;
}

export const CurvedLoop: FC<CurvedLoopProps> = ({
  marqueeText = "CURVED MARQUEE • INTERACTIVE LOOP • ",
  speed = 2,
  className,
  curveAmount = 250,
  direction = "left",
  interactive = true,
}) => {
  const text = useMemo(() => {
    const hasTrailing = /\s| $/.test(marqueeText);
    return (hasTrailing ? marqueeText.replace(/\s+$/, "") : marqueeText) + " ";
  }, [marqueeText]);

  const box = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<SVGTextElement | null>(null);
  const textPathRef = useRef<SVGTextPathElement | null>(null);
  const [spacing, setSpacing] = useState(0);
  const uid = useId();
  const pathId = `curve-${uid.replace(/:/g, "")}`;
  const pathD = `M-100,40 Q500,${40 + curveAmount} 1540,40`;

  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const dirRef = useRef<"left" | "right">(direction);
  const velRef = useRef(0);
  const [grabbing, setGrabbing] = useState(false);

  const totalText = spacing ? Array(Math.ceil(1800 / spacing) + 2).fill(text).join("") : text;
  const ready = spacing > 0;

  useEffect(() => {
    if (measureRef.current) setSpacing(measureRef.current.getComputedTextLength());
  }, [text, className]);

  const move = (delta: number) => {
    const tp = textPathRef.current;
    if (!tp || !spacing) return;
    let next = parseFloat(tp.getAttribute("startOffset") || "0") + delta;
    if (next <= -spacing) next += spacing;
    if (next > 0) next -= spacing;
    tp.setAttribute("startOffset", `${next}px`);
  };

  useEffect(() => {
    if (!ready) return;
    textPathRef.current?.setAttribute("startOffset", `${-spacing}px`);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let visible = false;
    const step = () => {
      if (!dragRef.current) move(dirRef.current === "right" ? speed : -speed);
      frame = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !visible) {
        visible = true;
        frame = requestAnimationFrame(step);
      } else if (!e.isIntersecting && visible) {
        visible = false;
        cancelAnimationFrame(frame);
      }
    });
    if (box.current) io.observe(box.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spacing, speed, ready]);

  const onPointerDown = (e: PointerEvent) => {
    if (!interactive) return;
    dragRef.current = true;
    setGrabbing(true);
    lastXRef.current = e.clientX;
    velRef.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!interactive || !dragRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    velRef.current = dx;
    move(dx);
  };
  const endDrag = () => {
    if (!interactive || !dragRef.current) return;
    dragRef.current = false;
    setGrabbing(false);
    if (velRef.current !== 0) dirRef.current = velRef.current > 0 ? "right" : "left";
  };

  return (
    <div
      ref={box}
      className="relative flex w-full items-center justify-center overflow-hidden"
      style={{
        visibility: ready ? "visible" : "hidden",
        cursor: interactive ? (grabbing ? "grabbing" : "grab") : "auto",
        touchAction: "pan-y",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      <svg className="block aspect-[100/18] w-full select-none overflow-visible text-[4rem] uppercase tracking-tight" viewBox="0 0 1440 160">
        <text ref={measureRef} xmlSpace="preserve" className={className} style={{ visibility: "hidden", opacity: 0, pointerEvents: "none" }}>
          {text}
        </text>
        <defs>
          <path id={pathId} d={pathD} fill="none" stroke="transparent" />
        </defs>
        {ready && (
          <text xmlSpace="preserve" className={className}>
            <textPath ref={textPathRef} href={`#${pathId}`} startOffset={`${-spacing}px`} xmlSpace="preserve">
              {totalText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
};

export default CurvedLoop;
