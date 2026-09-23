"use client";

/* Text along a path — vendored 2026-09-22 at the client's request.
 *
 * The component as supplied, with two changes, both needed in this
 * framework rather than matters of taste:
 *
 *   1. The fallback path id was `Math.random()`. A server-rendered component
 *      renders twice — once on the server, once in the browser — and a random
 *      id differs between the two, so the <textPath href> pointed at a path
 *      that did not exist after hydration and React logged a mismatch. It is
 *      `useId()` now, which is stable across both.
 *   2. `scrollYProgress.clearListeners()` in the cleanup removed EVERY
 *      listener on that motion value, including ones this component did not
 *      add. The cleanup now removes only its own, via the unsubscribe
 *      function `.on()` returns.
 *
 * The shadcn Button that came with it is not vendored: nothing here uses it,
 * and it would have pulled in @radix-ui/react-slot and
 * class-variance-authority for no rendered pixel. */

import { RefObject, useEffect, useId, useRef } from "react";
import { useScroll, UseScrollOptions, useTransform } from "motion/react";

type PreserveAspectRatioAlign =
  | "none"
  | "xMinYMin"
  | "xMidYMin"
  | "xMaxYMin"
  | "xMinYMid"
  | "xMidYMid"
  | "xMaxYMid"
  | "xMinYMax"
  | "xMidYMax"
  | "xMaxYMax";

type PreserveAspectRatioMeetOrSlice = "meet" | "slice";

type PreserveAspectRatio =
  | PreserveAspectRatioAlign
  | `${Exclude<PreserveAspectRatioAlign, "none">} ${PreserveAspectRatioMeetOrSlice}`;

interface AnimatedPathTextProps {
  // Path properties
  path: string;
  pathId?: string;
  pathClassName?: string;
  preserveAspectRatio?: PreserveAspectRatio;
  showPath?: boolean;
  /** Draw the path as a bordered ribbon under the text (two strokes of the
   *  same curve, styled by `.tp-ribbon-edge` / `.tp-ribbon`). */
  ribbon?: boolean;

  // SVG properties
  width?: string | number;
  height?: string | number;
  viewBox?: string;
  svgClassName?: string;

  // Text properties
  text: string;
  textClassName?: string;
  textAnchor?: "start" | "middle" | "end";

  // Animation properties
  animationType?: "auto" | "scroll";

  // Animation properties if animationType is auto
  duration?: number;
  repeatCount?: number | "indefinite";
  easingFunction?: {
    calcMode?: string;
    keyTimes?: string;
    keySplines?: string;
  };

  // Scroll animation properties if animationType is scroll
  scrollContainer?: RefObject<HTMLElement | null>;
  scrollTarget?: RefObject<HTMLElement | null>;
  scrollOffset?: UseScrollOptions["offset"];
  scrollTransformValues?: [number, number];
}

const AnimatedPathText = ({
  path,
  pathId,
  pathClassName,
  preserveAspectRatio = "xMidYMid meet",
  showPath = false,
  ribbon = false,

  width = "100%",
  height = "100%",
  viewBox = "0 0 100 100",
  svgClassName,

  text,
  textClassName,
  textAnchor = "start",

  animationType = "auto",

  duration = 4,
  repeatCount = "indefinite",

  easingFunction = {},

  scrollContainer,
  scrollTarget,
  scrollOffset = ["start end", "end end"],
  scrollTransformValues = [0, 100],
}: AnimatedPathTextProps) => {
  const textPathRefs = useRef<SVGTextPathElement[]>([]);

  const autoId = useId();
  const id = pathId || `animated-path-${autoId.replace(/:/g, "")}`;

  const { scrollYProgress } = useScroll({
    ...(scrollContainer && { container: scrollContainer }),
    ...(scrollTarget && { target: scrollTarget }),
    offset: scrollOffset,
  });

  const t = useTransform(scrollYProgress, [0, 1], scrollTransformValues);

  useEffect(() => {
    if (animationType !== "scroll") return;
    const apply = () => {
      textPathRefs.current.forEach((textPath) => {
        if (textPath) textPath.setAttribute("startOffset", `${t.get()}%`);
      });
    };
    apply();
    return scrollYProgress.on("change", apply);
  }, [scrollYProgress, t, animationType]);

  const animationProps =
    animationType === "auto"
      ? {
          from: "0%",
          to: "100%",
          begin: "0s",
          dur: `${duration}s`,
          repeatCount: repeatCount,
          ...(easingFunction && easingFunction),
        }
      : null;

  return (
    <svg
      className={svgClassName}
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={viewBox}
      preserveAspectRatio={preserveAspectRatio}
    >
      <path
        id={id}
        className={pathClassName}
        d={path}
        stroke={showPath ? "currentColor" : "none"}
        fill="none"
      />
      {ribbon ? (
        <>
          <path d={path} className="tp-ribbon-edge" fill="none" />
          <path d={path} className="tp-ribbon" fill="none" />
        </>
      ) : null}

      <text textAnchor={textAnchor} fill="currentColor">
        <textPath
          className={textClassName}
          href={`#${id}`}
          startOffset={"0%"}
          ref={(ref) => {
            if (ref) textPathRefs.current[0] = ref;
          }}
        >
          {animationType === "auto" && (
            <animate attributeName="startOffset" {...animationProps} />
          )}
          {text}
        </textPath>
      </text>

      {/* Second text element (offset to hide the jump) */}
      {animationType === "auto" && (
        <text textAnchor={textAnchor} fill="currentColor">
          <textPath
            className={textClassName}
            href={`#${id}`}
            startOffset={"-100%"}
            ref={(ref) => {
              if (ref) textPathRefs.current[1] = ref;
            }}
          >
            <animate attributeName="startOffset" {...animationProps} from="-100%" to="0%" />
            {text}
          </textPath>
        </text>
      )}
    </svg>
  );
};

export default AnimatedPathText;
