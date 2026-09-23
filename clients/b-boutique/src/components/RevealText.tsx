"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from "react";

/* A heading whose words rise out of a mask as it scrolls into view
 * (2026-09-23; after the "Vertical Cut Reveal" on 21st.dev, rebuilt here).
 *
 * React renders the words itself, so nothing rewrites React's DOM behind its
 * back (the reason this is not SplitText). Plain string children are split
 * into words; an element child such as <em>statement</em> rises as one unit
 * and keeps its styling.
 *
 * The heading's accessible name is its plain text, set with aria-label, and
 * the word spans are hidden from assistive technology, so a screen reader
 * hears one heading, not a list of words.
 *
 * The hidden state is only applied ("is-armed") by the effect, only to a
 * heading that starts below the screen, and never under reduced motion: with no JavaScript, or with stillness asked for, the
 * heading is simply there. It plays once. */

function plain(node: ReactNode): string {
  return Children.toArray(node)
    .map((c) =>
      typeof c === "string" || typeof c === "number"
        ? String(c)
        : isValidElement(c)
          ? plain((c as ReactElement<{ children?: ReactNode }>).props.children)
          : "",
    )
    .join("");
}

export function RevealText({
  as: Tag = "h2",
  className,
  id,
  children,
}: {
  as?: ElementType;
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    /* Already on screen when the page opens: leave it be. Hiding it now
       only to replay it would flicker, and could hold back the paint that
       counts as the page having loaded. */
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.classList.add("is-armed");
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.classList.add("is-in");
        io.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  let i = 0;
  const word = (content: ReactNode, key: string) => (
    <span key={key} className="rt-mask">
      <span className="rt-word" style={{ ["--i" as string]: i++ }}>
        {content}
      </span>
    </span>
  );

  const parts: ReactNode[] = [];
  Children.toArray(children).forEach((c, n) => {
    if (typeof c === "string") {
      /* Keep the spaces as real text between the masks, so the heading
         wraps exactly where it did before. */
      c.split(/(\s+)/).forEach((w, k) => {
        if (!w) return;
        parts.push(/^\s+$/.test(w) ? w : word(w, `${n}-${k}`));
      });
    } else if (isValidElement(c) && c.type === "br") {
      parts.push(c);
    } else {
      parts.push(word(c, `${n}`));
    }
  });

  return (
    <Tag ref={ref} id={id} className={`rt ${className ?? ""}`} aria-label={plain(children)}>
      <span aria-hidden="true">{parts}</span>
    </Tag>
  );
}
