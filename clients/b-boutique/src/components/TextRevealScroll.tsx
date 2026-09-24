"use client"
import * as React from "react"

/**
 * TextRevealScroll
 * Text starts dim and lights up character-by-character (or word-by-word)
 * as the block scrolls up through the viewport.
 *
 * - No dependencies (plain React). Works in Next.js, Vite, CRA, Astro islands.
 * - Progress: 0 when the block's top reaches `start`% of the viewport height,
 *   1 when it reaches `end`% (defaults 90% → 30%).
 * - Only opacity changes; updates go straight to the DOM (no re-renders).
 * - Respects prefers-reduced-motion (text shows fully lit).
 * - Screen readers get the plain sentence via aria-label.
 *
 * Usage:
 *   <TextRevealScroll as="h2" by="words" className="big-heading">
 *     Above all, we believe great food is more than a meal.
 *   </TextRevealScroll>
 */

type Props = {
    children?: string
    text?: string
    by?: "chars" | "words"
    start?: number // % of viewport height where the reveal begins
    end?: number // % of viewport height where it completes
    dimOpacity?: number // opacity of not-yet-revealed text
    as?: keyof React.JSX.IntrinsicElements
    className?: string
    style?: React.CSSProperties
}

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))

export default function TextRevealScroll({
    children,
    text,
    by = "chars",
    start = 90,
    end = 30,
    dimOpacity = 0.2,
    as = "p",
    className,
    style,
}: Props) {
    const content = (text ?? children ?? "").toString()
    const rootRef = React.useRef<HTMLElement>(null)

    const words = React.useMemo(() => content.split(/(\s+)/), [content])

    React.useEffect(() => {
        const root = rootRef.current
        if (!root) return
        const segs = Array.from(root.querySelectorAll<HTMLSpanElement>("[data-seg]"))
        const n = segs.length
        if (!n) return

        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        if (reduce) {
            segs.forEach((s) => (s.style.opacity = "1"))
            return
        }

        let frame = 0
        const update = () => {
            frame = 0
            const vh = window.innerHeight
            const top = root.getBoundingClientRect().top
            const startY = (vh * start) / 100
            const endY = (vh * end) / 100
            const p = clamp((startY - top) / Math.max(1, startY - endY))
            const lit = p * n
            for (let i = 0; i < n; i++) {
                const local = clamp(lit - i)
                segs[i].style.opacity = String(dimOpacity + (1 - dimOpacity) * local)
            }
        }
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update)
        }

        update()
        window.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", onScroll)
        return () => {
            window.removeEventListener("scroll", onScroll)
            window.removeEventListener("resize", onScroll)
            if (frame) cancelAnimationFrame(frame)
        }
    }, [content, by, start, end, dimOpacity])

    const segStyle: React.CSSProperties = { opacity: dimOpacity, transition: "opacity .08s linear" }

    const Tag = as as React.ElementType
    return (
        <Tag ref={rootRef} className={className} style={style} aria-label={content}>
            {words.map((w, wi) => {
                if (/^\s+$/.test(w)) return <span key={wi} aria-hidden> </span>
                if (!w) return null
                if (by === "words") {
                    return (
                        <span key={wi} data-seg="" aria-hidden style={segStyle}>
                            {w}
                        </span>
                    )
                }
                // chars: keep each word unbreakable so lines only wrap between words
                return (
                    <span key={wi} aria-hidden style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                        {Array.from(w).map((c, ci) => (
                            <span key={ci} data-seg="" style={segStyle}>
                                {c}
                            </span>
                        ))}
                    </span>
                )
            })}
        </Tag>
    )
}
